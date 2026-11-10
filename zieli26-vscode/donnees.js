// =====================================================================
// ZIELI 26 – donnees.js
// DONNÉES DE DÉMONSTRATION (fictives) : 2 entreprises + les comptes de connexion.
//
// Ce fichier est lu par le navigateur AVANT app.js (voir le bas de index.html) :
// app.js utilise donc les noms définis ici (ENTREPRISES, UTILISATEURS…).
// Plus tard, ces données viendront d'Airtable, via le serveur, et ce fichier disparaîtra.
//
// COMMENT LIRE CES DONNÉES
// - « const NOM = { … }; » crée un objet : un ensemble d'informations rangées par nom.
// - Les listes entre crochets [ … ] se lisent dans l'ordre de la liste « mois » :
//   1er nombre = juin 2026, 2e = juillet 2026, … 12e = mai 2027.
// - Règle de signe : entrées en positif, sorties en négatif.
// - Épargne : négatif = argent mis de côté, positif = argent repris.
// - « prevu » = montants prévus ; « reel » = montants réellement constatés.
//   « null » = pas encore de réel (mois à venir).
// - Mois en cours (celui qui suit « dernierMoisReel ») : « reel » = ce qui est déjà arrivé
//   à la date de mise à jour (réel partiel). Il est affiché dans le tableau, mais le solde
//   de fin de mois reste calculé sur le prévu jusqu'au 1er du mois suivant.
// - Pour modifier un montant : change le nombre, enregistre (Ctrl + S), le rendu se met à jour.
//   Attention à garder les virgules entre les nombres et 12 nombres par liste.
// =====================================================================


// ---------------------------------------------------------------------
// ENTREPRISE 1 : LA LIBRAIRIE
// ---------------------------------------------------------------------
const DONNEES_LIBRAIRIE = {
  entreprise: "Librairie l'Utopie'",          // nom affiché en haut de page
  dateMiseAJour: "2026-11-06",               // date affichée « Mis à jour le … » (format AAAA-MM-JJ)
  seuilAlerte: 5000,                        // seuil de sécurité du compte courant, en euros : seuil donné par la libraire (07/11)
  // Soldes de départ (compte courant et épargne) à la veille du 1er mois de la liste.
  soldeInitial: { date: "2026-05-31", courant: 17800, epargne: 10000 },
  mois: ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03", "2027-04", "2027-05"],
  dernierMoisReel: "2026-10",                // dernier mois dont on connaît le réel ; les suivants sont prévus
  // Graphique : 5 mois passés + le mois en cours + 6 mois à venir = 12 mois
  // Tableau : 2 mois passés + le mois en cours + 6 mois à venir

  // Une ligne par catégorie : son nom, sa partie (parmi les 7), puis ses montants prévus et réels.
  categories: [
    // ----- Activité -----
    { nom: "Ventes en magasin", partie: "Activité",
      prevu: [49100, 46100, 44600, 48100, 46600, 48800, 86300, 41900, 40800, 44300, 48100, 48100],
      reel:   [48940, 45740, 44040, 46690, 48890, 9800, null, null, null, null, null, null] },
    { nom: "Ventes aux collectivités", partie: "Activité",
      prevu: [0, 0, 0, 6000, 4000, 5000, 3000, 2000, 4000, 6000, 3000, 3000],
      reel:   [0, 0, 0, 6800, 3500, 0, null, null, null, null, null, null] },
    { nom: "Autres encaissements", partie: "Activité",
      prevu: [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500],
      reel:   [420, 420, 420, 610, 480, 120, null, null, null, null, null, null] },

    // ----- Marchandises -----
    { nom: "Distributeurs (livres)", partie: "Marchandises",
      prevu: [-22000, -22000, -22000, -23000, -22000, -30000, -38000, -40000, -18000, -20000, -22000, -22000],
      reel:   [-21800, -21800, -21800, -24000, -22600, -6500, null, null, null, null, null, null] },
    { nom: "Autres fournisseurs de livres", partie: "Marchandises",
      prevu: [-3000, -3000, -3000, -3000, -3000, -3000, -4000, -3000, -3000, -3000, -3000, -3000],
      reel:   [-2900, -2900, -2900, -3200, -2800, 0, null, null, null, null, null, null] },
    { nom: "Papeterie et cadeaux", partie: "Marchandises",
      prevu: [-1500, -1500, -1500, -1500, -1500, -3000, -2000, -1000, -1500, -1500, -1500, -1500],
      reel:   [-1450, -1450, -1450, -1700, -1600, -900, null, null, null, null, null, null] },

    // ----- Personnel -----
    { nom: "Salaires", partie: "Personnel",
      prevu: [-9000, -9000, -9000, -9000, -9000, -9000, -10500, -9000, -9000, -9000, -9000, -9000],
      reel:   [-9000, -9000, -9000, -9000, -9000, 0, null, null, null, null, null, null] },
    { nom: "Charges sociales", partie: "Personnel",
      prevu: [-4000, -4000, -4000, -4000, -4000, -4000, -4000, -4400, -4000, -4000, -4000, -4000],
      reel:   [-4000, -4000, -4000, -4050, -4000, -4000, null, null, null, null, null, null] },

    // ----- Fonctionnement -----
    { nom: "Loyer et charges", partie: "Fonctionnement",
      prevu: [-3200, -3200, -3200, -3200, -3200, -3200, -3200, -3200, -3200, -3200, -3200, -3200],
      reel:   [-3200, -3200, -3200, -3200, -3200, -3200, null, null, null, null, null, null] },
    { nom: "Énergie et télécoms", partie: "Fonctionnement",
      prevu: [-600, -600, -600, -600, -600, -800, -800, -800, -800, -800, -600, -600],
      reel:   [-580, -580, -580, -620, -690, -220, null, null, null, null, null, null] },
    { nom: "Banque et assurances", partie: "Fonctionnement",
      prevu: [-400, -400, -400, -400, -400, -400, -400, -400, -400, -400, -400, -400],
      reel:   [-380, -380, -380, -410, -420, -400, null, null, null, null, null, null] },
    { nom: "Autres frais", partie: "Fonctionnement",
      prevu: [-700, -700, -700, -700, -700, -700, -900, -700, -700, -700, -700, -700],
      reel:   [-650, -650, -650, -820, -760, -150, null, null, null, null, null, null] },

    // ----- État -----
    { nom: "TVA", partie: "État",
      prevu: [-2500, -2500, -2500, -3000, -3500, -3000, -3000, -6500, -2000, -2500, -3000, -3000],
      reel:   [-2500, -2500, -2500, -2900, -3600, 0, null, null, null, null, null, null] },
    { nom: "Impôts et taxes", partie: "État",
      prevu: [0, 0, 0, 0, 0, 0, -1800, 0, 0, 0, 0, 0],
      reel:   [0, 0, 0, 0, 0, 0, null, null, null, null, null, null] },

    // ----- Emprunt et investissements -----
    { nom: "Remboursement d'emprunt", partie: "Emprunt et investissements",
      prevu: [-1200, -1200, -1200, -1200, -1200, -1200, -1200, -1200, -1200, -1200, -1200, -1200],
      reel:   [-1200, -1200, -1200, -1200, -1200, -1200, null, null, null, null, null, null] },
    { nom: "Investissements", partie: "Emprunt et investissements",
      prevu: [0, 0, 0, 0, 0, 0, 0, 0, 0, -1500, 0, 0],
      reel:   [0, 0, 0, 0, -2500, 0, null, null, null, null, null, null] },

    // ----- Épargne (ni entrée ni sortie : argent déplacé entre vos comptes) -----
    { nom: "Mises de côté / retraits", partie: "Épargne",
      prevu: [0, 0, 0, 0, 0, 0, -5000, 0, 0, 0, 0, 0],
      reel:   [0, 0, 0, 0, 0, 0, null, null, null, null, null, null] },
  ],
};

// ---------------------------------------------------------------------
// ENTREPRISE 2 : LA BOULANGERIE
// Deuxième entreprise fictive, pour montrer que chaque dirigeant ne voit que la sienne.
// Même structure que la librairie, avec ses propres catégories.
// ---------------------------------------------------------------------
const DONNEES_BOULANGERIE = {
  entreprise: "Atelier Boulanger Fournil d'Or",
  dateMiseAJour: "2026-11-06",               // date affichée « Mis à jour le … » (format AAAA-MM-JJ)
  seuilAlerte: 3000,                        // seuil de sécurité du compte courant, en euros : seuil FICTIF (démo)
  // Soldes de départ (compte courant et épargne) à la veille du 1er mois de la liste.
  soldeInitial: { date: "2026-05-31", courant: 9000, epargne: 5000 },
  mois: ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03", "2027-04", "2027-05"],
  dernierMoisReel: "2026-10",                // dernier mois dont on connaît le réel ; les suivants sont prévus
  categories: [
    // ----- Activité -----
    { nom: "Ventes en boutique", partie: "Activité",
      prevu: [31000, 30000, 21000, 30000, 31000, 30000, 38000, 28000, 28000, 30000, 31000, 31500],
      reel:   [30030, 30160, 20670, 30370, 31470, 6200, null, null, null, null, null, null] },
    { nom: "Ventes aux professionnels", partie: "Activité",
      prevu: [4500, 3500, 2500, 4500, 4500, 4500, 5500, 4000, 4000, 4500, 4500, 4500],
      reel:   [4270, 3300, 2600, 4370, 4360, 0, null, null, null, null, null, null] },
    // ----- Marchandises -----
    { nom: "Farine et matières premières", partie: "Marchandises",
      prevu: [-9500, -9000, -7000, -9000, -9500, -9500, -12000, -8500, -8500, -9000, -9500, -9500],
      reel:   [-10070, -8970, -7280, -8970, -9660, -2100, null, null, null, null, null, null] },
    { nom: "Emballages", partie: "Marchandises",
      prevu: [-900, -900, -700, -900, -900, -900, -1300, -800, -800, -900, -900, -900],
      reel:   [-860, -910, -730, -900, -930, 0, null, null, null, null, null, null] },
    // ----- Personnel -----
    { nom: "Salaires", partie: "Personnel",
      prevu: [-10000, -10000, -10000, -10000, -10000, -10000, -11000, -10000, -10000, -10000, -10000, -10000],
      reel:   [-10000, -10000, -10000, -10000, -10000, 0, null, null, null, null, null, null] },
    { nom: "Charges sociales", partie: "Personnel",
      prevu: [-4500, -4500, -4500, -4500, -4500, -4500, -4500, -4800, -4500, -4500, -4500, -4500],
      reel:   [-4590, -4260, -4640, -4550, -4390, -4500, null, null, null, null, null, null] },
    // ----- Fonctionnement -----
    { nom: "Loyer et charges", partie: "Fonctionnement",
      prevu: [-2500, -2500, -2500, -2500, -2500, -2500, -2500, -2500, -2500, -2500, -2500, -2500],
      reel:   [-2500, -2500, -2500, -2500, -2500, -2500, null, null, null, null, null, null] },
    { nom: "Énergie (fours)", partie: "Fonctionnement",
      prevu: [-1800, -1700, -1700, -1900, -2100, -2400, -2600, -2700, -2600, -2300, -2000, -1800],
      reel:   [-1700, -1770, -1690, -1950, -2200, 0, null, null, null, null, null, null] },
    { nom: "Banque et assurances", partie: "Fonctionnement",
      prevu: [-350, -350, -350, -350, -350, -350, -350, -350, -350, -350, -350, -350],
      reel:   [-360, -370, -350, -360, -350, -350, null, null, null, null, null, null] },
    // ----- État -----
    { nom: "TVA", partie: "État",
      prevu: [-1700, -1700, -1300, -1500, -1700, -1700, -1700, -2300, -1500, -1500, -1700, -1700],
      reel:   [-1790, -1780, -1240, -1430, -1640, 0, null, null, null, null, null, null] },
    { nom: "Impôts et taxes", partie: "État",
      prevu: [0, 0, 0, 0, 0, 0, -900, 0, 0, 0, 0, 0],
      reel:   [0, 0, 0, 0, 0, 0, null, null, null, null, null, null] },
    // ----- Emprunt et investissements -----
    { nom: "Remboursement d'emprunt (four)", partie: "Emprunt et investissements",
      prevu: [-1600, -1600, -1600, -1600, -1600, -1600, -1600, -1600, -1600, -1600, -1600, -1600],
      reel:   [-1600, -1600, -1600, -1600, -1600, -1600, null, null, null, null, null, null] },
    // ----- Épargne -----
    { nom: "Mises de côté / retraits", partie: "Épargne",
      prevu: [0, 0, 2000, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      reel:   [0, 0, 2000, 0, 0, 0, null, null, null, null, null, null] },
  ],
};

// ---------------------------------------------------------------------
// LISTE DES ENTREPRISES (plus tard : table Entreprises d'Airtable)
// À gauche l'identifiant (utilisé par les comptes ci-dessous), à droite les données.
// Pour ajouter une entreprise : créer un objet comme DONNEES_LIBRAIRIE, puis l'ajouter ici.
// ---------------------------------------------------------------------
const ENTREPRISES = {
  "ent-librairie": DONNEES_LIBRAIRIE,
  "ent-boulangerie": DONNEES_BOULANGERIE,
};

// ---------------------------------------------------------------------
// COMPTES DE CONNEXION (plus tard : table Utilisateurs d'Airtable)
// - role "Admin"     : voit toutes les entreprises (menu « Entreprise affichée »).
// - role "Dirigeant" : voit uniquement l'entreprise indiquée dans « entreprise ».
// ---------------------------------------------------------------------
// ⚠ MAQUETTE SEULEMENT : ici, les mots de passe et toutes les données sont dans la page,
// donc rien n'est réellement protégé. La vraie connexion sera faite par Lovable, côté serveur.
const UTILISATEURS = [
  // Compte d'Elise : accès à toutes les entreprises.
  // Email fictif (pas de vraie adresse dans la maquette : tout le code est lisible par les visiteurs).
  { email: "elise.zieli@test.exemple", motDePasse: "MDPtest123!", nom: "Elise", role: "Admin", entreprise: null },
  // Comptes de test des dirigeants (fictifs).
  { email: "libraire@utopie.example", motDePasse: "demo", nom: "Julie", role: "Dirigeant", entreprise: "ent-librairie" },
  { email: "boulanger@fournildor.example", motDePasse: "demo", nom: "Paul", role: "Dirigeant", entreprise: "ent-boulangerie" },
];
