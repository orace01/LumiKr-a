import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Order } from './types'

/**
 * Où sont enregistrées les commandes. Le fichier JSON suffit pour démarrer sur
 * un seul serveur ; pour plusieurs instances ou un hébergement « serverless »,
 * il faudra une base de données qui respecte cette même interface.
 */
export interface OrderStore {
  get(id: string): Promise<Order | null>
  findByPaymentReference(reference: string): Promise<Order | null>
  list(): Promise<Order[]>
  create(order: Order): Promise<void>
  /** Applique `change` à la commande et enregistre le résultat. */
  update(id: string, change: (order: Order) => Order): Promise<Order>
}

/** En mémoire seulement : pour les tests. */
export class MemoryOrderStore implements OrderStore {
  protected orders = new Map<string, Order>()

  async get(id: string) {
    const order = this.orders.get(id)
    return order ? structuredClone(order) : null
  }

  async findByPaymentReference(reference: string) {
    for (const order of this.orders.values()) if (order.payment.reference === reference) return structuredClone(order)
    return null
  }

  async list() {
    return [...this.orders.values()].map((order) => structuredClone(order))
  }

  async create(order: Order) {
    if (this.orders.has(order.id)) throw new Error(`Commande ${order.id} déjà enregistrée.`)
    this.orders.set(order.id, structuredClone(order))
    await this.persist()
  }

  async update(id: string, change: (order: Order) => Order) {
    const current = this.orders.get(id)
    if (!current) throw new Error(`Commande ${id} introuvable.`)
    const next = change(structuredClone(current))
    this.orders.set(id, next)
    await this.persist()
    return structuredClone(next)
  }

  protected async persist() {}
}

/** Toutes les commandes dans un fichier JSON, réécrit entièrement à chaque changement. */
export class JsonFileOrderStore extends MemoryOrderStore {
  private readonly file: string
  private loaded: Promise<void> | null = null
  private writing: Promise<void> = Promise.resolve()

  constructor(dataDir: string) {
    super()
    this.file = path.join(dataDir, 'orders.json')
  }

  private load() {
    this.loaded ??= (async () => {
      try {
        const saved = JSON.parse(await readFile(this.file, 'utf8')) as Order[]
        for (const order of saved) this.orders.set(order.id, order)
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      }
    })()
    return this.loaded
  }

  override async get(id: string) {
    await this.load()
    return super.get(id)
  }

  override async findByPaymentReference(reference: string) {
    await this.load()
    return super.findByPaymentReference(reference)
  }

  override async list() {
    await this.load()
    return super.list()
  }

  override async create(order: Order) {
    await this.load()
    return super.create(order)
  }

  override async update(id: string, change: (order: Order) => Order) {
    await this.load()
    return super.update(id, change)
  }

  // Écritures en file : jamais deux à la fois, et un fichier temporaire
  // renommé d'un coup, pour ne pas laisser un JSON à moitié écrit.
  protected override persist() {
    const snapshot = JSON.stringify([...this.orders.values()], null, 2)
    this.writing = this.writing.then(async () => {
      await mkdir(path.dirname(this.file), { recursive: true })
      const temp = `${this.file}.tmp`
      await writeFile(temp, snapshot, 'utf8')
      await rename(temp, this.file)
    })
    return this.writing
  }
}
