import type { ShopMode } from '../src/shop/types'

// Réglages du serveur, lus dans les variables d'environnement. Les secrets
// (clés du prestataire de paiement, de CJ) ne sont lus QUE par les fichiers de
// server/payment et server/fulfillment : ils ne partent jamais vers le site.

export interface ServerConfig {
  /**
   * `demo` : prix fictifs pour les formats sans prix, paiement simulé sur
   * /paiement-demo, fournisseur simulé. `live` : vente réelle.
   * Variable SHOP_MODE ; par défaut `demo` avec `npm run dev` et `live` avec
   * `npm start`, pour qu'un site en ligne ne tourne jamais en démo par oubli.
   */
  mode: ShopMode
  /** Adresse publique du site (https://…), pour les liens de retour du paiement. */
  publicUrl: string | null
  /** Dossier où sont enregistrées les commandes (fichier JSON). */
  dataDir: string
  /** Jeton d'accès à GET /api/admin/orders ; route désactivée s'il est absent. */
  adminToken: string | null
  /**
   * Secret des tâches planifiées de Vercel (variable CRON_SECRET, que Vercel
   * envoie lui-même) ; GET /api/cron/sync est désactivée sans lui.
   */
  cronSecret?: string | null
}

export function readConfig(env: NodeJS.ProcessEnv = process.env, fallbackMode: ShopMode = 'demo'): ServerConfig {
  const mode = env.SHOP_MODE === 'demo' || env.SHOP_MODE === 'live' ? env.SHOP_MODE : fallbackMode
  return {
    mode,
    // Sur Vercel, à défaut de PUBLIC_URL : le domaine de production du projet.
    publicUrl: env.PUBLIC_URL
      ? env.PUBLIC_URL.replace(/\/+$/, '')
      : env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
        : null,
    dataDir: env.DATA_DIR ?? 'data',
    adminToken: env.ADMIN_TOKEN || null,
    cronSecret: env.CRON_SECRET || null,
  }
}
