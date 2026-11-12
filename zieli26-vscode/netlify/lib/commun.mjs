// =====================================================================
// ZIELI 26 – netlify/lib/commun.mjs
// Réglages partagés par les fonctions Netlify (traduction de serveur.ps1).
// =====================================================================

// Identifiants utilisés par les comptes de démonstration de donnees.js.
// Une entreprise absente de cette liste garde son identifiant Airtable (visible par l'Admin).
export const CLES_ENTREPRISES = {
  rec53om2huapFZgGN: "ent-librairie",
  recSL1ALPdEGzbmKI: "ent-boulangerie",
};

// Clés secrètes : enregistrées dans Netlify (Site configuration → Environment variables).
export const cleAirtable = () => (process.env.AIRTABLE || "").trim();
// Variable nommée « n8n » dans Netlify (majuscules et minuscules acceptées).
export const cleN8n = () => (process.env.n8n || process.env.N8N || "").trim();

// Réponse sans cache : une modification dans Airtable apparaît au rechargement.
export function repondre(texte, type, statut = 200) {
  return new Response(texte, {
    status: statut,
    headers: { "Content-Type": type, "Cache-Control": "no-store" },
  });
}

// L'en-tête personnalisé empêche un autre site web de déclencher l'appel.
export const appelAutorise = (req) =>
  req.method === "POST" && req.headers.get("X-Zieli-Synchro") === "1";
