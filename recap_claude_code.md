# Zieli 26 — Récapitulatif pour Claude Code

*Version finale du 9 novembre 2026 (11 h 40). À lire avant toute intervention sur le projet.*
*Échéance : présentation du projet final Jedha le **17 novembre 2026**.*

## 0. À faire maintenant (par ordre)

1. **Airtable (10-11/11)** — voir la section 3 :
   - supprimer le champ « Mot de passe » ;
   - ajouter « Seuil d'alerte » (5 000 € / 12 000 €) et « Date de mise à jour » dans Entreprises ;
   - ajouter « Mois concerné » et « Statut » dans Commentaires.
2. **Connexion Lovable ↔ GitHub ↔ VS Code (10-11/11)** — voir la section 2 :
   - connecter le projet Lovable existant à GitHub ;
   - cloner le dépôt dans VS Code ;
   - tester un petit changement aller-retour (VS Code → GitHub → Lovable).
3. **Construction de la V1 (12-14/11)** — voir les sections 4, 5 et 7 :
   - comptes et droits ;
   - calcul des soldes (à contrôler avec les chiffres de référence) ;
   - workflow n8n ;
   - report du design.
4. **Test auprès de la libraire, puis présentation** — voir la section 7.

---

## 1. Contexte

- **Porteuse du projet : Elise.** Ancienne directrice de camping, puis DGA d'une association, avec un parcours en contrôle de gestion. Elle suit la formation *Product Builder Essential* chez Jedha (Airtable, Lovable, n8n). Elle débute en code : **expliquez sans jargon et guidez-la pour qu'elle fasse elle-même**, sauf si elle dit « fais-le ». Répondez en **français**.
- **Le projet.** Zieli 26 est une offre de « bras droit financier » pour les dirigeants de petites PME (moins de 3 M€ de CA et moins de 30 salariés). Le MVP est un **tableau de bord de trésorerie** (prévisionnel comparé au réel) destiné à des dirigeants peu à l'aise avec l'informatique.
- **Objectif du MVP :** tester la valeur auprès de quelques dirigeants, sans chercher à livrer un produit complet.
- **Premier client test :** une librairie. Sa comptabilité est saisie dans Sage par un freelance, et Elise met à jour le tableau chaque mois.
- **Budget :** 0 € jusqu'au 17/11, puis 150 €/mois au maximum.
- **Ne pas se disperser :** la trésorerie uniquement. Toute nouvelle idée va dans le « Parking » (section 9).

---

## 2. Architecture et rôles des outils

| Outil | Rôle |
|---|---|
| **Maquette HTML/CSS/JS** (dossier VS Code) | Sert à concevoir le design avec Claude, avant import dans Lovable. Validée et close. |
| **Airtable** (base `zieli26`) | Stocke les données et calcule les totaux **mensuels** (réel, prévu). Le seuil d'alerte se règle par client. |
| **Lovable** | Gère la connexion et les droits, l'affichage, **le calcul des soldes cumulés**, la fenêtre de 12 mois glissants, le point bas et l'alerte. |
| **n8n** | Reçoit les remarques : Lovable → webhook n8n → enregistrement dans Airtable + email à Elise (alerte distincte si la remarque est urgente) + copie du texte par email au dirigeant pour les remarques « Explication des écarts ». |
| **GitHub** | Garde le code de l'application et son historique (sauvegarde, retour en arrière possible). C'est le pont entre Lovable et VS Code, avec une synchronisation bidirectionnelle sur `main`. Dépôt créé par Lovable. Aucun secret. |
| **VS Code + Claude Code** | Modifier le code sur l'ordinateur (design, calculs des soldes, affichage) sans consommer de crédits Lovable. Commit et push vers GitHub. |

*Répartition (étape 1.7) validée le 09/11.*

**Méthode de travail sur le code (décidée le 09/11)**
- On garde le projet Lovable existant, importé le 06/11 avec sa connexion côté serveur. On ne recommence pas de zéro.
- Ce projet est connecté à GitHub depuis Lovable (Settings → Connectors → GitHub → Connect project). C'est Lovable qui crée le dépôt : il ne peut pas importer un dépôt existant.
- Le dépôt est cloné dans VS Code. Les modifications sont faites avec Claude Code, puis envoyées (commit + push) sur la branche `main` ; la synchronisation est bidirectionnelle avec Lovable.
- **Règles :**
  - travailler uniquement sur `main` ;
  - ne jamais renommer ni supprimer le dépôt ;
  - ne jamais modifier le même fichier en même temps dans Lovable et dans VS Code ;
  - **aucune clé ni aucun secret dans le code envoyé sur GitHub** ;
  - laisser Lovable gérer la partie serveur (connexion, droits, secrets, migrations) ; dans VS Code, se concentrer sur l'affichage et les calculs.
- Le code Lovable est en React / TypeScript / Vite / Tailwind. La maquette HTML/CSS/JS reste dans son propre dossier, comme **référence de design**.

**Contraintes**
- **Lovable gratuit : 5 crédits par jour.** Ne pas faire le design dans Lovable. Envoyer un message complet par chantier et ne pas cliquer sur les suggestions automatiques.
- **Airtable gratuit : 1 000 enregistrements par base.** La base en compte environ 490 aujourd'hui (dont 238 transactions et 202 lignes de prévisionnel).
- **n8n :** démarrer l'essai Cloud de 14 jours au moment de construire le workflow (12/11 au plus tôt). Ne pas utiliser le NAS, qui ne doit pas être exposé à Internet.

---

## 3. Base Airtable « zieli26 »

Identifiant de la base : `app3K4PQkkZFAxipC`.

| Table | ID | Contenu |
|---|---|---|
| Entreprises | `tblna9EWuSbSHsXT8` | 2 entreprises fictives (librairie et boulangerie ; la menuiserie et l'atelier de couture ont été supprimés) ; Solde initial courant / Solde initial épargne / Date du solde initial (31/07/2026) |
| Utilisateurs | `tblLaN6W8FfjOELV3` | Nom, email, Rôle (Admin / Dirigeant), Entreprises |
| Catégories | `tblOpdvbRhk7UMNj6` | 18 catégories (« Ligne »), Partie, Sens (Entrée / Sortie / Interne), Ordre |
| Transactions | `tblZDrxbfp6fR50I4` | Réel d'août à octobre 2026 ; Montant = Crédit + Débit ; Mois (AAAA-MM) |
| Prévisionnel | `tblnrDOjAypfP1ma8` | Lignes par entreprise × mois × catégorie ; « Montants prévus » ; « Hypothèses » |
| Synthèse mensuelle | `tblzd9cEKdaI7QEb9` | Une ligne par entreprise × mois : Entrées / Sorties / Épargne / Cash in – Cash out, en réel et en prévu |
| Commentaires | `tbldrpNuforNgrkv4` | Date, Entreprise, Caractère urgent, Type de commentaire, Texte libre |

**Entreprises de la démo**

| Entreprise | ID | Solde initial courant | Solde initial épargne | Seuil d'alerte |
|---|---|---|---|---|
| Librairie l'Utopie | `rec53om2huapFZgGN` | 18 000 € | 10 000 € | 5 000 € (10 000 € pendant la démo pour montrer l'alerte rouge) |
| Atelier Boulanger Fournil d'Or | `recSL1ALPdEGzbmKI` | 6 000 € | 5 000 € | 12 000 € |

**Couverture des données (Synthèse mensuelle)**
- Réel : août à octobre 2026. Il n'y a pas encore de réel pour novembre.
- Prévu : septembre 2026 à mai 2027, pour les 2 entreprises.
- Juin et juillet 2026 : aucune donnée, ils s'afficheront « — ».

**Vérifications du 09/11**
- Les calculs mensuels du réel et du prévu sont justes ; aucune erreur de signe ni de doublon.
- Modifications faites ce jour :
  - janvier 2027 de la librairie corrigé : achats −22 000 € et TVA −2 800 € ;
  - prévisionnel de mai 2027 créé pour les 2 entreprises (enregistrements Synthèse `recLMB8DTCAp5jgPI` et `recf38lcH3KIxknPA`) ;
  - ces modifications sont tracées dans le champ « Hypothèses ».
- Corrections faites par Elise :
  - emails fictifs ;
  - Mickael passé Dirigeant d'une seule entreprise ;
  - Paul supprimé ;
  - champ de lien renommé ;
  - menuiserie et atelier de couture supprimés, avec leurs transactions ; il ne reste aucune transaction orpheline.

**À faire dans Airtable avant la construction dans Lovable (10-11/11, ne coûte aucun crédit Lovable)**
- [ ] **Utilisateurs** : supprimer le champ « Mot de passe ». Il est encore présent et rempli. Les mots de passe sont gérés uniquement par Lovable.
- [ ] **Entreprises** : ajouter « Seuil d'alerte » (devise) et « Date de mise à jour » (date).
- [ ] **Commentaires** : ajouter « Mois concerné » et « Statut ».

---

## 4. Règles de calcul (à coder dans Lovable)

- **Signes :** entrées en positif, sorties en négatif, partout (réel et prévu). Une épargne négative correspond à de l'argent mis de côté ; une épargne positive à un retrait.
- **Cash in – Cash out** = entrées + sorties, hors épargne.
- **Solde fin de mois du compte courant** = solde fin du mois précédent + Cash in – Cash out + épargne. Le point de départ est le solde initial courant au 31/07/2026.
- **Solde épargne fin de mois** = solde épargne précédent − épargne du mois.
- **Total disponible** = compte courant + épargne.
- **Mois passés :** soldes au réel. **Mois en cours et mois à venir :** soldes au prévu, enchaînés à partir du dernier solde réel.
- **Le réel partiel du mois en cours n'entre pas dans les soldes de fin de mois.** Il sert seulement au **solde à la date de mise à jour**, affiché sur la carte « Total disponible » : solde de début du mois en cours + réel arrivé depuis le 1er.
- **Fenêtre de 12 mois glissants :** 5 mois passés, le mois en cours et 6 mois à venir. Elle avance seule chaque mois.
- **Mois sans données : afficher « — » et interrompre la courbe. Ne jamais les compter comme zéro.** Aucune estimation automatique dans le MVP.
- **Point bas :** le plus bas solde de fin de mois du compte courant sur le mois en cours et les 6 mois à venir. Il est comparé au seuil de l'entreprise.

### Chiffres de référence pour contrôler le code (calculés le 09/11)

**Librairie l'Utopie**

| Mois | Nature | Compte courant | Épargne | Total disponible |
|---|---|---|---|---|
| 2026-08 | réel | 10 555 | 13 000 | 23 555 |
| 2026-09 | réel | 22 426 | 13 000 | 35 426 |
| 2026-10 | réel | 22 712 | 11 000 | 33 712 |
| 2026-11 | prévu | 22 112 | 11 000 | 33 112 |
| 2026-12 | prévu | 28 062 | 19 000 | 47 062 |
| 2027-01 | prévu | **9 912** (point bas) | 19 000 | 28 912 |
| 2027-02 | prévu | 12 162 | 19 000 | 31 162 |
| 2027-03 | prévu | 13 462 | 19 000 | 32 462 |
| 2027-04 | prévu | 14 812 | 19 000 | 33 812 |
| 2027-05 | prévu | 16 762 | 19 000 | 35 762 |

**Atelier Boulanger Fournil d'Or**

| Mois | Nature | Compte courant | Épargne | Total disponible |
|---|---|---|---|---|
| 2026-08 | réel | 9 114 | 5 000 | 14 114 |
| 2026-09 | réel | 12 825 | 5 000 | 17 825 |
| 2026-10 | réel | 16 370 | 5 000 | 21 370 |
| 2026-11 | prévu | **20 730** (point bas) | 5 000 | 25 730 |
| 2026-12 | prévu | 26 040 | 5 000 | 31 040 |
| 2027-01 | prévu | 31 850 | 5 000 | 36 850 |
| 2027-02 | prévu | 29 960 | 5 000 | 34 960 |
| 2027-03 | prévu | 30 320 | 9 000 | 39 320 |
| 2027-04 | prévu | 27 680 | 5 000 | 32 680 |
| 2027-05 | prévu | 33 040 | 5 000 | 38 040 |

Si Lovable affiche exactement ces chiffres, le calcul est bon.

---

## 5. Écran (de haut en bas)

1. **Connexion.** Deux profils : Admin (Elise, qui choisit l'entreprise) et Dirigeant (qui ne voit que son entreprise). La table Utilisateurs fait le lien par l'email.
2. **Carte « Total disponible »** : soldes réels à la date de mise à jour, avec la mention « Mis à jour le … ».
   - La carte affiche déjà une sous-ligne qui détaille le total entre compte courant et épargne.
   - **Couleur de la barre** (validée le 09/11) : elle dépend du **solde du compte courant à la date de mise à jour**, comme les alertes. Elle ne dépend pas du total disponible.
     - **rouge** si compte courant < seuil ;
     - **orange** si seuil ≤ compte courant < 1,5 × seuil ;
     - **neutre** (bleu marine) au-delà.
   - Rôles distincts : la carte montre **le présent**, le bandeau montre **l'avenir** (point bas d'ici 6 mois).
   - Exemple avec le réel au 31/10 :
     - librairie : 22 712 € pour un seuil de 5 000 € → neutre ;
     - boulangerie : 16 370 € pour un seuil de 12 000 € → orange.
3. **Graphique sur 12 mois :**
   - solde, avec un point « aujourd'hui » (trait plein avant, pointillés après) ;
   - entrées en vert, sorties en orange, seuil en rouge ;
   - montant au survol.
4. **Bandeau d'alerte**, toujours affiché, avec le point bas d'ici 6 mois. Trois cas :
   - déjà sous le seuil (rouge) ;
   - passage sous le seuil prévu (rouge) ;
   - aucun passage (bleu clair).
5. **Tableau mensuel** dépliable par niveaux :
   - Solde fin de mois – compte courant (bleu, seule ligne visible au départ) ;
   - au clic : Entrées et Sorties, puis Cash in – Cash out (beige), Solde épargne fin de mois, Total disponible ;
   - mois passés : réel seul, avec Prévu et Écart au clic ; mois en cours : Prévu + « Réel au [date] », sans écart ;
   - réel en noir, prévu en bleu foncé italique ; montants négatifs entre parenthèses.
6. **Bloc « Une remarque ? »** : type (Sur le prévisionnel / Explication des écarts / Besoin d'un échange), commentaire, urgent (oui / non), mois concerné. Tous les champs sont facultatifs.

**Charte (close)**
- Style sobre et éditorial : fond blanc cassé chaud, gris chauds, bleu marine.
- Titres en Source Serif 4 ; texte et chiffres en Public Sans à chiffres de même largeur.
- Blocs en relief (ombre douce, sans bordure).

---

## 6. Sécurité (non négociable)

- Mots de passe gérés **uniquement** par Lovable, jamais dans Airtable ni dans le code.
- Le serveur ne renvoie que les données de l'entreprise autorisée. La clé Airtable reste un **secret côté serveur**.
- Données de test fictives : emails en `.exemple`, Admin `elise.zieli@test.exemple`.
- RGPD et hébergement des données financières : à traiter avant tout usage réel.

---

## 7. Feuille de route — état au 09/11

| # | Étape | Statut |
|---|---|---|
| 0.1-0.2 | Cadrage et périmètre | validé |
| 1.1 | Cadrage du MVP | validé |
| 1.2 | Besoin du dirigeant (guide d'entretien, critère « point bas d'ici 6 mois ») | validé |
| 1.3 | Base Airtable | validé (reste : supprimer « Mot de passe ») |
| 1.4 | Structure du tableau | validé (soldes cumulés reportés en 1.9) |
| 1.5 | Prévisionnel / réel (12 mois glissants, « — » pour les mois vides) | validé |
| 1.6 | Indicateurs et alertes (seuils : librairie 5 000 €, boulangerie 12 000 € ; couleur de la carte, coefficient 1,5) | validé |
| 1.7 | Répartition des rôles (section 2) | validé |
| 1.8 | Maquette HTML/CSS/JS | validé |
| 1.8 bis | Connexion Lovable ↔ GitHub ↔ VS Code, et préparation d'Airtable (10-11/11) | à faire |
| 1.9 | Construction de la V1 dans Lovable (12-14/11) | à faire |
| 1.10 | Test auprès de la libraire (15/11) | à faire |
| 1.11 | Ajustements et présentation Jedha (16-17/11) | à faire |

**Ordre de construction pour la 1.9** (prévu pour tenir si les crédits Lovable manquent) :
1. Comptes et droits côté serveur, puis connexion à Airtable.
2. Calcul des soldes, de la fenêtre de 12 mois et du point bas, contrôlé avec les chiffres de référence de la section 4.
3. Workflow n8n des remarques.
4. Report du design depuis la maquette (README), **de préférence dans VS Code avec Claude Code** pour économiser les crédits Lovable.

**Test auprès de la libraire (1.10)**
- **Date à confirmer :** le 15/11 tombe un dimanche. Si le test glisse au 16/11, il ne reste qu'une journée pour les ajustements.
- **Données :** elle teste sur les données **fictives** de « Librairie l'Utopie ». C'est valable pour tester la lisibilité, moins pour tester la valeur : le signal « elle cite une décision » sera moins fiable.
- **Connexion (recommandation, à confirmer) :** elle se connecte elle-même avec le compte Dirigeant de la librairie. Pour le test, remplacer temporairement l'email fictif de Mickael par le sien.
- **Critère de réussite** (guide d'entretien) : sans aide et en moins de 2 minutes, elle répond à « Quel sera votre solde fin du mois prochain, et quel est votre point bas d'ici 6 mois ? ». Signal 1 : elle cite une décision qu'elle prendrait grâce au tableau. Signal 2 : elle accepte de le consulter le mois suivant, à une date fixée ensemble.

**Présentation (1.11)**
- Demander au prof le format attendu (durée, démo en direct, support) en même temps que la question sur les crédits.
- **Proposé, à confirmer :** enregistrer le 16/11 une vidéo de secours de la démo.
- Scénario de démo des alertes :
  - carte de la librairie en neutre ;
  - carte de la boulangerie en orange (16 370 € pour un seuil de 12 000 €) ;
  - passage en direct du seuil de la librairie à 10 000 € dans Airtable, ce qui affiche le bandeau rouge (point bas de janvier à 9 912 €).

---

## Journal des décisions du 09/11

- Les soldes cumulés sont calculés dans Lovable, pas dans Airtable.
- Affichage sur 12 mois glissants : 5 mois passés, le mois en cours et 6 mois à venir.
- Un mois sans données s'affiche « — ». Aucune estimation automatique (l'estimation N-1 est au Parking).
- Janvier 2027 de la librairie corrigé, et prévisionnel de mai 2027 créé (fait par Claude dans Airtable).
- Seuil d'alerte de la boulangerie : 12 000 €. La librairie passe à 10 000 € pendant la démo.
- Couleur de la carte selon le compte courant, avec un coefficient de 1,5.
- Répartition des rôles validée, y compris GitHub et VS Code.
- On garde le projet Lovable existant et on le connecte à GitHub : on ne recommence pas de zéro.
- Le 2e dirigeant passe au Parking. Critère du guide corrigé (6 mois).
- Le point bas inclut le mois en cours (boulangerie : 20 730 € fin novembre, au lieu de 26 040 € fin décembre).
- Les explications d'écarts passent par le formulaire « Une remarque ? » (type « Explication des écarts »), via un bouton « Expliquer ces écarts » sous le bandeau. Le dirigeant reçoit une copie de son texte par email (n8n).

---

## 8. À revérifier

- Jedha fournit-il des crédits Lovable, Airtable ou n8n ? Sinon, Lovable Pro (25 $ pour un mois) est la seule dépense qui sécuriserait la démo. C'est à Elise de décider.
- Jedha accepte-t-il un projet final sans Lovable, si l'outil change après le 17/11 ?
- Fréquence de mise à jour du réel : avec une mise à jour mensuelle via Sage, la carte reste figée la plupart du mois.
- Au test, la libraire comprend-elle le réel partiel, le dépliage du tableau, les parenthèses et « Cash in – Cash out » ?
- Nature des retraits et des dépôts d'espèces (à demander à la libraire).
- Coût des abonnements par client et qui les paie ; temps de traitement des remarques et de mise à jour du prévisionnel (incidence sur le prix en phase 2).
- Pérennité d'Airtable après le rachat par Bending Spoons : garder un export des données.

---

## 9. Parking (ne pas traiter avant le 17/11)

- Tableau de rentabilité, budget, prix de vente, indicateurs clés.
- Tests auprès d'un 2e dirigeant et d'autres dirigeants.
- Estimation automatique des mois sans prévisionnel (même mois de l'année N-1, affichée « estimation automatique ») et rappel n8n quand l'horizon fait moins de 6 mois.
- Catégorisation automatique (par règles, avec une option IA).
- Connexion bancaire DSP2, import Sage automatique, facturation électronique.
- Agent IA, veille sectorielle, invitation automatique des dirigeants.
- Slide « Veille » dans le point de trésorerie mensuel : actualité du mois du secteur de la trésorerie, à partir de pages sources données par Elise.
- Explications d'écarts visibles par le dirigeant.
- Hébergement alternatif (Cloudflare Pages, Softr).
- Mascotte.
- Colonne « Reste à venir », légende sous le tableau, bulle « d'où vient ce solde ».
- Niveau orange du bandeau d'alerte et alerte par email sur les soldes. (En V1, l'orange existe uniquement sur la carte « Total disponible » ; le bandeau reste rouge ou bleu clair, et l'email n8n est réservé aux remarques.)
- Totaux calculés par n8n, suivi commercial dans Airtable.
- Partenariats avec experts-comptables, élargissement aux associations.
- Exercices guidés VS Code.
