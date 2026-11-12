// =====================================================================
// ZIELI 26 – fonction Netlify « remarque » (adresse /api/remarque)
// Formulaire « Une remarque ? » : transmet la remarque au workflow n8n.
// La clé du webhook reste chez Netlify : le navigateur ne la voit jamais.
// (Traduction de Transmettre-Remarque dans serveur.ps1.)
// =====================================================================
import { CLES_ENTREPRISES, cleN8n, repondre, appelAutorise } from "../lib/commun.mjs";

const URL_N8N = "https://n8n.jedha.co/webhook/zieli-remarques";

async function transmettre(remarque) {
  const cle = cleN8n();
  if (!cle) throw new Error("Clé n8n absente (variable Netlify n8n).");

  const entreprise = String(remarque.entreprise ?? "");
  let idAirtable = Object.keys(CLES_ENTREPRISES).find((id) => CLES_ENTREPRISES[id] === entreprise);
  if (!idAirtable && /^rec[A-Za-z0-9]{14}$/.test(entreprise)) idAirtable = entreprise;
  if (!idAirtable) throw new Error("Entreprise inconnue.");

  const type = String(remarque.type ?? "");
  if (!["", "previsionnel", "ecarts", "echange"].includes(type)) throw new Error("Type de remarque inconnu.");
  const mois = String(remarque.mois ?? "");
  if (!/^(\d{4}-\d{2}|plusieurs)?$/.test(mois)) throw new Error("Mois invalide.");

  const reponse = await fetch(URL_N8N, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8", "X-Zieli-Cle": cle },
    body: JSON.stringify({
      entrepriseId: idAirtable,
      type,
      texte: String(remarque.texte ?? ""),
      urgent: remarque.urgent === true,
      mois,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!reponse.ok) throw new Error("n8n a répondu " + reponse.status + ".");
  const contenu = await reponse.json();
  if (contenu.ok !== true) throw new Error("Réponse inattendue de n8n.");
}

export default async (req) => {
  if (!appelAutorise(req)) return repondre("interdit", "text/plain; charset=utf-8", 403);
  try {
    await transmettre(await req.json());
    console.log("n8n : remarque transmise");
    return repondre("ok", "text/plain; charset=utf-8");
  } catch (e) {
    console.log("n8n : ECHEC - " + e.message);
    return repondre("erreur", "text/plain; charset=utf-8", 502);
  }
};

export const config = { path: "/api/remarque" };
