// =====================================================================
// ZIELI 26 – app.js
// Connexion, calculs de trésorerie et affichage du tableau de bord.
//
// Ce fichier est lu par le navigateur APRÈS donnees.js (voir le bas de index.html).
// Il peut donc utiliser tout ce que donnees.js a défini : ENTREPRISES, UTILISATEURS…
//
// ---------------------------------------------------------------------
// PETIT LEXIQUE POUR LIRE CE FICHIER
// ---------------------------------------------------------------------
// //  texte                 → un commentaire : ignoré par le navigateur, écrit pour les humains.
// const nom = valeur;       → crée une « boîte » nommée qui contient une valeur et ne changera plus.
// let nom = valeur;         → pareil, mais la valeur pourra changer plus tard.
// function nom(a, b) {…}    → une fonction : une suite d'instructions qu'on peut réutiliser.
//                             a et b sont les informations qu'on lui donne (les « paramètres »).
// (a) => …                  → une fonction écrite en version courte (« fonction fléchée »).
// return valeur;            → la fonction s'arrête et renvoie cette valeur.
// [1, 2, 3]                 → une liste (un « tableau ») ; le 1er élément est à la position 0.
// { cle: valeur }           → un « objet » : un ensemble d'informations rangées par nom.
// objet.cle                 → lire une information d'un objet (ex. DONNEES.entreprise).
// if (condition) {…} else {…} → si la condition est vraie, faire ceci, sinon faire cela.
// a ? b : c                 → version courte de « si a alors b sinon c ».
// a ?? b                    → « a, ou b si a est vide (null) ».
// === / !==                 → « est égal à » / « est différent de ».
// && / || / !               → « et » / « ou » / « non ».
// `texte ${valeur}`         → un texte dans lequel on insère une valeur (guillemets obliques).
// liste.map(f)              → crée une nouvelle liste en appliquant f à chaque élément.
// liste.filter(f)           → garde seulement les éléments pour lesquels f répond « vrai ».
// liste.find(f)             → renvoie le premier élément pour lequel f répond « vrai ».
// liste.forEach(f)          → applique f à chaque élément (sans créer de nouvelle liste).
// liste.join("")            → colle tous les éléments d'une liste en un seul texte.
// document.getElementById("x") → va chercher dans la page l'élément HTML qui a id="x".
// element.textContent = "…" → remplace le texte de cet élément.
// element.innerHTML = "…"   → remplace le contenu HTML de cet élément.
// element.classList.add("x")→ ajoute la classe CSS "x" (qui change son apparence, voir styles.css).
// element.addEventListener("click", f) → « quand on clique sur cet élément, exécute f ».
// =====================================================================



// =====================================================================
// 3.0 CONNEXION – qui est connecté, et quelle entreprise il a le droit de voir
// =====================================================================
// ⚠ MAQUETTE SEULEMENT : ici, la vérification du mot de passe se fait dans le navigateur.
// N'importe qui peut donc lire les mots de passe dans donnees.js. Dans la vraie application
// (Lovable), la connexion est vérifiée par le serveur.

// Lit la session enregistrée dans le navigateur (qui est connecté ?).
// sessionStorage = petite mémoire du navigateur, effacée quand on ferme l'onglet.
// JSON.parse transforme le texte enregistré en objet utilisable.
// try / catch : si la lecture échoue (navigateur qui bloque), on renvoie null au lieu de planter.
function lireSession() {
  try { return JSON.parse(sessionStorage.getItem("zieli-session")); } catch (e) { return null; }
}

// Enregistre la session (après connexion) ou l'efface (si on passe null, à la déconnexion).
// JSON.stringify transforme l'objet en texte, car sessionStorage ne stocke que du texte.
function ecrireSession(session) {
  try {
    session ? sessionStorage.setItem("zieli-session", JSON.stringify(session))
            : sessionStorage.removeItem("zieli-session");
  } catch (e) { /* stockage indisponible : la session durera le temps de la page */ }
}

// La session en cours (ou null si personne n'est connecté).
const SESSION = lireSession();

// L'utilisateur connecté : on cherche dans la liste UTILISATEURS (donnees.js)
// celui dont l'email correspond à la session. Si pas de session, UTILISATEUR vaut null.
const UTILISATEUR = SESSION && UTILISATEURS.find((u) => u.email === SESSION.email);

// RÈGLE D'ACCÈS – quelle entreprise afficher ?
// - personne de connecté            → aucune (null)
// - Admin                           → l'entreprise choisie dans le menu,
//                                     ou la première de la liste si rien n'a été choisi
// - Dirigeant                       → UNIQUEMENT son entreprise (il ne peut pas en choisir une autre)
const ENTREPRISE_ID = !UTILISATEUR ? null
  : UTILISATEUR.role === "Admin" ? (ENTREPRISES[SESSION.entrepriseChoisie] ? SESSION.entrepriseChoisie : Object.keys(ENTREPRISES)[0])
  : UTILISATEUR.entreprise;

// ÉCRAN DE CONNEXION : ce qui se passe quand on clique sur « Se connecter ».
// "submit" = l'envoi du formulaire (clic sur le bouton ou touche Entrée).
document.getElementById("form-connexion").addEventListener("submit", (evenement) => {
  // Par défaut, un formulaire recharge la page : on l'en empêche.
  evenement.preventDefault();

  // On lit ce qui a été tapé. trim() enlève les espaces en trop, toLowerCase() met en minuscules
  // (pour que « Elise.Zieli@Test.exemple » marche aussi). Le mot de passe, lui, reste tel quel.
  const email = document.getElementById("champ-email").value.trim().toLowerCase();
  const mdp = document.getElementById("champ-mdp").value;

  // On cherche un utilisateur avec CET email ET CE mot de passe.
  const u = UTILISATEURS.find((x) => x.email.toLowerCase() === email && x.motDePasse === mdp);

  // Pas trouvé : message d'erreur, et on s'arrête là (return).
  if (!u) {
    document.getElementById("erreur-connexion").textContent = "Email ou mot de passe incorrect.";
    return;
  }

  // Trouvé : on enregistre la session puis on recharge la page, qui affichera le tableau de bord.
  ecrireSession({ email: u.email });
  location.reload();
});

// Afficher soit l'écran de connexion, soit le tableau de bord.
// (Les deux sont cachés par défaut dans styles.css ; la classe "visible" les fait apparaître.)
if (!UTILISATEUR) {
  document.getElementById("ecran-connexion").classList.add("visible");
} else {
  document.getElementById("tableau-de-bord").classList.add("visible");

  // Barre du haut : « Elise · Administratrice » ou « Julie · Dirigeant ».
  document.getElementById("utilisateur-connecte").textContent =
    UTILISATEUR.nom + " · " + (UTILISATEUR.role === "Admin" ? "Administratrice" : "Dirigeant");

  // Bouton « Se déconnecter » : on efface la session et on recharge → retour à l'écran de connexion.
  document.getElementById("bouton-deconnexion").addEventListener("click", () => {
    ecrireSession(null);
    location.reload();
  });

  // Bouton « Synchronisation » (visible seulement avec serveur.ps1) : relit Airtable tout de suite,
  // puis recharge la page. En cas d'échec, les chiffres déjà affichés restent en place.
  const boutonSynchro = document.getElementById("bouton-synchro");
  boutonSynchro.addEventListener("click", async () => {
    const message = document.getElementById("message-synchro");
    message.textContent = "";
    boutonSynchro.disabled = true;
    boutonSynchro.textContent = "Synchronisation en cours…";
    try {
      const reponse = await fetch("api/synchroniser", { method: "POST", headers: { "X-Zieli-Synchro": "1" } });
      if (!reponse.ok) throw new Error("échec");
      location.reload();
    } catch (e) {
      message.textContent = "La synchronisation a échoué. Vérifiez votre connexion et réessayez.";
      boutonSynchro.disabled = false;
      boutonSynchro.textContent = "Synchronisation";
    }
  });

  // Menu « Entreprise affichée » : seulement pour l'Admin.
  if (UTILISATEUR.role === "Admin") {
    const choix = document.getElementById("choix-entreprise");

    // On fabrique une option <option> par entreprise.
    // Object.entries(ENTREPRISES) donne des paires [identifiant, données de l'entreprise].
    // "selected" coche l'entreprise actuellement affichée.
    choix.innerHTML = Object.entries(ENTREPRISES)
      .map(([id, e]) => `<option value="${id}" ${id === ENTREPRISE_ID ? "selected" : ""}>${e.entreprise}</option>`)
      .join("");

    // Quand l'Admin change d'entreprise : on mémorise son choix et on recharge la page.
    choix.addEventListener("change", () => {
      ecrireSession({ email: SESSION.email, entrepriseChoisie: choix.value });
      location.reload();
    });

    // On rend le menu visible.
    document.getElementById("zone-admin").classList.add("visible");
  }
}



// =====================================================================
// TOUT LE RESTE (calculs + affichage) est rangé dans une grande fonction
// qui s'exécute tout de suite : (function () { … })();
// Intérêt : si personne n'est connecté, on sort immédiatement (return) et
// aucune donnée d'entreprise n'est calculée ni affichée.
// =====================================================================
(function () {
if (!UTILISATEUR) return;

// Les données de l'entreprise autorisée (et d'elle seule).
const DONNEES = ENTREPRISES[ENTREPRISE_ID];

// Seuil sous lequel le solde du compte courant devient inquiétant (en euros).
// Propre à chaque entreprise : champ « seuilAlerte » dans donnees.js (plus tard : table Entreprises d'Airtable).
// Si le champ manque, on prend 5 000 € par défaut (?? = « sinon »).
const SEUIL_ALERTE = DONNEES.seuilAlerte ?? 5000;
// Zone de vigilance (bordure orange de la carte) : jusqu'à 2 fois le seuil.
const SEUIL_VIGILANCE = SEUIL_ALERTE * 2;

// Ordre d'affichage des parties dans le tableau.
// Les entrées : uniquement « Activité ». Les sorties : les 5 parties ci-dessous.
// (« Épargne » est traitée à part : ce n'est ni une entrée ni une sortie.)
const PARTIES_ENTREES = ["Activité"];
const PARTIES_SORTIES = ["Marchandises", "Personnel", "Fonctionnement", "État", "Emprunt et investissements"];



// =====================================================================
// 3.2 OUTILS DE MISE EN FORME (transformer des chiffres et des dates en texte lisible)
// =====================================================================

// Noms des mois, dans l'ordre. NOMS_MOIS[0] = "janvier", NOMS_MOIS[11] = "décembre".
const NOMS_MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
                   "août", "septembre", "octobre", "novembre", "décembre"];

// "2026-11" → "novembre 2026"
// split("-") coupe le texte au tiret : "2026-11" devient ["2026", "11"].
// Number("11") - 1 = 10 → NOMS_MOIS[10] = "novembre" (car les listes commencent à 0).
function nomMois(cle) {
  const [annee, m] = cle.split("-");
  return NOMS_MOIS[Number(m) - 1] + " " + annee;
}

// "2026-11" → "nov. 26" (version courte, pour l'axe du graphique).
// annee.slice(2) garde le texte à partir du 3e caractère : "2026" → "26".
function nomMoisCourt(cle) {
  const [annee, m] = cle.split("-");
  const courts = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  return courts[Number(m) - 1] + " " + annee.slice(2);
}

// 12450 → "12 450 €" ; -3500 → "−3 500 €"
// 1) Math.round arrondit à l'euro.
// 2) Math.abs enlève le signe moins (on le remettra à la fin, sous forme de vrai signe « − »).
// 3) Le replace(…) avec l'expression bizarre /\B(?=(\d{3})+(?!\d))/g insère une espace
//    tous les 3 chiffres en partant de la droite. " " est une espace fine insécable
//    (elle évite qu'un montant soit coupé en fin de ligne).
function euros(montant) {
  const arrondi = Math.round(montant);
  const texte = Math.abs(arrondi).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return (arrondi < 0 ? "−" : "") + texte + " €";
}

// Pour les écarts : ajoute un « + » devant les montants positifs (le « − » est déjà géré par euros).
// (Utilisée dans les phrases ; dans le tableau, voir eurosTableau ci-dessous.)
function eurosSigne(montant) {
  return (montant > 0 ? "+" : "") + euros(montant);
}

// TABLEAU MENSUEL : montants négatifs entre parenthèses, à la façon des comptables (validé le 07/11).
// -3500 → "(3 500 €)" ; 12450 → "12 450 €" ; avecPlus = true (écarts) → "+12 450 €".
// Pour que les chiffres restent alignés en colonne, les montants positifs reçoivent une
// parenthèse fermante invisible (classe "paren-fantome", voir styles.css) : elle prend la même
// place que la « ) » des montants négatifs.
// Les phrases (alerte, bulle du graphique, carte du haut) gardent le signe « − » : plus naturel à lire.
function eurosTableau(montant, avecPlus = false) {
  const arrondi = Math.round(montant);
  const texte = euros(Math.abs(arrondi));
  if (arrondi < 0) return "(" + texte + ")";
  return (avecPlus && arrondi > 0 ? "+" : "") + texte + `<span class="paren-fantome">)</span>`;
}

// "2026-11-06" → "6 novembre 2026"
function dateFr(iso) {
  const [a, m, j] = iso.split("-");
  return Number(j) + " " + NOMS_MOIS[Number(m) - 1] + " " + a;
}



// =====================================================================
// 3.3 CALCULS – rien n'est écrit en dur, tout part des montants de donnees.js
// =====================================================================

// Position (dans la liste DONNEES.mois) du dernier mois dont on connaît le réel.
// indexOf renvoie la position d'un élément dans une liste. Ex. : "2026-10" est en position 4.
const indexDernierReel = DONNEES.mois.indexOf(DONNEES.dernierMoisReel);

// Un mois est « passé » si sa position est avant ou égale à celle du dernier mois réel.
const estPasse = (i) => i <= indexDernierReel;

// Additionne, pour un mois donné (position i), les montants d'une liste de catégories.
// type vaut "prevu" ou "reel". reduce parcourt la liste en accumulant un total, qui démarre à 0.
// « ?? 0 » : si le montant est vide (null, mois pas encore passé), on compte 0.
function somme(categories, i, type) {
  return categories.reduce((total, c) => total + (c[type][i] ?? 0), 0);
}

// Renvoie les catégories qui appartiennent à certaines parties.
// Ex. : categoriesDe(["Personnel"]) → [Salaires, Charges sociales].
const categoriesDe = (parties) => DONNEES.categories.filter((c) => parties.includes(c.partie));

// On prépare une fois pour toutes les trois grandes familles de catégories.
const catEntrees = categoriesDe(PARTIES_ENTREES);
const catSorties = categoriesDe(PARTIES_SORTIES);
const catEpargne = categoriesDe(["Épargne"]);

// Les totaux d'un mois (position i), en version prévue ou réelle.
// Renvoie un objet : { entrees, sorties, cashInOut, epargne }.
// cashInOut = « Entrées – Sorties » ; comme les sorties sont négatives, c'est une simple addition.
function totauxMois(i, type) {
  const entrees = somme(catEntrees, i, type);
  const sorties = somme(catSorties, i, type);
  const epargne = somme(catEpargne, i, type);
  return { entrees, sorties, cashInOut: entrees + sorties, epargne };
}

// REPORT DES SOLDES MOIS APRÈS MOIS
// On part du solde initial, puis pour chaque mois :
//   solde fin = solde début + entrées + sorties + mouvement d'épargne
// Mois passés : on utilise le réel. Mois en cours et à venir : on utilise le prévu.
// Le résultat de chaque mois est rangé dans la liste moisCalcules.
const moisCalcules = [];
let soldeCourant = DONNEES.soldeInitial.courant;   // « let » car il va changer à chaque mois
let soldeEpargne = DONNEES.soldeInitial.epargne;

DONNEES.mois.forEach((cle, i) => {
  const prevu = totauxMois(i, "prevu");
  const reel = estPasse(i) ? totauxMois(i, "reel") : null;   // pas de réel complet pour les mois à venir
  // Mois en cours (juste après le dernier mois réel) : réel PARTIEL, arrivé à la date de mise à jour.
  // Il sert seulement à l'affichage du tableau ; il n'entre PAS dans le calcul des soldes.
  const reelADate = i === indexDernierReel + 1 ? totauxMois(i, "reel") : null;
  const retenu = reel ?? prevu;                               // le réel s'il existe, sinon le prévu

  const debut = soldeCourant;
  // Mettre de côté (montant négatif) fait baisser le compte courant et monter l'épargne.
  // Reprendre de l'épargne (montant positif) fait l'inverse.
  soldeCourant = debut + retenu.cashInOut + retenu.epargne;
  soldeEpargne = soldeEpargne - retenu.epargne;

  // On mémorise tout ce dont l'affichage aura besoin pour ce mois.
  moisCalcules.push({
    cle,                              // ex. "2026-11"
    passe: estPasse(i),               // vrai / faux
    prevu, reel,                      // les totaux prévus et réels (reel = null si mois à venir)
    reelADate,                        // réel partiel du mois en cours (null pour les autres mois)
    debut,                            // solde du compte courant en début de mois
    fin: soldeCourant,                // solde du compte courant en fin de mois
    epargneFin: soldeEpargne,         // solde de l'épargne en fin de mois
    disponible: soldeCourant + soldeEpargne,   // total disponible
  });
});

// CHOIX DES MOIS À AFFICHER
// slice(-12) = les 12 derniers éléments de la liste → le graphique.
const moisGraphique = moisCalcules.slice(-12);
// slice(indexDernierReel - 1) = à partir de l'avant-dernier mois réel → le tableau
// (2 mois passés, le mois en cours, 6 mois à venir).
const affiches = moisCalcules.slice(indexDernierReel - 1);
// Les mois pas encore passés : le mois en cours + les mois à venir.
const aVenir = affiches.filter((m) => !m.passe);
// Le dernier mois passé (at(-1) = le dernier élément d'une liste).
const dernierPasse = affiches.filter((m) => m.passe).at(-1);
// Le mois en cours = le premier mois pas encore passé.
const moisEnCours = aVenir[0];

// SOLDES « AUJOURD'HUI » = à la date de mise à jour (décision du 07/11).
// Compte courant : solde de début du mois en cours + réel arrivé depuis le 1er du mois.
// Épargne : solde de fin du dernier mois clos, corrigé des mouvements d'épargne réels du mois en cours.
// Sert à la carte « Total disponible » ET au point « aujourd'hui » du graphique (mêmes chiffres partout).
// S'il n'y a pas de réel pour le mois en cours, on reprend la fin du dernier mois clos.
const aujourdhui = (() => {
  const r = moisEnCours && moisEnCours.reelADate;
  if (!r) return { courant: dernierPasse.fin, epargne: dernierPasse.epargneFin, total: dernierPasse.disponible };
  const courant = moisEnCours.debut + r.cashInOut + r.epargne;
  const epargne = dernierPasse.epargneFin - r.epargne;
  return { courant, epargne, total: courant + epargne };
})();

// Le premier mois à venir où le compte courant passe sous le seuil (ou undefined si aucun).
const premierSousSeuil = aVenir.find((m) => m.fin < SEUIL_ALERTE);

// Donne la classe CSS de couleur d'une carte selon le solde :
// rouge sous le seuil, orange jusqu'à 2 fois le seuil, vert (rien de spécial) au-dessus.
function niveau(solde) {
  if (solde < SEUIL_ALERTE) return "alerte-carte";
  if (solde < SEUIL_VIGILANCE) return "vigilance";
  return "";
}



// =====================================================================
// 3.4 AFFICHAGE – en-tête, alerte, carte « Total disponible »
// =====================================================================

// Nom de l'entreprise et date de mise à jour, en haut de page.
document.getElementById("nom-entreprise").textContent = DONNEES.entreprise;
document.getElementById("date-maj").textContent = "Mis à jour le " + dateFr(DONNEES.dateMiseAJour);

// BANDEAU D'ALERTE – toujours affiché, il donne aussi le POINT BAS (le solde de fin de mois le plus
// bas sur le mois en cours et les 6 mois à venir). Trois cas, du plus urgent au plus rassurant :
//   1. Le compte courant est DÉJÀ sous le seuil aujourd'hui (réel à la date de mise à jour) → rouge.
//   2. Un mois à venir passe sous le seuil → rouge, avec le premier mois concerné et le point bas.
//   3. Aucun passage sous le seuil → bandeau neutre (bleu), avec le point bas.
// reduce garde, de proche en proche, le mois dont le solde de fin est le plus bas.
const pointBas = aVenir.reduce((plusBas, m) => (m.fin < plusBas.fin ? m : plusBas));
const finHorizon = nomMois(aVenir.at(-1).cle);   // ex. « mai 2027 »
const phrasePointBas = "Point bas d'ici " + finHorizon + " : " + euros(pointBas.fin) + " fin " + nomMois(pointBas.cle) + ".";
const seuilTexte = "votre seuil de sécurité de " + euros(SEUIL_ALERTE);
const alerte = document.getElementById("alerte");

// Phrase listant, pour le dernier mois terminé, les parties (entrées et sorties, hors Épargne) dont le réel
// s'écarte du prévisionnel d'au moins 5 %, à la hausse ou à la baisse.
// Les sorties sont comparées en valeur absolue : « +5 % » veut dire qu'on a dépensé plus que prévu.
// Renvoie "" s'il n'y a aucun écart de ce niveau.
const LIBELLES_ECARTS = {
  "Marchandises": "achats de marchandises",
  "Fonctionnement": "frais de fonctionnement",
  "État": "TVA et impôts",
};
function phraseEcartsDernierMois() {
  const i = indexDernierReel;
  const details = [...PARTIES_ENTREES, ...PARTIES_SORTIES]
    .map((partie) => {
      const categories = categoriesDe([partie]);
      return { partie, prevu: Math.abs(somme(categories, i, "prevu")), reel: Math.abs(somme(categories, i, "reel")) };
    })
    .filter((v) => v.prevu !== v.reel && (v.prevu === 0 || Math.abs(v.reel - v.prevu) / v.prevu >= 0.05))
    .map((v) => {
      const estVentes = v.partie === "Activité";
      const libelle = LIBELLES_ECARTS[v.partie] ?? v.partie.toLowerCase();
      if (v.prevu === 0) {
        return estVentes ? "les ventes atteignent " + euros(v.reel) + " sans prévision"
                         : "vous avez dépensé " + euros(v.reel) + " en " + libelle + " sans que ce soit prévu";
      }
      const plus = v.reel > v.prevu;
      const pct = Math.abs(Math.round((v.reel - v.prevu) / v.prevu * 100));
      const ecart = "(" + (plus ? "+" : "−") + pct + " %, soit " + euros(Math.abs(v.reel - v.prevu)) + (plus ? " de plus)" : " de moins)");
      if (estVentes) return "les ventes sont " + (plus ? "au-dessus" : "en dessous") + " du prévisionnel " + ecart;
      return "vous avez dépensé " + (plus ? "plus" : "moins") + " en " + libelle + " que prévu " + ecart;
    });
  if (details.length === 0) return "";
  // Chaque écart va sur sa propre ligne (\n : retour à la ligne, voir « .alerte » dans styles.css).
  const liste = details.length > 1 ? details.slice(0, -1).join(",\n") + "\net " + details.at(-1) : details[0];
  return "En " + nomMois(DONNEES.mois[i]) + ", " + liste + ".\n";
}

const phraseEcarts = phraseEcartsDernierMois();

if (aujourdhui.courant < SEUIL_ALERTE) {
  // Cas 1 : déjà sous le seuil.
  alerte.textContent = "⚠ Aujourd'hui, votre compte courant est à " + euros(aujourdhui.courant)
    + ", soit " + euros(SEUIL_ALERTE - aujourdhui.courant) + " sous " + seuilTexte + ". " + phrasePointBas;
} else if (premierSousSeuil) {
  // Cas 2 : passage sous le seuil prévu. Le point bas n'est ajouté que s'il tombe un autre mois.
  alerte.textContent = "⚠ Attention : fin " + nomMois(premierSousSeuil.cle)
    + ", votre compte courant descendrait à " + euros(premierSousSeuil.fin)
    + ", soit " + euros(SEUIL_ALERTE - premierSousSeuil.fin) + " sous votre seuil de sécurité.\n"
    + phraseEcarts;
  // Précision sur les écarts, en plus petit et en italique (voir « .note-alerte » dans styles.css).
  if (phraseEcarts) {
    const note = document.createElement("span");
    note.className = "note-alerte";
    note.textContent = "Seuls les écarts d'au moins 5 % par rapport au prévisionnel sont indiqués.";
    alerte.append(note);
  }
  if (pointBas !== premierSousSeuil) alerte.append((phraseEcarts ? "\n" : "") + phrasePointBas);
} else {
  // Cas 3 : tout va bien. Bandeau neutre (classe "info", voir styles.css).
  alerte.textContent = "Aucun passage sous " + seuilTexte + " prévu d'ici " + finHorizon + ". " + phrasePointBas;
  alerte.classList.add("info");
}
alerte.classList.add("visible");   // le bandeau est caché par défaut dans styles.css

// Bouton « Expliquer ces écarts » : amène au formulaire « Une remarque ? », avec le type
// « Explication des écarts » et le dernier mois terminé déjà sélectionnés.
if (aujourdhui.courant >= SEUIL_ALERTE && premierSousSeuil && phraseEcarts) {
  const boutonExpliquer = document.getElementById("bouton-expliquer");
  boutonExpliquer.hidden = false;
  boutonExpliquer.addEventListener("click", () => {
    document.getElementById("champ-type").value = "ecarts";
    remplirMois();
    document.getElementById("champ-mois").value = DONNEES.dernierMoisReel;
    document.getElementById("bloc-commentaires").scrollIntoView({ behavior: "smooth" });
    document.getElementById("champ-texte").focus({ preventScroll: true });
  });
}

// Carte « Total disponible » : soldes RÉELS à la date de mise à jour (voir « aujourdhui » plus haut).
// Pas de date dans la carte : la date de référence est « Mis à jour le … », affichée au-dessus (décision du 07/11).
document.getElementById("chiffre-disponible").textContent = euros(aujourdhui.total);
document.getElementById("detail-disponible").textContent =
  "Compte courant " + euros(aujourdhui.courant) + " + épargne " + euros(aujourdhui.epargne);

// Texte de la légende du seuil sous le graphique (ex. « Seuil de sécurité (5 000 €) »).
document.getElementById("legende-seuil").textContent = "Seuil de sécurité (" + euros(SEUIL_ALERTE) + ")";



// =====================================================================
// 3.5 GRAPHIQUE – dessiné en SVG (format d'image fait de formes : lignes, cercles, textes),
// sans bibliothèque externe. On fabrique le SVG comme un long texte, puis on l'insère dans la page.
// =====================================================================
function dessinerGraphique() {
  // Dimensions du dessin (en unités SVG ; le dessin s'adapte ensuite à la largeur de l'écran).
  // L = largeur, H = hauteur, puis les marges gauche / droite / haut / bas.
  const L = 1000, H = 300, margeG = 110, margeD = 90, margeH = 40, margeB = 50;

  // Les trois séries de valeurs à dessiner :
  const valeurs = moisGraphique.map((m) => m.fin);                       // solde fin de mois
  const entrees = moisGraphique.map((m) => (m.reel ?? m.prevu).entrees); // entrées du mois
  const sorties = moisGraphique.map((m) => -(m.reel ?? m.prevu).sorties);// sorties, mises en positif

  // Valeur la plus basse et la plus haute de l'axe vertical.
  // « ...valeurs » déplie la liste pour que Math.min / Math.max regardent chaque nombre.
  // On inclut 0 et le seuil pour qu'ils soient toujours visibles ; × 1.1 laisse 10 % d'air en haut.
  const min = Math.min(0, ...valeurs, aujourdhui.courant, SEUIL_ALERTE);
  const max = Math.max(...valeurs, ...entrees, ...sorties, SEUIL_ALERTE) * 1.1;

  // Deux petites fonctions qui convertissent un mois (position i) et un montant (v)
  // en coordonnées sur le dessin : x = horizontal (de gauche à droite), y = vertical.
  // Attention : en SVG, y = 0 est en HAUT ; d'où le calcul « max - v ».
  const x = (i) => margeG + 50 + i * (L - margeG - margeD - 70) / (moisGraphique.length - 1);
  const y = (v) => margeH + (max - v) * (H - margeH - margeB) / (max - min);

  // Début du dessin. On va ajouter des formes au texte « svg » avec « += ».
  let svg = `<svg viewBox="0 0 ${L} ${H}" width="100%" role="img" aria-label="Évolution du solde du compte courant">`;

  // Lignes horizontales grises de repère + montants à gauche.
  // Couleurs en gris chaud, assorties à la charte (#efebe4 = filet, #6b665e = texte doux, voir styles.css).
  // Un repère tous les 10 000 €, ou tous les 20 000 € si les montants sont grands.
  const pas = max > 60000 ? 20000 : 10000;
  for (let v = Math.ceil(min / pas) * pas; v <= max; v += pas) {
    // La ligne du 0 € est plus foncée, pour bien repérer le passage en négatif.
    svg += `<line x1="${margeG}" x2="${L - margeD}" y1="${y(v)}" y2="${y(v)}" stroke="${v === 0 ? "#a8a299" : "#efebe4"}"/>`;
    svg += `<text x="${margeG - 10}" y="${y(v) + 4}" text-anchor="end" font-size="12" fill="#6b665e">${euros(v)}</text>`;
  }

  // POINT « AUJOURD'HUI » (date de mise à jour), placé entre la fin du dernier mois clos et la fin
  // du mois en cours, au prorata des jours écoulés (ex. 6 novembre → 6/30 du chemin).
  // Chaque point du graphique = un solde de FIN de mois ; « aujourd'hui » = le solde réel à date.
  const iEnCours = moisGraphique.indexOf(moisEnCours);
  const jour = Number(DONNEES.dateMiseAJour.slice(8));
  const [annee, mois] = DONNEES.dateMiseAJour.slice(0, 7).split("-").map(Number);
  const joursDuMois = new Date(annee, mois, 0).getDate();   // jour 0 du mois suivant = dernier jour du mois
  // Si les dernières données datent d'un mois précédent, le point reste au début du mois en cours.
  const prorata = DONNEES.dateMiseAJour.slice(0, 7) === moisEnCours.cle ? jour / joursDuMois : 0;
  const xAujourdhui = x(iEnCours - 1) + (x(iEnCours) - x(iEnCours - 1)) * prorata;
  const yAujourdhui = y(aujourdhui.courant);

  // Trait vertical pointillé sur « aujourd'hui », avec l'étiquette.
  svg += `<line x1="${xAujourdhui}" x2="${xAujourdhui}" y1="${margeH - 10}" y2="${H - margeB + 5}" stroke="#a8a299" stroke-dasharray="3 4"/>`;
  svg += `<text x="${xAujourdhui}" y="${margeH - 14}" text-anchor="middle" font-size="12" font-weight="600" fill="#6b665e">aujourd'hui</text>`;

  // Ligne rouge horizontale du seuil d'alerte (semi-transparente), avec son nom à droite.
  svg += `<line x1="${margeG}" x2="${L - margeD}" y1="${y(SEUIL_ALERTE)}" y2="${y(SEUIL_ALERTE)}" stroke="#c0392b" stroke-width="2" stroke-opacity="0.45"/>`;
  svg += `<text x="${L - margeD + 6}" y="${y(SEUIL_ALERTE) + 4}" font-size="12" fill="#c0392b">seuil d'alerte</text>`;

  // Nombre de mois passés dans le graphique : sert à couper chaque courbe en deux morceaux,
  // trait plein pour le passé, pointillés pour le prévu.
  const nbPasses = moisGraphique.filter((m) => m.passe).length;

  // Fonction qui dessine une ligne fine (entrées ou sorties) dans une couleur donnée.
  // « polyline » = une ligne qui relie une suite de points "x,y".
  // stroke-dasharray="5 5" = pointillés (5 unités de trait, 5 unités de vide).
  const ligneFine = (serie, couleur) => {
    const pts = serie.map((v, i) => `${x(i)},${y(v)}`);
    return `<polyline points="${pts.slice(0, nbPasses).join(" ")}" fill="none" stroke="${couleur}" stroke-width="1.5"/>`
         + `<polyline points="${pts.slice(nbPasses - 1).join(" ")}" fill="none" stroke="${couleur}" stroke-width="1.5" stroke-dasharray="5 5"/>`;
  };
  // Dessinées AVANT la courbe du solde pour rester en dessous.
  svg += ligneFine(entrees, "#1e8e5a");   // vert
  svg += ligneFine(sorties, "#e08a1e");   // orange

  // Courbe principale du solde (trait épais bleu marine) : plein pour le passé, pointillés ensuite.
  // Le réel (trait plein) va jusqu'au point « aujourd'hui » ; le prévu (pointillés) repart de ce point.
  const points = moisGraphique.map((m, i) => `${x(i)},${y(m.fin)}`);
  const pointAujourdhui = `${xAujourdhui},${yAujourdhui}`;
  svg += `<polyline points="${[...points.slice(0, nbPasses), pointAujourdhui].join(" ")}" fill="none" stroke="#1f3a5f" stroke-width="3"/>`;
  svg += `<polyline points="${[pointAujourdhui, ...points.slice(nbPasses)].join(" ")}" fill="none" stroke="#1f3a5f" stroke-width="3" stroke-dasharray="8 6"/>`;

  // Un point par mois + le nom du mois sous l'axe.
  // Point rouge si le solde est sous le seuil ; point plein pour le passé, point vide (blanc) pour le prévu.
  moisGraphique.forEach((m, i) => {
    const couleur = m.fin < SEUIL_ALERTE ? "#c0392b" : "#1f3a5f";
    svg += `<g class="point-cliquable" data-index="${i}">`
      // Grand cercle invisible autour du point : plus facile à viser à la souris ou au doigt.
      + `<circle cx="${x(i)}" cy="${y(m.fin)}" r="20" fill="transparent"/>`
      // Le point visible.
      + `<circle class="point-visible" cx="${x(i)}" cy="${y(m.fin)}" r="6" fill="${m.passe ? couleur : "#fff"}" stroke="${couleur}" stroke-width="2.5"/>`
      + `</g>`;
    svg += `<text x="${x(i)}" y="${H - 12}" text-anchor="middle" font-size="13" fill="#6b665e">${nomMoisCourt(m.cle)}</text>`;
  });
  // Le point « aujourd'hui » : plein (c'est du réel), rouge s'il est sous le seuil.
  const couleurAuj = aujourdhui.courant < SEUIL_ALERTE ? "#c0392b" : "#1f3a5f";
  svg += `<g class="point-cliquable" data-index="aujourdhui">`
    + `<circle cx="${xAujourdhui}" cy="${yAujourdhui}" r="20" fill="transparent"/>`
    + `<circle class="point-visible" cx="${xAujourdhui}" cy="${yAujourdhui}" r="6" fill="${couleurAuj}" stroke="${couleurAuj}" stroke-width="2.5"/>`
    + `</g>`;

  // Fin du dessin : on l'insère dans la page, avec une « bulle » vide qui servira à afficher les montants.
  svg += `</svg>`;
  const zone = document.getElementById("graphique");
  zone.innerHTML = svg + `<div class="bulle" id="bulle"></div>`;

  // BULLE D'INFORMATION
  // Survol d'un point à la souris : affiche le mois et le montant. Toucher (téléphone) : pareil.
  const bulle = document.getElementById("bulle");

  // Remplit la bulle avec les infos du point survolé et la place juste au-dessus du point.
  function montrerBulle(g) {
    // data-index (posé plus haut sur chaque point) indique à quel mois correspond le point.
    // Cas particulier : le point « aujourd'hui » (solde réel à la date de mise à jour).
    if (g.dataset.index === "aujourdhui") {
      bulle.innerHTML = `Au ${dateFr(DONNEES.dateMiseAJour)} · réel<br><strong>${euros(aujourdhui.courant)}</strong>`;
    } else {
      const m = moisGraphique[Number(g.dataset.index)];
      const statut = m.passe ? "réel" : (m === moisEnCours ? "en cours, prévu" : "prévu");
      bulle.innerHTML = `Fin ${nomMois(m.cle)} · ${statut}<br><strong>${euros(m.fin)}</strong>`;
    }

    // getBoundingClientRect() donne la position réelle d'un élément à l'écran.
    // On calcule la position du point PAR RAPPORT à la zone du graphique.
    const rondPoint = g.querySelector(".point-visible").getBoundingClientRect();
    const rondZone = zone.getBoundingClientRect();
    bulle.style.left = (rondPoint.left + rondPoint.width / 2 - rondZone.left + zone.scrollLeft) + "px";
    bulle.style.top = (rondPoint.top - rondZone.top - 10) + "px";
    bulle.classList.add("visible");
  }
  const cacherBulle = () => bulle.classList.remove("visible");

  // On branche les événements sur chaque point :
  // mouseenter = la souris arrive sur le point ; mouseleave = elle en sort ; click = clic ou toucher.
  zone.querySelectorAll(".point-cliquable").forEach((g) => {
    g.addEventListener("mouseenter", () => montrerBulle(g));
    g.addEventListener("mouseleave", cacherBulle);
    // stopPropagation empêche le clic de « remonter » jusqu'à la page (qui cacherait la bulle aussitôt).
    g.addEventListener("click", (evenement) => { evenement.stopPropagation(); montrerBulle(g); });
  });
  // Un clic ailleurs dans la page cache la bulle.
  document.addEventListener("click", cacherBulle);
}
// On lance le dessin.
dessinerGraphique();



// =====================================================================
// 3.6 TABLEAU MENSUEL
// - Mois passés (dont le mois précédent) : Réel seul (clic sur le nom du mois pour voir Prévu et Écart).
// - Mois en cours et à venir : Prévu.
// - Clic sur le petit « % » d'une colonne Prévu ou Réel : ouvre une colonne % (part de chaque
//   ligne dans le total des entrées, ou dans le total des sorties).
// Le tableau est entièrement redessiné à chaque clic, à partir de « l'état » ci-dessous.
// =====================================================================

// L'état du tableau : ce qui est ouvert ou fermé.
// Un « Set » est une liste sans doublon, pratique pour noter « ouvert / pas ouvert ».
const etatTableau = {
  groupesOuverts: new Set(),  // lignes dépliées : "solde", "flux", "entrees", "sorties"
  moisOuverts: new Set(),     // mois passés dont on affiche Prévu et Écart, ex. "2026-09"
  pourcentages: new Set(),    // colonnes % ouvertes, ex. "2026-10|reel"
};

// Renvoie la liste des colonnes à afficher pour un mois, selon ce qui est ouvert.
// Possibilités : "prevu", "pct-prevu", "reel", "pct-reel", "ecart".
function colonnesDuMois(m) {
  const cols = [];
  // On montre le prévu pour : les mois à venir, et les mois passés « ouverts » par un clic.
  // (Tous les mois passés, y compris le mois précédent, n'affichent que le Réel par défaut.)
  const avecPrevu = !m.passe || etatTableau.moisOuverts.has(m.cle);
  if (avecPrevu) {
    cols.push("prevu");
    if (etatTableau.pourcentages.has(m.cle + "|prevu")) cols.push("pct-prevu");
  }
  // Le réel existe pour les mois passés ET pour le mois en cours (réel arrivé à ce jour).
  if (m.passe || m === moisEnCours) {
    cols.push("reel");
    if (etatTableau.pourcentages.has(m.cle + "|reel")) cols.push("pct-reel");
  }
  // L'écart, seulement pour les mois passés : pour le mois en cours, comparer un réel
  // incomplet à un prévu sur le mois entier donnerait un écart trompeur.
  if (m.passe && avecPrevu) cols.push("ecart");
  return cols;
}

// Petites fonctions utiles :
// position d'un mois dans DONNEES.mois ;
const indexMois = (m) => DONNEES.mois.indexOf(m.cle);
// totaux prévus ou réels d'un mois (pour le mois en cours, le réel = réel arrivé à ce jour) ;
const totaux = (m, type) => (type === "reel" ? (m.reel ?? m.reelADate) : m.prevu);
// "2026-11-06" → "6 nov." (pour l'en-tête « Réel au 6 nov. » du mois en cours).
// slice(8) garde le jour ("06" → 6) ; nomMoisCourt("2026-11") = "nov. 26", split(" ")[0] garde "nov.".
const dateMajCourte = Number(DONNEES.dateMiseAJour.slice(8)) + " "
  + nomMoisCourt(DONNEES.dateMiseAJour.slice(0, 7)).split(" ")[0];
// 0.913 → "91 %" (et « — » si le pourcentage est quasi nul).
const pourcent = (v) => (Math.abs(v) < 0.005 ? "—" : Math.round(v * 100) + " %");

// Construit (ou reconstruit) tout le tableau.
function construireTableau() {

  // ----- 1. LES EN-TÊTES (3 lignes : zones, puis les mois, puis Prévu / Réel / % / Écart) -----

  // Ligne 0 : trois bandeaux au-dessus des mois :
  // « Réalisé » (mois passés, clos) | « En cours » (réel partiel + prévu) | « Prévisionnel » (mois à venir).
  // colspan = nombre total de colonnes de la zone ; reduce additionne les colonnes de chaque mois.
  const nbColonnes = (liste) => liste.reduce((total, m) => total + colonnesDuMois(m).length, 0);
  const nbColsReel = nbColonnes(affiches.filter((m) => m.passe));
  const nbColsEnCours = moisEnCours ? colonnesDuMois(moisEnCours).length : 0;
  const nbColsPrevu = nbColonnes(aVenir.slice(1));   // slice(1) : les mois à venir SANS le mois en cours
  let h0 = `<tr class="zones"><th rowspan="3" class="coin"></th>`;   // "coin" : case figée à gauche (styles.css)   // case vide en haut à gauche, sur 3 lignes
  if (nbColsReel) h0 += `<th colspan="${nbColsReel}" class="zone zone-reel">Réalisé</th>`;
  if (nbColsEnCours) h0 += `<th colspan="${nbColsEnCours}" class="zone zone-en-cours debut-prevision">En cours</th>`;
  if (nbColsPrevu) h0 += `<th colspan="${nbColsPrevu}" class="zone zone-prevision debut-mois">Prévisionnel</th>`;
  h0 += `</tr>`;

  let h1 = `<tr>`;
  let h2 = `<tr class="sous">`;
  affiches.forEach((m) => {
    const cols = colonnesDuMois(m);
    // fond bleu clair pour les mois passés ; trait vertical marine avant le mois en cours
    // (classe "debut-prevision", voir styles.css) pour marquer où commence le prévisionnel.
    // "debut-mois" = filet vertical fin à gauche de chaque mois (séparation entre les mois).
    const fond = (m.passe ? "mois-passe" : "") + " debut-mois" + (m === moisEnCours ? " debut-prevision" : "");

    if (m.passe) {
      // Mois passé (y compris le mois précédent) : en-tête cliquable avec une flèche ▸ (fermé) ou ▾ (ouvert).
      const ouvert = etatTableau.moisOuverts.has(m.cle);
      h1 += `<th colspan="${cols.length}" class="${fond} mois-repliable" data-mois="${m.cle}"
               title="Cliquer pour voir le prévu et l'écart">${ouvert ? "▾" : "▸"} ${nomMois(m.cle)}</th>`;
    } else {
      // Autres mois : nom du mois, avec un badge « en cours » pour le mois en cours.
      const enCours = m === moisEnCours ? ` <span class="en-cours">en cours</span>` : "";
      h1 += `<th colspan="${cols.length}" class="${fond}">${nomMois(m.cle)}${enCours}</th>`;
    }
    // colspan = nombre de colonnes que l'en-tête du mois recouvre.

    // Deuxième ligne d'en-tête : une case par colonne.
    // idx = position de la colonne dans le mois (0 = la première) : sert à placer le trait vertical.
    cols.forEach((c, idx) => {
      const classe = (m.passe ? "col-passe" : "")
        + (idx === 0 ? " debut-mois" : "")                              // filet entre les mois (pas à l'intérieur)
        + (m === moisEnCours && idx === 0 ? " debut-prevision" : "")
        + (c === "prevu" ? " val-prevu" : c === "reel" ? " val-reel" : "");   // même couleur que les montants
      if (c === "prevu" || c === "reel") {
        // « Prévu % » ou « Réel % » : le petit badge % est cliquable.
        const ouvert = etatTableau.pourcentages.has(m.cle + "|" + c);
        // Mois en cours : « Réel au 6 nov. » pour rappeler que le réel est incomplet.
        const libelle = c === "prevu" ? "Prévu" : m === moisEnCours ? "Réel au " + dateMajCourte : "Réel";
        h2 += `<th class="${classe} bascule-pct" data-cle="${m.cle}|${c}" title="Cliquer pour voir les %">`
            + `${libelle} <span class="badge-pct${ouvert ? " ouvert" : ""}">%</span></th>`;
      } else if (c === "ecart") {
        h2 += `<th class="${classe}">Écart</th>`;
      } else {
        h2 += `<th class="${classe} col-pct">%</th>`;
      }
    });
  });
  h1 += `</tr>`; h2 += `</tr>`;

  // ----- 2. LES CELLULES D'UNE LIGNE -----
  // Fabrique toutes les cases d'une ligne du tableau, mois par mois et colonne par colonne.
  // - valeur(m, type) : fonction qui donne le montant prévu ou réel de la ligne pour le mois m.
  // - part(m, type)   : fonction qui donne le total servant de base au % (ou null : pas de %).
  // - sousSeuil       : si vrai, les montants sous le seuil sont écrits en rouge.
  // - finDeMois       : si vrai (lignes de solde fin de mois), la colonne « Réel » du mois en cours
  //                     affiche « — » : le solde réel n'est connu que le 1er du mois suivant.
  function cellules(valeur, { part = null, sousSeuil = false, finDeMois = false } = {}) {
    return affiches.map((m) => colonnesDuMois(m).map((c, idx) => {
      // Filet fin à gauche de la 1re colonne de chaque mois (séparation entre les mois),
      // et trait marine épais avant la 1re colonne du mois en cours (début du prévisionnel).
      const classe = (m.passe ? "col-passe" : "")
        + (idx === 0 ? " debut-mois" : "")
        + (m === moisEnCours && idx === 0 ? " debut-prevision" : "");

      // Case « montant » (prévu ou réel).
      // Prévu : bleu foncé + italique (classe "val-prevu") ; réel : noir (classe "val-reel").
      if (c === "prevu" || c === "reel") {
        // Solde fin de mois du mois en cours : pas de réel avant le 1er du mois suivant.
        if (finDeMois && c === "reel" && m === moisEnCours) {
          return `<td class="${classe} val-reel" title="Connu le 1er du mois suivant">—</td>`;
        }
        const v = valeur(m, c);
        const rouge = sousSeuil && v < SEUIL_ALERTE ? " sous-seuil" : "";
        const style = c === "prevu" ? " val-prevu" : " val-reel";
        return `<td class="${classe}${style}${rouge}">${eurosTableau(v)}</td>`;
      }

      // Case « % » : montant de la ligne ÷ total des entrées (ou des sorties).
      // c.slice(4) enlève "pct-" : "pct-reel" → "reel".
      if (c === "pct-prevu" || c === "pct-reel") {
        const type = c.slice(4);
        const base = part ? part(m, type) : 0;
        return `<td class="${classe} col-pct">${part && base ? pourcent(valeur(m, type) / base) : ""}</td>`;
      }

      // Case « écart » = réel − prévu.
      // Avec nos signes (sorties négatives), un écart négatif est toujours défavorable → rouge.
      const e = Math.round(valeur(m, "reel") - valeur(m, "prevu"));
      const classeEcart = e < 0 ? "ecart-neg" : e > 0 ? "ecart-pos" : "";
      return `<td class="${classe} ${classeEcart}">${e === 0 ? "—" : eurosTableau(e, true)}</td>`;
    }).join("")).join("");
  }

  // Bases des pourcentages : le total des entrées, ou le total des sorties, du même mois.
  const partEntrees = (m, t) => totaux(m, t).entrees;
  const partSorties = (m, t) => totaux(m, t).sorties;

  // ----- 3. LES LIGNES DE DÉTAIL (sous « Entrées » et « Sorties ») -----
  // Pour chaque partie : une ligne de sous-total, puis (si avecCategories) une ligne par catégorie.
  // Entrées : parties + catégories. Sorties : parties seulement (Marchandises, Personnel…),
  // pour garder le tableau court (décision du 06/11).
  // Elles sont cachées, sauf si le groupe est ouvert (classe "visible").
  function lignesDetail(groupe, parties, part, avecCategories = true) {
    const visible = etatTableau.groupesOuverts.has(groupe) ? " visible" : "";
    return parties.map((partie) => {
      const cats = categoriesDe([partie]);
      // Ligne de la partie (somme de ses catégories).
      let html = `<tr class="detail-ligne detail-partie${visible}" data-groupe="${groupe}"><td>${partie}</td>`
        + cellules((m, type) => somme(cats, indexMois(m), type), { part }) + `</tr>`;
      // Une ligne par catégorie (seulement si avecCategories est vrai).
      if (avecCategories) cats.forEach((c) => {
        html += `<tr class="detail-ligne detail-categorie${visible}" data-groupe="${groupe}"><td>${c.nom}</td>`
          + cellules((m, type) => c[type][indexMois(m)] ?? 0, { part }) + `</tr>`;
      });
      return html;
    }).join("");
  }

  // ----- 4. LES SOLDES -----
  // Solde fin de mois, version prévue ou réelle. Les deux partent du MÊME solde de début,
  // pour que l'écart ne reflète que ce qui s'est passé dans le mois.
  const soldeFin = (m, type) => m.debut + totaux(m, type).cashInOut + totaux(m, type).epargne;
  // Solde de l'épargne en fin de mois, version prévue ou réelle.
  // m.epargneFin est calculé avec le montant « retenu » (réel s'il existe, sinon prévu) ;
  // on corrige de la différence entre ce montant retenu et le montant du type demandé.
  // (Signe : épargne négative = argent mis de côté → le compte courant baisse, l'épargne monte.)
  const epargneFin = (m, type) => m.epargneFin + (m.reel ?? m.prevu).epargne - totaux(m, type).epargne;
  // Total disponible = solde fin du compte courant + solde fin de l'épargne.
  const disponibilites = (m, type) => soldeFin(m, type) + epargneFin(m, type);
  // Ajoute la classe "ouvert" (flèche ▾) à une ligne cliquable si son détail est déplié.
  const ouvert = (g) => (etatTableau.groupesOuverts.has(g) ? " ouvert" : "");
  const estOuvert = (g) => etatTableau.groupesOuverts.has(g);

  // ----- 5. LE CORPS DU TABLEAU, LIGNE PAR LIGNE (validé le 07/11) -----
  // Le tableau se déplie par niveaux :
  //   Solde fin de mois – compte courant          ← seule ligne visible au départ (clic ▸)
  //       Entrées / Sorties                        ← niveau 2, visibles après un clic sur « Cash in – Cash out »
  //                                                  (clic ▸ pour le détail par poste)
  //     Cash in – Cash out                         ← niveau 1, fond beige (clic ▸), juste au-dessus de l'épargne
  //     Solde épargne fin de mois                  ← niveau 1, fond blanc
  //     Total disponible (courant + épargne)       ← niveau 1
  // Le détail (Entrées, Sorties) s'affiche AU-DESSUS de son total « Cash in – Cash out ».
  // La ligne « Solde en début de mois » a été retirée : elle répétait le solde de fin du mois précédent.
  let corps = "";
  corps += `<tr class="solde cliquable${ouvert("solde")}" data-ouvre="solde"><td>Solde fin de mois – compte courant</td>`
         + cellules(soldeFin, { sousSeuil: true, finDeMois: true }) + `</tr>`;
  if (estOuvert("solde")) {
    if (estOuvert("flux")) {
      corps += `<tr class="cliquable important niveau-2${ouvert("entrees")}" data-ouvre="entrees"><td>Encaissements</td>`
             + cellules((m, t) => totaux(m, t).entrees) + `</tr>`;   // pas de % : ce serait toujours 100 %
      corps += lignesDetail("entrees", PARTIES_ENTREES, partEntrees);
      corps += `<tr class="cliquable important niveau-2${ouvert("sorties")}" data-ouvre="sorties"><td>Dépenses</td>`
             + cellules((m, t) => totaux(m, t).sorties) + `</tr>`;
      corps += lignesDetail("sorties", PARTIES_SORTIES, partSorties, false);   // false = sans les catégories
    }
    corps += `<tr class="flux-net cliquable important niveau-1${ouvert("flux")}" data-ouvre="flux"><td>Encaissements – Dépenses</td>`
           + cellules((m, t) => totaux(m, t).cashInOut) + `</tr>`;
    corps += `<tr class="epargne-solde niveau-1"><td>Solde épargne fin de mois</td>`
           + cellules(epargneFin, { finDeMois: true }) + `</tr>`;
    corps += `<tr class="total-dispo niveau-1"><td>Total disponible (courant + épargne)</td>`
           + cellules(disponibilites, { finDeMois: true }) + `</tr>`;
  }

  // On insère le tableau complet dans la page.
  const tableau = document.getElementById("tableau");
  tableau.innerHTML = `<thead>${h0}${h1}${h2}</thead><tbody>${corps}</tbody>`;

  // ----- 6. LES CLICS -----
  // basculer : si la valeur est dans l'ensemble, on l'enlève (fermer), sinon on l'ajoute (ouvrir),
  // puis on redessine tout le tableau.
  const basculer = (ensemble, valeur) => {
    ensemble.has(valeur) ? ensemble.delete(valeur) : ensemble.add(valeur);
    construireTableau();
  };
  // Clic sur une ligne avec ▸ (solde, Cash in – Cash out, Entrées, Sorties) → déplier / replier.
  tableau.querySelectorAll("tr.cliquable").forEach((l) =>
    l.addEventListener("click", () => basculer(etatTableau.groupesOuverts, l.dataset.ouvre)));
  // Clic sur un mois ancien → afficher / cacher son Prévu et son Écart.
  tableau.querySelectorAll("th.mois-repliable").forEach((th) =>
    th.addEventListener("click", () => basculer(etatTableau.moisOuverts, th.dataset.mois)));
  // Clic sur « Prévu % » ou « Réel % » → afficher / cacher la colonne %.
  tableau.querySelectorAll("th.bascule-pct").forEach((th) =>
    th.addEventListener("click", () => basculer(etatTableau.pourcentages, th.dataset.cle)));
}
// Premier affichage du tableau.
construireTableau();



// =====================================================================
// 3.7 REMARQUES DU DIRIGEANT : type, commentaire, caractère urgent (oui / non), mois concerné
// Dans cette maquette, les remarques restent dans la page (perdues si on la recharge).
// La fonction envoyerCommentaire() envoie la remarque à n8n (via serveur.ps1),
// qui l'enregistre dans Airtable (table Commentaires) et prévient Elise par email.
// =====================================================================

// Liste des remarques envoyées pendant la visite.
const commentaires = [];

// Exemple affiché en gris dans la zone de texte, selon le type de remarque choisi.
// ("" = aucun type choisi.)
const EXEMPLES = {
  previsionnel: "ex. Je vais recruter un saisonnier en décembre, environ 1 800 € de salaire.",
  "": "Écrivez ici ce que vous souhaitez me dire.",
  ecarts: "ex. En octobre, j'ai acheté un nouveau présentoir, c'est pour ça que les dépenses sont plus élevées.",
  echange: "ex. J'hésite à passer une grosse commande pour Noël, pouvons-nous en parler ?",
};
// Libellés des types, pour l'affichage dans la liste des demandes envoyées.
const NOMS_TYPES = {
  previsionnel: "Sur le prévisionnel",
  ecarts: "Explication des écarts",
  echange: "Besoin d'un échange",
};

// Remplit le menu « Mois concerné ». Les mois proposés dépendent du type de remarque :
// prévisionnel → mois à venir ; écarts → mois passés ; échange ou rien choisi → tous les mois.
function remplirMois() {
  const type = document.getElementById("champ-type").value;
  const passes = affiches.filter((m) => m.passe);
  const liste = type === "previsionnel" ? aVenir : type === "ecarts" ? passes : affiches;
  let options = `<option value="">— Choisir —</option>`
    + liste.map((m) => `<option value="${m.cle}">${nomMois(m.cle)}</option>`).join("")
    + `<option value="plusieurs">Plusieurs mois</option>`;
  document.getElementById("champ-mois").innerHTML = options;
  // On adapte aussi l'exemple de la zone de texte.
  document.getElementById("champ-texte").placeholder = EXEMPLES[type];
}

// Prépare le formulaire au chargement de la page.
function remplirFormulaire() {
  remplirMois();
  // Quand le type de remarque change, on met à jour la liste des mois.
  document.getElementById("champ-type").addEventListener("change", remplirMois);
}

// Lit le bouton « Caractère urgent » coché : renvoie true si « Oui », false si « Non ».
// querySelector('input[name="urgent"]:checked') = « le bouton rond du groupe urgent qui est coché ».
function lireUrgent() {
  const coche = document.querySelector('input[name="urgent"]:checked');
  return coche ? coche.value === "oui" : false;
}

// « Envoie » une remarque. Pour l'instant : l'ajoute en tête de la liste (unshift).
// À remplacer plus tard par un envoi vers un webhook n8n.
// Avec serveur.ps1, la remarque part vers n8n ; on ne l'ajoute à la liste que si l'envoi a réussi.
// Le bouton « Synchronisation » n'est visible qu'avec ce serveur : sans lui, la remarque reste sur la page.
async function envoyerCommentaire(commentaire) {
  if (!document.getElementById("bouton-synchro").hidden) {
    const reponse = await fetch("api/remarque", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Zieli-Synchro": "1" },
      body: JSON.stringify({
        entreprise: ENTREPRISE_ID,
        type: commentaire.type,
        texte: commentaire.texte,
        urgent: commentaire.urgent,
        mois: commentaire.mois,
      }),
    });
    if (!reponse.ok) throw new Error("échec de l'envoi");
  }
  commentaires.unshift(commentaire);
}

// Affiche la liste « Vos demandes envoyées » sous le formulaire.
function afficherCommentaires() {
  const zone = document.getElementById("liste-commentaires");
  if (commentaires.length === 0) { zone.innerHTML = ""; return; }
  zone.innerHTML = `<h3>Vos demandes envoyées</h3>` + commentaires.map((c) => {
    // Ligne de détails : type · mois (filter(Boolean) retire les éléments vides).
    const mois = c.mois === "plusieurs" ? "Plusieurs mois" : c.mois ? nomMois(c.mois) : null;
    const details = [NOMS_TYPES[c.type] || "Remarque", mois].filter(Boolean).join(" · ");
    // Petit badge rouge « Urgent » devant les demandes urgentes.
    const urgent = c.urgent ? `<span class="badge-urgent">Urgent</span>` : "";
    // Sécurité : on passe le texte tapé par textContent, pour que du code HTML éventuellement
    // tapé dans le commentaire soit affiché comme du texte et jamais exécuté.
    const div = document.createElement("div");
    div.textContent = c.texte;
    return `<div class="commentaire"><div class="meta">${urgent}${details} — envoyé le ${dateFr(c.date)}</div>${div.innerHTML}</div>`;
  }).join("");
}

// Clic sur « Envoyer à Elise ».
document.getElementById("form-commentaire").addEventListener("submit", async (evenement) => {
  evenement.preventDefault();   // empêche le rechargement de la page

  const champs = ["champ-type", "champ-texte", "champ-mois"];
  const urgent = lireUrgent();

  // Tout est facultatif, mais on refuse un formulaire complètement vide.
  // every(…) = « est-ce vrai pour TOUS les champs ? » → ici : tous vides ?
  // Cocher seulement « Urgent : oui » suffit (le dirigeant veut être rappelé).
  if (!urgent && champs.every((id) => document.getElementById(id).value.trim() === "")) {
    const msg = document.getElementById("confirmation");
    msg.textContent = "Remplissez au moins un champ avant d'envoyer.";
    msg.style.color = "var(--texte-doux)";
    return;
  }
  document.getElementById("confirmation").style.color = "";

  // On rassemble la remarque dans un objet (c'est ce qui sera envoyé à n8n plus tard,
  // puis enregistré dans la table Commentaires d'Airtable).
  const boutonEnvoi = evenement.target.querySelector('button[type="submit"]');
  boutonEnvoi.disabled = true;   // évite d'envoyer deux fois la même remarque
  try {
    await envoyerCommentaire({
      entreprise: DONNEES.entreprise,
      type: document.getElementById("champ-type").value,
      texte: document.getElementById("champ-texte").value.trim(),
      urgent,                                          // true = Oui, false = Non
      mois: document.getElementById("champ-mois").value,
      date: new Date().toISOString().slice(0, 10),   // date du jour au format "AAAA-MM-JJ"
    });
  } catch (erreur) {
    // Le texte saisi reste dans le formulaire pour pouvoir réessayer.
    const msg = document.getElementById("confirmation");
    msg.textContent = "L'envoi a échoué. Votre remarque n'est pas partie, vous pouvez réessayer.";
    msg.style.color = "var(--rouge)";
    return;
  } finally {
    boutonEnvoi.disabled = false;
  }

  // On vide le formulaire (« Non » redevient coché), on remet la liste des mois,
  // on confirme et on affiche la liste.
  evenement.target.reset();
  remplirMois();
  document.getElementById("confirmation").textContent = urgent
    ? "Merci, votre demande urgente a bien été envoyée. Je vous recontacte au plus vite."
    : "Merci, votre demande a bien été envoyée. Elise reviendra vers vous.";
  afficherCommentaires();
});

// Préparation du formulaire au chargement.
remplirFormulaire();

// Fin de la grande fonction ouverte au début de la partie « calculs et affichage ».
})();
