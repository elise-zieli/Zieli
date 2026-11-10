# Zieli 26 – Tableau de bord de trésorerie (maquette)

Maquette en HTML / CSS / JavaScript pur, à reproduire **fidèlement** dans Lovable.
Utilisateurs : dirigeants de petites PME (ici une librairie), peu à l'aise avec l'informatique
et sans formation financière. Priorité absolue : lisibilité et simplicité.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Structure de la page (écran de connexion + tableau de bord) |
| `styles.css` | Apparence (couleurs, tailles, version téléphone) |
| `donnees.js` | Données **fictives** de 2 entreprises + 3 comptes de démonstration |
| `app.js` | Connexion, calculs de trésorerie, graphique, tableau, formulaire de remarques |
| `docs/apercu_librairie.png` | Capture de référence du rendu attendu |

Pour voir la maquette : ouvrir `index.html` dans Chrome. Comptes de test des dirigeants (mot de passe `demo`) :
`libraire@utopie.example`, `boulanger@fournildor.example`. Le compte Admin est défini dans `donnees.js`.

## Consignes pour Lovable

1. **Reproduire à l'identique** la mise en page, les textes, les couleurs et les comportements
   (clics, dépliages, bulles du graphique). Ne rien ajouter : pas de menu, pas d'autres pages.
2. **Tout en français.** Montants : `12 450 €` (espace pour les milliers, pas de décimales).
   Mois en toutes lettres : « novembre 2026 ».
3. **Connexion et droits d'accès côté serveur (obligatoire)** :
   - la connexion par email + mot de passe est gérée par Lovable (Lovable Cloud), jamais dans le navigateur ;
   - les mots de passe et la liste des utilisateurs de `donnees.js` **ne doivent pas** être repris ;
   - rôle **Dirigeant** : voit uniquement son entreprise ; rôle **Admin** : choisit l'entreprise dans un menu ;
   - le serveur ne renvoie à la page **que** les données de l'entreprise autorisée.
4. **Données** : dans un premier temps, garder les données fictives de `donnees.js` côté serveur.
   Elles seront ensuite remplacées par Airtable (voir plus bas). La clé d'accès Airtable sera un
   secret côté serveur, jamais dans le code de la page.
5. Garder les **calculs** tels quels (voir « Règles de calcul »).

## Contenu de la page (dans l'ordre)

1. Barre du haut : nom de l'utilisateur, rôle, « Se déconnecter » ; menu « Entreprise affichée » pour l'Admin seulement.
2. Nom de l'entreprise, « Votre trésorerie, mois par mois », date de mise à jour.
3. Carte **Total disponible** : soldes RÉELS à la date de mise à jour (compte courant = début du mois en cours
   + réel arrivé depuis le 1er ; épargne = fin du dernier mois clos ± mouvements réels du mois). Pas de date
   dans la carte : la date de référence est « Mis à jour le … » affichée au-dessus.
4. **Graphique** sur 12 mois (5 passés, le mois en cours, 6 à venir) : solde du compte courant
   (trait épais bleu marine, plein pour le réel, pointillés pour le prévu), entrées (ligne fine verte),
   sorties (ligne fine orange, en positif), seuil d'alerte (ligne rouge). Point « aujourd'hui » (solde réel à la date de mise à jour, même chiffre
   que la carte), placé entre fin du dernier mois clos et fin du mois en cours au prorata des jours, avec un
   trait vertical pointillé « aujourd'hui » : trait plein jusqu'à ce point, pointillés ensuite.
   Survol d'un point (ou toucher sur téléphone) : bulle avec le mois, le statut (réel / prévu) et le solde. Pas de texte d'aide sous le titre.
5. **Bandeau d'alerte**, toujours affiché, texte noir en italique ; seuil propre à chaque entreprise
   (champ « Seuil d'alerte » de la table Entreprises ; librairie : 5 000 €). Il donne toujours le point bas
   (solde de fin de mois le plus bas, mois en cours + 6 mois à venir). Trois cas :
   1. compte courant déjà sous le seuil à la date de mise à jour → fond rouge ;
   2. un mois à venir passe sous le seuil → fond rouge, premier mois concerné + point bas ;
   3. aucun passage sous le seuil → fond bleu clair, « Aucun passage sous votre seuil… » + point bas.
6. **Tableau mensuel** : 2 mois passés, le mois en cours, 6 mois à venir.
   - Mois passés (y compris le mois précédent) : Réel seul, clic sur le nom du mois pour voir Prévu et Écart.
   - Pas de texte d'aide sous le titre « Détail mois par mois ».
   - Clic sur le petit « % » d'une colonne Prévu ou Réel : colonne étroite avec la part de chaque ligne
     dans le total des entrées ou des sorties (pas de % sur les lignes Entrées et Sorties elles-mêmes).
   - Lignes, dépliables par niveaux (validé le 07/11) :
     · « Solde fin de mois – compte courant » (fond bleu clair) : seule ligne visible au départ ; clic ▸ pour déplier.
       · « Cash in – Cash out » (fond beige #f1eadc sur toute la ligne) : clic ▸ pour afficher, AU-DESSUS de lui,
         · Entrées (fond vert léger, dépliable par partie puis catégorie) ;
           Sorties (fond orange #fde9d3, dépliable par partie uniquement).
       · « Solde épargne fin de mois » (fond blanc).
       · « Total disponible (courant + épargne) » (fond bleu).
     · Plus de ligne « Solde en début de mois » (doublon du solde de fin du mois précédent).
   - En-tête des mois passés en beige grisé (#e9e3d8), plus en bleu.
   - Colonne des libellés figée à gauche au défilement (seulement la case du coin et les libellés des lignes).
   - Montants négatifs entre parenthèses dans le tableau, ex. (3 500 €) ; parenthèse invisible après les
     positifs pour l'alignement. Les phrases (alerte, bulle, carte) gardent le signe « − ».
   - Écart défavorable en rouge, favorable en vert.
   - Réel / prévu : bandeau « Réalisé » au-dessus des mois passés et « Prévisionnel » au-dessus du mois
     en cours et des mois à venir ; trait vertical marine (3 px) entre les deux zones ; montants réels
     en noir (#111111) ; montants prévus (et en-têtes « Prévu ») en bleu foncé (#1d4f91) et en italique.
   - Filet vertical fin (#cdc6b9) entre chaque mois, jamais entre les colonnes d'un même mois.
   - Trois bandeaux : « Réalisé » (mois clos) / « En cours » / « Prévisionnel » (mois à venir).
   - Mois en cours : colonnes Prévu et « Réel au [date de mise à jour] » (réel partiel), sans Écart.
     Lignes « Solde fin de mois » et « Total disponible » : « — » dans la colonne Réel du mois en cours
     (connu le 1er du mois suivant).
7. **Bloc « Une remarque ? »** (tous les champs facultatifs, formulaire vide refusé), dans cet ordre :
   type de remarque (Sur le prévisionnel / Explication des écarts / Besoin d'un échange), commentaire
   (texte libre), caractère urgent (Oui / Non, « Non » par défaut, « Si oui, je vous recontacte au plus vite »),
   mois concerné (liste adaptée au type). Bouton « Envoyer à Elise ». Liste des demandes envoyées
   (badge rouge « Urgent »). « Urgent : Oui » seul suffit pour envoyer.
   Plus tard : envoi vers un webhook n8n qui enregistre dans Airtable et prévient Elise par email.

## Règles de calcul

- Signes : entrées en positif, sorties en négatif, partout (réel et prévu).
- Épargne : négatif = argent mis de côté (quitte le compte courant), positif = argent repris.
- Solde fin de mois = solde début + entrées + sorties + mouvement d'épargne.
- Report mois après mois : mois passés = réel ; mois en cours et à venir = prévu
  (le réel partiel du mois en cours n'entre pas dans les soldes de fin de mois ; il sert au solde « aujourd'hui »).
- Écart = réel − prévu (avec ces signes, un écart négatif est toujours défavorable).
- Alerte et point bas calculés sur le **compte courant** ; seuil : 5 000 € (variable `SEUIL_ALERTE`).

## Correspondance avec Airtable (base « zieli26 »)

| Airtable | Dans la maquette |
|---|---|
| Entreprises (nom, soldes initiaux, date du solde initial) | `entreprise`, `soldeInitial` |
| Utilisateurs (email, rôle Admin / Dirigeant, entreprise liée) | `UTILISATEURS` (démo uniquement) |
| Catégories (nom, partie, sens) | `categories[].nom` et `categories[].partie` |
| Transactions (montant, mois AAAA-MM, catégorie) | `categories[].reel` (sommes par mois) |
| Prévisionnel (montant prévu, mois, catégorie, hypothèses) | `categories[].prevu` |
| Commentaires (à créer : entreprise, type, commentaire, urgent oui/non, mois, date, statut) | formulaire « Une remarque ? » |

Les 7 parties : Activité, Marchandises, Personnel, Fonctionnement, État, Emprunt et investissements, Épargne.
