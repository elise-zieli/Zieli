// =====================================================================
// ZIELI 26 – fonction Netlify « synchroniser » (adresse /api/synchroniser)
// Bouton « Synchronisation ». Sur Netlify il n'y a pas de copie en mémoire :
// chaque chargement de la page relit déjà Airtable. Il suffit donc de répondre
// « ok » pour que la page se recharge avec les derniers chiffres.
// =====================================================================
import { repondre, appelAutorise } from "../lib/commun.mjs";

export default async (req) => {
  if (!appelAutorise(req)) return repondre("interdit", "text/plain; charset=utf-8", 403);
  return repondre("ok", "text/plain; charset=utf-8");
};

export const config = { path: "/api/synchroniser" };
