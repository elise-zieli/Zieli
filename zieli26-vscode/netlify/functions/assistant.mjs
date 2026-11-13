// =====================================================================
// ZIELI – fonction Netlify « assistant » (adresse /api/assistant)
// Bouton « Une question ? » : transmet la question au workflow n8n « Zieli - assistant »
// et renvoie sa réponse au navigateur. La clé n8n reste chez Netlify.
// (Traduction de Poser-Question dans serveur.ps1.)
// =====================================================================
import { CLES_ENTREPRISES, cleN8n, repondre, appelAutorise } from "../lib/commun.mjs";

const URL_ASSISTANT = "https://n8n.jedha.co/webhook/zieli-assistant";
const JSON_UTF8 = "application/json; charset=utf-8";

async function poserQuestion(demande) {
  const cle = cleN8n();
  if (!cle) throw new Error("Clé n8n absente (variable Netlify n8n).");

  const question = String(demande.question ?? "").trim();
  if (!question || question.length > 500) throw new Error("Question vide ou trop longue.");

  const entreprise = String(demande.entreprise ?? "");
  let idAirtable = Object.keys(CLES_ENTREPRISES).find((id) => CLES_ENTREPRISES[id] === entreprise) ?? "";
  if (!idAirtable && /^rec[A-Za-z0-9]{14}$/.test(entreprise)) idAirtable = entreprise;

  // Les derniers échanges (6 au plus) servent aux questions de suite (« et pour l'épargne ? »).
  const historique = (Array.isArray(demande.historique) ? demande.historique : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-6)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }));

  const reponse = await fetch(URL_ASSISTANT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8", "X-Zieli-Cle": cle },
    body: JSON.stringify({ question, entrepriseId: idAirtable, historique }),
    signal: AbortSignal.timeout(25000),
  });
  if (!reponse.ok) throw new Error("n8n a répondu " + reponse.status + ".");
  const contenu = await reponse.json();
  if (contenu.ok !== true) throw new Error("Réponse inattendue de n8n.");
  return { reponse: String(contenu.reponse ?? ""), sources: Array.isArray(contenu.sources) ? contenu.sources : [] };
}

export default async (req) => {
  if (!appelAutorise(req)) return repondre("interdit", "text/plain; charset=utf-8", 403);
  try {
    const resultat = await poserQuestion(await req.json());
    console.log("n8n : question à l'assistant traitée");
    return repondre(JSON.stringify(resultat), JSON_UTF8);
  } catch (e) {
    console.log("n8n : ECHEC assistant - " + e.message);
    return repondre(JSON.stringify({ erreur: true }), JSON_UTF8, 502);
  }
};

export const config = { path: "/api/assistant" };
