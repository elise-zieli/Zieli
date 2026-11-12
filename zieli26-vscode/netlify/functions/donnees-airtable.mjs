// =====================================================================
// ZIELI 26 – fonction Netlify « donnees-airtable » (adresse /api/donnees-airtable.js)
// Lit la base Airtable "zieli26" et renvoie un petit script qui remplace
// les chiffres fictifs de donnees.js par les vrais.
// (Traduction de Construire-Js et Script-Erreur dans serveur.ps1.)
// =====================================================================
import { CLES_ENTREPRISES, cleAirtable, repondre } from "../lib/commun.mjs";

const URL_AIRTABLE = "https://api.airtable.com/v0";
const BASE = "app3K4PQkkZFAxipC";
const T_ENTREPRISES = "tblna9EWuSbSHsXT8";
const T_CATEGORIES = "tblOpdvbRhk7UMNj6";
const T_TRANSACTIONS = "tblZDrxbfp6fR50I4";
const T_PREVISIONNEL = "tblnrDOjAypfP1ma8";

// Champs Catégories
const C_LIGNE = "fld63As75Eht1RAue", C_PARTIE = "fldUkquQNcPpiHKuo", C_ORDRE = "flduaR7gdMkXmz6Ka";
// Champs Transactions
const TR_DATE = "fldKwSmDpVraHm3WM", TR_MOIS = "fldlxWUnL18EYTXW5", TR_MONTANT = "fldYjH1uay2cjd1RB";
const TR_ENT = "fldqbmdk7kY1OOfy2", TR_CAT = "fld2g5i8mTQRXE0Ow";
// Champs Prévisionnel
const PR_MOIS = "fldk5cU02LEVGmX3D", PR_MONTANT = "fldhIbKEWXfZHsffP";
const PR_ENT = "fldfr4IRb9Qso1ZOw", PR_CAT = "fldwSzh6mDwB3y1OF";
// Champs Entreprises (lus par leur nom)
const E_NOM = "Name", E_COURANT = "Solde initial courant", E_DATE = "Date du solde initial";
const E_EPARGNE = "Solde initial épargne", E_SEUIL = "Seuil d'alerte";

const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

async function lireTable(jeton, table, champs) {
  const lignes = [];
  let offset = null;
  do {
    const params = new URLSearchParams({ pageSize: "100" });
    if (champs) {
      params.append("returnFieldsByFieldId", "true");
      for (const c of champs) params.append("fields[]", c);
    }
    if (offset) params.append("offset", offset);
    const reponse = await fetch(`${URL_AIRTABLE}/${BASE}/${table}?${params}`, {
      headers: { Authorization: `Bearer ${jeton}` },
    });
    if (!reponse.ok) throw new Error(`Airtable a répondu ${reponse.status} (table ${table}).`);
    const page = await reponse.json();
    lignes.push(...page.records);
    offset = page.offset;
    // Airtable accepte au plus 5 appels par seconde.
    if (offset) await attendre(250);
  } while (offset);
  return lignes;
}

// "2026-05" décalé de +1 → "2026-06"
function moisDecale(cle, decalage) {
  const [a, m] = cle.split("-").map(Number);
  const total = a * 12 + (m - 1) + decalage;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

const estNombre = (v) => typeof v === "number" && Number.isFinite(v);
const unSeul = (v) => (Array.isArray(v) ? (v.length === 1 ? v[0] : null) : v ?? null);
const arrondi = (x) => Math.round(x * 100) / 100;

// Ajoute une ligne (transaction ou prévisionnel) dans les totaux par entreprise/catégorie/mois.
// Renvoie false si la ligne est incomplète.
function ajouterLigne(totaux, presence, type, ent, cat, mois, montant) {
  const idEnt = unSeul(ent), idCat = unSeul(cat);
  if (idEnt === null || idCat === null) return false;
  if (!estNombre(montant) || mois === undefined || mois === null || String(mois) === "") return false;
  const cle = `${type}|${idEnt}|${idCat}|${mois}`;
  totaux[cle] = (totaux[cle] ?? 0) + montant;
  presence[`${idEnt}|${idCat}|${mois}`] = true;
  return true;
}

async function construireJs() {
  const jeton = cleAirtable();
  if (!jeton) throw new Error("Clé Airtable absente (variable Netlify AIRTABLE).");

  const entreprises = await lireTable(jeton, T_ENTREPRISES);
  const categories = await lireTable(jeton, T_CATEGORIES, [C_LIGNE, C_PARTIE, C_ORDRE]);
  const transactions = await lireTable(jeton, T_TRANSACTIONS, [TR_DATE, TR_MOIS, TR_MONTANT, TR_ENT, TR_CAT]);
  const previsionnel = await lireTable(jeton, T_PREVISIONNEL, [PR_MOIS, PR_MONTANT, PR_ENT, PR_CAT]);

  const totaux = {}, presence = {}, derniereDate = {};
  let ignorees = 0;

  for (const t of transactions) {
    const f = t.fields;
    if (ajouterLigne(totaux, presence, "R", f[TR_ENT], f[TR_CAT], f[TR_MOIS], f[TR_MONTANT])) {
      const id = unSeul(f[TR_ENT]);
      const d = String(f[TR_DATE] ?? "");
      if (!(id in derniereDate) || d > derniereDate[id]) derniereDate[id] = d;
    } else ignorees++;
  }
  for (const p of previsionnel) {
    const f = p.fields;
    if (!ajouterLigne(totaux, presence, "P", f[PR_ENT], f[PR_CAT], f[PR_MOIS], f[PR_MONTANT])) ignorees++;
  }

  const categoriesTriees = [...categories].sort(
    (a, b) => Number(a.fields[C_ORDRE] ?? 0) - Number(b.fields[C_ORDRE] ?? 0)
  );
  // Mois en cours à l'heure de Paris.
  const moisCourant = new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit" })
    .format(new Date()).slice(0, 7);
  const dernierMoisReel = moisDecale(moisCourant, -1);
  const moisFin = moisDecale(moisCourant, 6);

  const resultat = {};
  for (const e of entreprises) {
    const f = e.fields;
    const nom = String(f[E_NOM] ?? "");
    const dateSolde = String(f[E_DATE] ?? "");
    if (!dateSolde) throw new Error(`Date du solde initial manquante pour : ${nom}.`);

    // Liste des mois : du mois qui suit le solde initial jusqu'au mois en cours + 6.
    const debut = moisDecale(dateSolde.slice(0, 7), 1);
    if (debut > dernierMoisReel) {
      throw new Error(`Solde initial trop récent pour : ${nom} (il faut au moins un mois terminé après cette date).`);
    }
    const listeMois = [];
    for (let m = debut; m <= moisFin; m = moisDecale(m, 1)) listeMois.push(m);

    const lignes = [];
    for (const c of categoriesTriees) {
      if (!listeMois.some((mo) => presence[`${e.id}|${c.id}|${mo}`])) continue;
      const prevu = [], reel = [];
      for (const mo of listeMois) {
        const cleP = `P|${e.id}|${c.id}|${mo}`, cleR = `R|${e.id}|${c.id}|${mo}`;
        prevu.push(cleP in totaux ? arrondi(totaux[cleP]) : 0);
        if (mo > moisCourant) reel.push(null);
        else reel.push(cleR in totaux ? arrondi(totaux[cleR]) : 0);
      }
      lignes.push({
        nom: String(c.fields[C_LIGNE] ?? "").trim(),
        partie: String(c.fields[C_PARTIE] ?? ""),
        prevu,
        reel,
      });
    }

    const objet = {
      entreprise: nom,
      dateMiseAJour: derniereDate[e.id] ?? dateSolde,
      soldeInitial: { date: dateSolde, courant: Number(f[E_COURANT] ?? 0), epargne: Number(f[E_EPARGNE] ?? 0) },
      mois: listeMois,
      dernierMoisReel,
      categories: lignes,
    };
    // Sans champ "Seuil d'alerte" dans Airtable, app.js applique 5 000 €.
    if (estNombre(f[E_SEUIL])) objet.seuilAlerte = f[E_SEUIL];

    resultat[CLES_ENTREPRISES[e.id] ?? e.id] = objet;
  }

  let pied = "Zieli 26 – données Airtable (base zieli26)";
  if (ignorees > 0) pied += ` – ${ignorees} ligne(s) Airtable incomplète(s) non comptée(s)`;

  return "document.getElementById('bouton-synchro').hidden=false;\n" +
    "Object.keys(ENTREPRISES).forEach(function(c){delete ENTREPRISES[c];});\n" +
    `Object.assign(ENTREPRISES,${JSON.stringify(resultat)});\n` +
    `document.querySelector('footer').textContent=${JSON.stringify(pied)};\n`;
}

function scriptErreur(message) {
  const texte = `Données Airtable indisponibles : ${message} Les chiffres affichés sont FICTIFS.`;
  return "document.getElementById('bouton-synchro').hidden=false;\n" +
    "(function(){var b=document.createElement('div');" +
    "b.style.cssText='background:#c0392b;color:#fff;padding:12px 16px;font:600 15px sans-serif;position:relative;z-index:1000';" +
    `b.textContent=${JSON.stringify(texte)};document.body.insertBefore(b,document.body.firstChild);})();\n`;
}

export default async () => {
  let js;
  try {
    js = await construireJs();
    console.log("Airtable : données lues");
  } catch (e) {
    console.log("Airtable : ECHEC - " + e.message);
    js = scriptErreur(e.message);
  }
  return repondre(js, "text/javascript; charset=utf-8");
};

export const config = { path: "/api/donnees-airtable.js" };
