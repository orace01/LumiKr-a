import path from 'node:path'
import { product } from '../src/config/product'
import { shop } from '../src/config/shop'
import { CjClient, CjApiError } from './fulfillment/cj-client'
import { describeCjError, missingCjConfig, readCjSettings, type CjOrderDetail } from './fulfillment/cj'

// Outil de configuration CJ, en lecture seule : il n'envoie aucune commande et
// ne modifie rien sur le compte CJ.
//   npm run cj -- verifier
//   npm run cj -- produit [SKU ou pid]
//   npm run cj -- livraison <vid> [pays] [code postal]
//   npm run cj -- commande <numéro LK-… ou numéro CJ>

// SKU CJ du produit : c'est le nom du dossier d'images fourni par CJ.
const DEFAULT_PRODUCT_SKU = 'CJYD2333071'

interface CjVariant {
  vid: string
  variantSku?: string
  variantNameEn?: string
  variantKey?: string
  variantSellPrice?: number
  variantWeight?: number
  variantLength?: number
  variantWidth?: number
  variantHeight?: number
}

interface CjStock {
  countryCode: string
  totalInventoryNum: number
}

interface CjProduct {
  pid: string
  productNameEn?: string
  productSku?: string
  variants?: CjVariant[]
}

interface CjFreight {
  logisticName: string
  logisticPrice: number
  logisticAging?: string
}

function table(rows: Record<string, string | number>[]) {
  if (rows.length === 0) return
  const columns = Object.keys(rows[0])
  const widths = columns.map((column) => Math.max(column.length, ...rows.map((row) => String(row[column] ?? '').length)))
  const line = (values: string[]) => values.map((value, index) => value.padEnd(widths[index])).join('  ')
  console.log(line(columns))
  console.log(line(widths.map((width) => '-'.repeat(width))))
  for (const row of rows) console.log(line(columns.map((column) => String(row[column] ?? ''))))
}

function loadEnv() {
  try {
    process.loadEnvFile('.env')
  } catch {
    // Pas de fichier .env : les variables viennent de l'environnement.
  }
}

function client() {
  const { apiKey } = readCjSettings()
  if (!apiKey) {
    console.error('CJ_API_KEY manque. Ajoute-la dans le fichier .env (voir .env.example).')
    process.exit(1)
  }
  return new CjClient({ apiKey, tokenFile: path.join(process.env.DATA_DIR ?? 'data', 'cj-token.json') })
}

async function verify() {
  const cj = client()
  const token = await cj.ensureToken()
  console.log(`Connexion à CJ réussie (compte ${token.openId ?? 'inconnu'}).`)
  console.log(`Jeton valable jusqu’au ${token.accessTokenExpiryDate}.`)
  const missing = missingCjConfig()
  if (missing.length === 0) console.log('Configuration CJ complète.')
  else console.log(`Reste à renseigner : ${missing.join(', ')}.`)
}

async function showProduct(reference = DEFAULT_PRODUCT_SKU) {
  const query: Record<string, string> = /^CJ/i.test(reference) ? { productSku: reference } : { pid: reference }
  const cj = client()
  const data = await cj.call<CjProduct>('GET', '/product/query', { query })
  console.log(`${data.productNameEn ?? 'Produit'} · SKU ${data.productSku ?? '?'} · pid ${data.pid}\n`)
  const rows = []
  for (const variant of data.variants ?? []) {
    // Le stock par entrepôt n'est pas dans la fiche produit.
    const stocks = await cj.call<CjStock[] | null>('GET', '/product/stock/queryByVid', { query: { vid: variant.vid } })
    rows.push({
      vid: variant.vid,
      variante: variant.variantKey || variant.variantNameEn || '',
      sku: variant.variantSku ?? '',
      'prix CJ (USD)': variant.variantSellPrice ?? '',
      'poids (g)': variant.variantWeight ?? '',
      stock: (stocks ?? []).map((stock) => `${stock.countryCode} ${stock.totalInventoryNum}`).join(', '),
    })
  }
  table(rows)
  console.log('\nÀ reporter dans src/config/product.ts : le vid de chaque format, dans `cjVariantId`.')
  console.log(`Formats de la boutique : ${product.variants.map((variant) => variant.label).join(', ')}.`)
}

async function showShipping(vid: string | undefined, country = shop.countries[0]?.code ?? 'FR', zip?: string) {
  if (!vid) {
    console.error('Indique un vid : npm run cj -- livraison <vid> [pays] [code postal]')
    process.exit(1)
  }
  const { fromCountryCode } = readCjSettings()
  const options = await client().call<CjFreight[]>('POST', '/logistic/freightCalculate', {
    body: {
      startCountryCode: fromCountryCode,
      endCountryCode: country.toUpperCase(),
      ...(zip ? { zip } : {}),
      products: [{ vid, quantity: 1 }],
    },
  })
  console.log(`Modes d’envoi de ${fromCountryCode} vers ${country.toUpperCase()}, pour un exemplaire :\n`)
  table(
    [...options]
      .sort((a, b) => a.logisticPrice - b.logisticPrice)
      .map((option) => ({
        logisticName: option.logisticName,
        'prix (USD)': option.logisticPrice,
        'délai (jours)': option.logisticAging ?? '',
      })),
  )
  console.log('\nÀ reporter dans src/config/shop.ts : le logisticName choisi, dans `cjLogisticName`,')
  console.log('ainsi que le prix et le délai que tu annonces au client (`price`, `delay`).')
  console.log('Ce sont des estimations : le port facturé sur une vraie commande peut être plus élevé.')
  console.log('Le montant exact se lit sur une commande de test (CJ_SANDBOX=1) : npm run cj -- commande <numéro>.')
}

async function showOrder(reference: string | undefined) {
  if (!reference) {
    console.error('Indique un numéro de commande : npm run cj -- commande LK-XXXXXX')
    process.exit(1)
  }
  const order = await client().call<CjOrderDetail>('GET', '/shopping/order/getOrderDetail', {
    query: { orderId: reference },
  })
  table([
    {
      'commande CJ': order.orderId,
      état: order.orderStatus,
      envoi: order.logisticName ?? '',
      suivi: order.trackNumber ?? '',
      'produits (USD)': order.productAmount ?? '',
      'port (USD)': order.postageAmount ?? '',
      'total (USD)': order.orderAmount ?? '',
    },
  ])
  if (order.isSandbox === 1) console.log('\nCommande de test (sandbox) : ni payée ni expédiée.')
}

function help() {
  console.log(`Outil CJdropshipping (lecture seule)

  npm run cj -- verifier                         teste la clé API et la configuration
  npm run cj -- produit [SKU ou pid]             variantes du produit et leurs vid (défaut ${DEFAULT_PRODUCT_SKU})
  npm run cj -- livraison <vid> [pays] [cp]      modes d’envoi possibles et leur prix
  npm run cj -- commande <numéro>                état d’une commande chez CJ`)
}

async function main() {
  loadEnv()
  const [command, ...args] = process.argv.slice(2)
  switch (command) {
    case 'verifier':
      return verify()
    case 'produit':
      return showProduct(args[0])
    case 'livraison':
      return showShipping(args[0], args[1], args[2])
    case 'commande':
      return showOrder(args[0])
    default:
      return help()
  }
}

main().catch((error) => {
  console.error(error instanceof CjApiError ? describeCjError(error) : error)
  process.exit(1)
})
