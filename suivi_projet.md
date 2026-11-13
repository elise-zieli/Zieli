# Zieli — Suivi du projet

*Mis à jour le 12 novembre 2026. Document unique : notice d'utilisation, état du projet, étapes restantes et Parking.*
*Échéances : **présentation du projet au formateur le 16 novembre 2026** (pas encore la certification) ; puis **certification CDA – Bloc 1** à une date à réserver (voir section 12).*

Remplace `recap_claude_code.md`, `COMMENT_UTILISER.md` et le README de la maquette (fusionnés le 12/11).

---

## 0. À faire maintenant (par ordre)

1. **Test auprès de la libraire** (au plus tard le 15/11, idéalement le 14), voir section 8.
2. **Préparer la présentation au formateur** (16/11), voir section 8.
3. **Préparer la certification Bloc 1** (dossier de 30 à 40 pages, Dossier Professionnel, preuves C1 à C4), voir section 12.

> n8n à jour le 12/11 (3 workflows) : nouveau PowerPoint, nouveaux e-mails, récapitulatif envoyé aux clients à 12 h, contrôle à 8 h.
> Règle à retenir : les fichiers `.js` se collent dans les **nœuds de code**, les fichiers `.html` / `.txt` dans les **nœuds e-mail** ; après modification, **Save puis Publish**.

> Lovable n'est plus utilisé (décision du 12/11) : le site est construit dans VS Code et publié sur Netlify.

---

## 1. Contexte

- **Porteuse du projet : Elise.** Ancienne directrice de camping, puis DGA d'une association, parcours en contrôle de gestion. Formation *Product Builder Essential* chez Jedha (Airtable, Lovable, n8n). Elle débute en code : **expliquer sans jargon et la guider pour qu'elle fasse elle-même**, sauf si elle dit « fais-le ». Répondre en **français**.
- **Le projet.** Zieli est une offre de « bras droit financier » pour les dirigeants de petites PME (moins de 3 M€ de CA, moins de 30 salariés). Le MVP est un **tableau de bord de trésorerie** (prévisionnel comparé au réel) pour des dirigeants peu à l'aise avec l'informatique.
- **Objectif du MVP :** tester la valeur auprès de quelques dirigeants, sans livrer un produit complet.
- **Premier client test :** une librairie. Comptabilité saisie dans Sage par un freelance ; Elise met à jour le tableau chaque mois.
- **Budget :** 0 € jusqu'au 16/11, puis 150 €/mois au maximum.
- **Ne pas se disperser :** la trésorerie uniquement. Toute nouvelle idée va au **Parking** (section 11).

---

## 2. Architecture (état au 12/11)

| Outil | Rôle |
|---|---|
| **Site HTML/CSS/JS** (dossier `zieli26-vscode`) | Le tableau de bord : connexion, carte, graphique, alerte, tableau mensuel, formulaire de remarques. |
| **Airtable** (base `zieli26`) | Stocke les données (entreprises, catégories, transactions, prévisionnel, commentaires). |
| **serveur.ps1** (sur l'ordinateur) | Serveur local : lit Airtable et transmet les remarques à n8n. Lancé par `Lancer le site.bat`. |
| **Netlify** | Met le site en ligne : https://zieli-jedha.netlify.app/ (protégé par mot de passe). Les « fonctions » du dossier `netlify/functions` font le même travail que serveur.ps1. |
| **n8n** (n8n.jedha.co) | 3 workflows, voir section 6. |
| **GitHub** (dépôt privé `elise-zieli/Zieli`) | Garde le code et son historique. Chaque envoi sur `main` met Netlify à jour automatiquement. |
| **VS Code + Claude Code** | Modifier le code sur l'ordinateur, puis envoyer sur GitHub (commit + push). |

**Règles**
- Travailler uniquement sur `main`. Ne jamais renommer ni supprimer le dépôt.
- **Aucune clé ni aucun secret dans le code envoyé sur GitHub.** Les clés sont dans `airtable-token.txt` et `n8n-cle.txt` (à côté du dossier du site, exclus de GitHub), et dans Netlify.

**Contraintes**
- Airtable gratuit : 1 000 enregistrements par base (environ 660 au 13/11).
- Netlify gratuit : largement suffisant pour le MVP.

---

## 3. Utiliser le site

### Sur l'ordinateur (vrais chiffres Airtable)
1. Double-cliquer sur **`Lancer le site.bat`** (dossier `zieli26-vscode`). Le site s'ouvre sur **http://localhost:8000/**.
2. Laisser la fenêtre noire ouverte tant qu'on utilise le site.
3. Après une modification du code : enregistrer (Ctrl + S), puis recharger la page (F5).

Les chiffres sont lus dans Airtable au lancement du serveur, puis relus **uniquement avec le bouton « Synchronisation »**. Une modification dans Airtable n'apparaît donc qu'après un clic sur ce bouton.
Un bandeau rouge s'affiche si Airtable ne répond pas : les chiffres affichés sont alors les chiffres **fictifs** de `donnees.js`.

### En ligne (Netlify)
- Adresse : **https://zieli-jedha.netlify.app/**
- Clés enregistrées dans Netlify (*Site configuration → Environment variables*) : **`AIRTABLE`** (clé Airtable) et **`n8n`** (clé du webhook n8n).
- Mise à jour : envoyer le code sur GitHub ; Netlify publie en 1 à 2 minutes (onglet *Deploys*).
- En cas de problème : onglet *Logs → Functions* (messages « ECHEC »).

### Comptes de démonstration
- Admin (toutes les entreprises) : `elise.zieli@test.exemple`, mot de passe défini dans `donnees.js`.
- Dirigeants, mot de passe `demo` : `libraire@chapitre-un.example`, `boulanger@fournildor.example`.
- ⚠ Maquette : la connexion se fait dans la page, rien n'est réellement protégé (voir section 7).

### Voir la version téléphone
Dans Chrome : **F12**, puis **Ctrl + Maj + M**, et choisir un modèle (ex. iPhone 12 Pro).

### Où modifier quoi
| Je veux changer… | Fichier | Où regarder |
|---|---|---|
| Une couleur | `styles.css` | les variables tout en haut (`--principale`, `--dore`, `--vert`…) |
| Le logo d'une entreprise cliente | **Airtable** | table Entreprises, champ **Logo** (puis « Synchronisation ») |
| Le logo Zieli ou sa signature | `index.html` | chercher « Logo Zieli » |
| Un texte affiché (titre, libellé) | `index.html` | chercher le texte avec Ctrl + F |
| Un libellé du tableau (« Encaissements »…) | `app.js` | section 3.6 TABLEAU MENSUEL |
| Un montant, une catégorie, le seuil d'alerte | **Airtable** | tables Transactions, Prévisionnel, Entreprises |
| Les chiffres de secours (fictifs) | `donnees.js` | `DONNEES_LIBRAIRIE`, `DONNEES_BOULANGERIE` |
| Le graphique | `app.js` | section 3.5 GRAPHIQUE |
| Le bloc « Une remarque / une question ? » | `index.html` (champs) et `app.js` (section 3.7) | |

### Bonnes pratiques
- **Une modification à la fois**, puis Ctrl + S et vérifier le rendu.
- Page blanche : F12 dans le navigateur, onglet **Console** ; le message rouge indique la ligne en erreur.
- Ne jamais mettre de vraie donnée client ni de clé dans les fichiers du site : tout ce qui est dans la page est lisible.

### Fichiers du projet
| Fichier | Rôle |
|---|---|
| `zieli26-vscode/index.html` | Structure de la page (connexion + tableau de bord) |
| `zieli26-vscode/styles.css` | Apparence (couleurs, tailles, version téléphone) |
| `zieli26-vscode/app.js` | Connexion, calculs, graphique, tableau, formulaire de remarques |
| `zieli26-vscode/donnees.js` | Comptes de démonstration + chiffres fictifs de secours. **Nécessaire** : sans lui, la connexion et les chiffres Airtable ne fonctionnent pas. |
| `zieli26-vscode/serveur.ps1`, `Lancer le site.bat` | Serveur local |
| `zieli26-vscode/netlify/` | Fonctions Netlify (même rôle que serveur.ps1, en ligne) |
| `zieli26-vscode/logos-demo/` | Logos fictifs de la librairie et de la boulangerie |
| `netlify.toml` | Réglages Netlify |
| `test_libraire.md` | Fiche de déroulé du test avec la libraire (à imprimer) |
| `presentation_16-11.md` | Fiche de la présentation de 8 min au formateur (16/11) ; diapositives : https://claude.ai/artifact/GsNe48gYFdvPjjVMBSKhZC |
| `test_libraire_exemple_fictif.md` | Exemple de fiche remplie avec des réponses **fictives** (pour la démo, présenté comme tel) |
| `n8n-workflow-*.json` | Copies de sauvegarde des 3 workflows n8n |
| `n8n-code-fabriquer-powerpoint.js` | Code du nœud n8n « Fabriquer les PowerPoint » (récapitulatif mensuel + e-mail au dirigeant) |
| `n8n-code-verifier-les-donnees.js` | Code du nœud n8n « Verifier les donnees » (e-mail de contrôle mensuel) |
| `emails-n8n/*.html`, `copie-dirigeant-objet.txt` | Textes des e-mails du formulaire de remarques (à coller dans les nœuds e-mail) |
| `zieli26-vscode/logo-zieli.png` | Logo Zieli en image (utilisé dans les PowerPoint ; réutilisable ailleurs) |
| `airtable-token.txt`, `n8n-cle.txt` | Clés secrètes (jamais sur GitHub) |

---

## 4. Base Airtable « zieli26 »

Identifiant de la base : `app3K4PQkkZFAxipC`.

| Table | ID | Contenu |
|---|---|---|
| Entreprises | `tblna9EWuSbSHsXT8` | Nom, Solde initial courant, Solde initial épargne, Date du solde initial (30/04/2026), Seuil d'alerte, Logo (image PNG ou JPG affichée à gauche du nom, sur le site et dans le PowerPoint ; logos fictifs dans `zieli26-vscode/logos-demo`) |
| Utilisateurs | `tblLaN6W8FfjOELV3` | Nom, email, Rôle (Admin / Dirigeant), Entreprises |
| Catégories | `tblOpdvbRhk7UMNj6` | 18 catégories (« Ligne »), Partie, Sens (Entrée / Sortie / Interne), Ordre |
| Transactions | `tblZDrxbfp6fR50I4` | Réel ; Montant = Crédit + Débit ; Mois (AAAA-MM) |
| Prévisionnel | `tblnrDOjAypfP1ma8` | Entreprise × mois × catégorie ; « Montants prévus » ; « Hypothèses » |
| Synthèse mensuelle | `tblzd9cEKdaI7QEb9` | Entreprise × mois : Entrées / Sorties / Épargne / Cash in – Cash out, réel et prévu |
| Commentaires | `tbldrpNuforNgrkv4` | Date, Entreprise, Caractère urgent, Type, Texte, Mois concerné, Statut (Nouveau / Traité) |

| Entreprise | ID | Solde initial courant | Solde initial épargne | Seuil d'alerte |
|---|---|---|---|---|
| Librairie Chapitre Un | `rec53om2huapFZgGN` | 21 495 € | 8 000 € | 10 000 € (confirmé par la libraire le 12/11) |
| Atelier Boulanger Fournil d'Or | `recSL1ALPdEGzbmKI` | 2 710 € | 5 000 € | 12 000 € |

*Soldes initiaux au 30/04/2026 (historique de mai à juillet ajouté le 13/11). Fin juillet, on retrouve les anciens soldes de départ : 18 000 € / 10 000 € pour la librairie, 6 000 € / 5 000 € pour la boulangerie.*

- Le site affiche toutes les catégories qui ont au moins un montant, triées par « Ordre ».
- « Mis à jour le … » = date de la dernière transaction de l'entreprise.
- Les 7 parties : Activité, Marchandises, Personnel, Fonctionnement, État, Emprunt et investissements, Épargne.

---

## 5. Règles de calcul

- **Signes :** entrées en positif, sorties en négatif, partout (réel et prévu). Épargne négative = argent mis de côté ; positive = argent repris.
- **Solde du mois** = encaissements + décaissements, hors épargne.
- **Solde fin de mois du compte courant** = solde fin du mois précédent + solde du mois + épargne. Départ : solde initial courant au 30/04/2026.
- **Solde compte épargne fin de mois** = solde épargne précédent − épargne du mois.
- **Total disponible** = compte courant + épargne.
- **Mois passés :** au réel. **Mois en cours et à venir :** au prévu, enchaînés à partir du dernier solde réel.
- **Le réel partiel du mois en cours n'entre pas dans les soldes de fin de mois.** Il sert seulement au solde « aujourd'hui » (carte « Total disponible ») : solde de début du mois en cours + réel arrivé depuis le 1er.
- **Écart** = réel − prévu (un écart négatif est toujours défavorable).
- **Fenêtre de 12 mois glissants :** 5 mois passés, le mois en cours, 6 mois à venir.
- **Point bas :** plus bas solde de fin de mois du compte courant, du mois en cours aux 6 mois à venir, comparé au seuil.

### Chiffres de référence (calculés le 09/11)

**Librairie Chapitre Un**

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

---

## 6. Écran (de haut en bas) et automatisations

1. **Barre du haut :** nom, rôle, « Se déconnecter », bouton « Synchronisation » ; menu « Entreprise affichée » pour l'Admin.
2. **Carte « Total disponible »** : soldes réels à la date de mise à jour, détail compte courant / épargne. Couleur selon le **compte courant** : rouge si < seuil, orange si < 1,5 × seuil, bleu pétrole au-delà. La carte montre le présent, le bandeau l'avenir.
3. **Graphique sur 12 mois :** solde du compte courant (plein pour le réel, pointillés pour le prévu), point « aujourd'hui », encaissements (vert), décaissements (orange), seuil (rouge), montant au survol. Période au choix (« Du … au … ») et bouton « 12 mois glissants ».
4. **Bandeau d'alerte**, toujours affiché, avec le point bas : déjà sous le seuil (rouge) / passage sous le seuil prévu (rouge) / aucun passage (bleu clair). Bouton « Expliquer ces écarts » dessous.
5. **Tableau mensuel** (validé le 12/11), lignes dans cet ordre, toutes visibles :
   1. **Encaissements** (vert) : clic ▸ pour le détail. S'il n'y a qu'une partie (Activité), elle est masquée et les catégories s'affichent directement.
   2. **Décaissements** (orange) : clic ▸ pour le détail par partie.
   3. **Solde du mois (encaissements – décaissements)** (beige, texte fin).
   4. **Solde fin de mois – compte courant** (bleu clair ; rouge sous le seuil).
   5. **Solde compte épargne fin de mois** (beige léger, comme le solde du mois).
   6. **Total disponible (courant + épargne)** (bleu).
   - Lignes 3 à 6 : montant négatif en rouge.
   - Mois passés : réel seul, Prévu et Écart au clic sur le mois. Mois en cours : Prévu + « Réel au [date] ». Mois à venir : prévu.
   - Clic sur « % » : part de chaque ligne dans le total des encaissements ou des décaissements.
   - Réel en noir, prévu en bleu foncé italique ; négatifs entre parenthèses ; écart défavorable en rouge, favorable en vert.
   - Téléphone : colonne des libellés étroite (130 px), libellés sur plusieurs lignes, mois qui défilent à côté.
6. **Bloc « Une remarque / une question ? »** : type (Sur le prévisionnel / Explication des écarts / Besoin d'un échange / autre), commentaire, urgent (oui / non), mois concerné. Tous facultatifs, formulaire vide refusé.

**Charte (validée et appliquée au site le 12/11)** — maquettes : https://claude.ai/artifact/T15BV3oe3hnQPRUAmTwaB5
- Typographie : **Manrope** partout (titres, texte, chiffres).
- Couleur principale : **bleu pétrole** `#0e4a5c` (clair `#3f8fa3`, très clair `#cfe2e8`) ; touche **dorée** `#f2b84b`.
- Fond blanc cassé chaud `#faf8f4` ; boutons **en pilule** (bords entièrement arrondis).
- Couleurs du tableau : vert (encaissements), orange (décaissements), beige léger (soldes du mois et de l'épargne), bleus (solde fin de mois, total disponible), rouge (négatifs et seuil) ; renforcées le 12/11.
- **Logo** (plan « T ») : cube 3D façon Rubik's cube (une case dorée sur le dessus) + « zieli » en minuscules, Manrope, avec le bout de la barre du bas du z en doré.
- **Signature** : « Vos chiffres décodés, vos tâches allégées. »
- Emplacement prévu pour le logo de chaque entreprise cliente, à gauche de son nom.
- Ancienne charte (remplacée) : titres Source Serif 4, texte Public Sans, bleu marine.

**Workflows n8n**
| Workflow | Déclenchement | Ce qu'il fait |
|---|---|---|
| Remarques (n8n : « Zieli 26- formulaire ») | Formulaire « Une remarque / une question ? » (webhook `zieli-remarques`) | Enregistre dans Airtable (Commentaires), email à Elise (urgent ou normal), copie au dirigeant pour « Explication des écarts » |
| Contrôle mensuel | Le 5 du mois à 8 h | Vérifie les données Airtable et envoie à Elise les actions à faire |
| Récapitulatif mensuel | Le 5 du mois à 12 h | Fabrique le PowerPoint « récapitulatif mensuel » de chaque entreprise et l'envoie au dirigeant |

---

## 7. Sécurité

- **Maquette :** les mots de passe et les données sont dans la page, rien n'est réellement protégé. Sur Netlify, toute personne qui a le mot de passe du site voit les chiffres de **toutes** les entreprises.
- Version réelle : mots de passe gérés côté serveur, jamais dans Airtable ni dans le code ; le serveur ne renvoie que les données de l'entreprise autorisée.
- Les clés Airtable et n8n restent côté serveur (fichiers locaux exclus de GitHub, variables Netlify).
- Données de test fictives : emails en `.exemple`.
- RGPD et hébergement des données financières : à traiter avant tout usage réel.

---

## 8. Feuille de route — état au 12/11

| # | Étape | Statut |
|---|---|---|
| 0.1-1.2 | Cadrage, MVP, besoin du dirigeant | validé |
| 1.3 | Base Airtable | validé (champ « Mot de passe » supprimé le 12/11) |
| 1.4-1.7 | Structure du tableau, prévisionnel/réel, alertes, répartition des rôles | validé |
| 1.8 | Maquette HTML/CSS/JS | validé, tableau retravaillé le 12/11 |
| 1.8 bis | GitHub ↔ VS Code | fait (dépôt `elise-zieli/Zieli`) |
| 1.9 | V1 : chiffres Airtable, remarques n8n, mise en ligne Netlify | fait et testé en ligne le 12/11 |
| 1.9 bis | Workflows n8n contrôle mensuel et récapitulatif mensuel | faits, mis à jour et publiés le 12/11 |
| 1.9 ter | Nouvelle charte Zieli (Manrope, bleu pétrole, logo) + logo des clients | fait le 12/11 (logos fictifs dans Airtable) |
| 1.10 | Test auprès de la libraire (14 ou 15/11) | à faire |
| 1.11 | Présentation du projet au formateur (16/11) | à faire |
| 1.12 | Certification CDA – Bloc 1 (dossier, DP, démo, entretien) | à préparer, date à réserver sur JULIE |

**Test auprès de la libraire (1.10)** — fiche de déroulé : `test_libraire.md`
- **Date :** la présentation au formateur est le 16/11 ; faire le test au plus tard le 15/11 (dimanche), idéalement le 14, pour garder du temps d'ajustement.
- **Données fictives** de « Librairie Chapitre Un » : valable pour la lisibilité, moins pour la valeur.
- **Connexion :** compte Dirigeant de la librairie (`libraire@chapitre-un.example`).
- **Critère de réussite :** sans aide et en moins de 2 minutes, elle répond à « Quel sera votre solde fin du mois prochain, et quel est votre point bas d'ici 6 mois ? ». Signal 1 : elle cite une décision qu'elle prendrait grâce au tableau. Signal 2 : elle accepte de le consulter le mois suivant, à une date fixée ensemble.

**Présentation (1.11)**
- Demander au prof le format attendu (durée, démo en direct, support).
- Proposé : enregistrer le 15/11 une vidéo de secours de la démo.
- Scénario des alertes : librairie (seuil 10 000 € depuis le 12/11) → carte neutre (22 712 € > 15 000 €) mais bandeau rouge dès l'ouverture (point bas de janvier à 9 912 €) ; boulangerie → carte orange (16 370 € pour 12 000 €). Le changement de seuil en direct n'est plus nécessaire ; pour montrer la Synchronisation, on peut par exemple changer en direct le seuil de la boulangerie dans Airtable.

---

## 9. À revérifier

- ~~Jedha accepte-t-il un projet sans Lovable ?~~ **Oui, confirmé le 12/11.**
- **Vraie connexion sécurisée** (avant tout usage réel) : sans Lovable, il faudra la construire autrement, par exemple avec Netlify Identity ou les fonctions Netlify.
- Jedha fournit-il des crédits Airtable ou n8n ?
- Fréquence de mise à jour du réel : avec une mise à jour mensuelle via Sage, la carte reste figée la plupart du mois.
- Au test, la libraire comprend-elle le réel partiel, le dépliage du tableau, les parenthèses et « Solde du mois » ?
- Nature des retraits et dépôts d'espèces (à demander à la libraire).
- Coût des abonnements par client et qui les paie ; temps de traitement des remarques et de mise à jour du prévisionnel.
- Pérennité d'Airtable après le rachat par Bending Spoons : garder un export des données.

---

## 10. Journal des décisions

**09/11**
- Affichage sur 12 mois glissants ; un mois sans données s'affiche « — », sans estimation automatique.
- Janvier 2027 de la librairie corrigé, prévisionnel de mai 2027 créé.
- Seuils : librairie 5 000 € (10 000 € pendant la démo), boulangerie 12 000 €. *(12/11 : librairie confirmée à 10 000 €.)*
- Couleur de la carte selon le compte courant, coefficient 1,5 (code aligné le 12/11 : il appliquait 2).
- Le point bas inclut le mois en cours.
- Les explications d'écarts passent par le formulaire « Une remarque ? » ; le dirigeant reçoit une copie par email.

**12/11**
- **Abandon de Lovable au profit de Netlify** : le site est construit dans VS Code avec Claude Code et publié sur Netlify via GitHub.
- Le nom de l'entreprise est **Zieli** (et non « Zieli 26 ») : remplacé partout, sauf dans les noms techniques (adresse e-mail, dossier, base Airtable).
- **Nouvelle charte** : Manrope, bleu pétrole, boutons en pilule ; logo cube + z doré ; signature « Vos chiffres décodés, vos tâches allégées. »
- Chiffres relus dans Airtable uniquement avec le bouton « Synchronisation » (serveur local).
- Site mis en ligne sur Netlify, avec les fonctions Netlify (chiffres Airtable + remarques vers n8n).
- Tableau réorganisé : Encaissements, Décaissements, Solde du mois, Solde fin de mois, Solde épargne, Total disponible. « Dépenses » devient « Décaissements » (tableau et graphique).
- Montants négatifs en rouge sur les lignes de solde et de total ; Encaissements : la partie unique (Activité) est masquée.
- La librairie s'appelle **Librairie Chapitre Un** (Airtable et fichiers ; compte démo `libraire@chapitre-un.example`).
- Champ **Logo** ajouté dans la table Entreprises ; logo du client affiché à gauche de son nom (logos fictifs dans `logos-demo`).
- Charte appliquée au site (connexion, en-tête, couleurs, boutons, graphique).
- **E-mails relus et réécrits** : prénom du dirigeant (champ « Responsable légal »), « récapitulatif mensuel » partout, charte Zieli (bandeau « zieli » bleu pétrole), coordonnées du dirigeant dans les e-mails de remarques, « tout est à jour » dans le contrôle mensuel.
- Seuil de la librairie confirmé à **10 000 €** (Airtable et chiffres de secours) ; montant du seuil affiché en rouge à gauche de la ligne « seuil d'alerte » du graphique.
- Tableau retravaillé : Encaissements, Décaissements et Total disponible plus visibles (fonds plus soutenus, texte plus grand ; « Total disponible » en gros avec « (courant + épargne) » en petit dessous) ; Solde du mois et « Solde compte épargne fin de mois » sur un beige léger identique ; quadrillage plus lisible (filets bleus sur les lignes bleues) ; trait pétrole réalisé / prévisionnel épaissi. Graphique : montants de l'axe plus foncés.
- Bloc du site renommé « Une remarque / une question ? » ; option « Besoin d'un échange / autre » (sur le site seulement : Airtable et les e-mails gardent « Besoin d'un échange »).
- **Horaires** : contrôle mensuel à Elise le 5 à 8 h ; récapitulatif aux clients le 5 à **12 h** (au lieu de 9 h).
- **Un seul bloc de commentaires** dans le PowerPoint (le formulaire ne précise pas encaissements / décaissements).
- **PowerPoint mensuel refait** : police Calibri (présente partout), bleu pétrole, logo du client en haut à gauche, mois en pastille, logo Zieli en bas à droite ; diapositive 2 = tableau du site (Réel, % du réel, Prévu, Écart) avec commentaires à côté ; blocs en relief sur la diapositive 3.
- Documentation fusionnée dans ce fichier.

**13/11**
- **Historique ajouté pour la démo** : mai, juin et juillet 2026 (réel et prévisionnel) pour les 2 entreprises, plus le prévisionnel d'août qui manquait. Le solde initial est désormais au **30/04/2026**, et les montants sont recalculés pour que les soldes à partir d'août restent identiques (fin juillet : 18 000 € pour la librairie, 6 000 € pour la boulangerie). Environ 660 enregistrements Airtable sur 1 000.
- **Graphique** : par défaut sur les **12 mois glissants** (5 mois passés, le mois en cours, 6 mois à venir). Choix « Du [mois] au [mois] » parmi tous les mois disponibles, avec un bouton « 12 mois glissants » pour revenir à la vue par défaut. Le point « aujourd'hui » n'apparaît que si la période contient le mois en cours. Le tableau ne change pas. Barre de période sur la ligne du titre, à droite.
- **Assistant RAG « Une question ? »** (bouton en bas à droite du tableau de bord) : répond à partir des documents du dossier `rag/` (règles de calcul, glossaire, FAQ, guides publics), **sans voir les chiffres** de l'entreprise. Passages et empreintes dans Airtable (« Assistant - Connaissances »), questions notées sans nom (« Assistant - Questions »), 2 workflows n8n (indexation + assistant), clé OpenAI uniquement dans n8n. Mode d'emploi : `assistant_mode_emploi.md`.

---

## 11. Parking (ne pas traiter avant le 16/11)

- Tableau de rentabilité, budget, prix de vente, indicateurs clés.
- Tests auprès d'un 2e dirigeant et d'autres dirigeants.
- Estimation automatique des mois sans prévisionnel (même mois N-1, affichée « estimation automatique ») et rappel n8n quand l'horizon fait moins de 6 mois.
- Catégorisation automatique (par règles, avec une option IA).
- Connexion bancaire DSP2, import Sage automatique, facturation électronique.
- Agent IA, veille sectorielle, invitation automatique des dirigeants.
- Slide « Veille » dans le récapitulatif mensuel : actualité du mois du secteur, à partir de pages sources données par Elise.
- Explications d'écarts visibles par le dirigeant.
- Hébergement alternatif (Cloudflare Pages, Softr).
- **Assistant RAG** : version 2 avec les chiffres du dirigeant connecté ; calendrier fiscal et social à ajouter aux documents.
- Mascotte.
- Colonne « Reste à venir », légende sous le tableau, bulle « d'où vient ce solde ».
- Niveau orange du bandeau d'alerte et alerte par email sur les soldes.
- Totaux calculés par n8n, suivi commercial dans Airtable.
- Partenariats avec experts-comptables, élargissement aux associations.
- Exercices guidés VS Code.

---

## 12. Certification CDA – Bloc 1 (RNCP37873BC01)

*Consignes Jedha reçues le 12/11. Bloc 1 seul : « Développer une application sécurisée ». Date à réserver sur JULIE (environ 3 mois d'attente, dans les 6 mois après la formation).*

**Le jour J (1 h 20, chez Jedha, 116 rue du Faubourg Saint-Martin, Paris)**
- 9 h 30 : quiz de 30 min (documentation technique en anglais : 2 QCU en français, 2 questions ouvertes en anglais).
- Au créneau : **20 min de présentation avec démo en direct obligatoire** (comptes de test par rôle), puis **30 min d'entretien technique**.
- À apporter : **dossier de projet imprimé (30 à 40 pages hors annexes)**, diaporama, **Dossier Professionnel** (modèle officiel du ministère).

**Le dossier de projet (4 parties imposées)**
1. Compétences mises en œuvre (C1 à C4 reliées au projet) — 2 à 3 p.
2. Expression des besoins (contexte, problème, personas, objectifs mesurables, In / Out of Scope, contraintes) — 6 à 8 p.
3. Environnement technique (outils et comptes, schéma d'architecture, équivalence avec une architecture logicielle, documentation en anglais utilisée) — 4 à 6 p.
4. Réalisations (preuves avec captures et explications) — 16 à 22 p.
- Annexes (PRD, backlog, exports CSV / JSON, notes de réunion) — 20 p. max.

**Preuves attendues et état au 12/11**
| Compétence | Preuve attendue | État |
|---|---|---|
| C1 Environnement | Tableau des outils, rôles et accès ; historique des versions ; exports JSON n8n | En bonne voie (section 2, GitHub, `n8n-workflow-*.json`) |
| C2 Interfaces | Wireframe vs écran final ; test responsive ; mentions légales, RGPD, RGAA | Maquettes et responsive OK ; **mentions légales / RGPD / accessibilité à faire** |
| C3 Composants métier | Schéma relationnel Airtable ; workflows n8n avec sticky notes ; jeu de tests sans donnée sensible visible | Schéma à dessiner ; **sticky notes à vérifier** ; **jeu d'essai à faire** |
| C4 Gestion de projet | In / Out of Scope ; Kanban avec dates cibles (début et fin) ; un retard réel géré ; 3 Daily Meeting Notes | **À rassembler** (journal et Parking du suivi utiles) |
| Tests de sécurité | **Test d'URL directe** (page protégée sans connexion) et **test inter-rôles** (un utilisateur ne voit pas les données d'un autre) | ⚠ **Échoueraient aujourd'hui** : connexion dans la page, données de toutes les entreprises chargées → vraie connexion côté serveur à construire |

**Points à clarifier avec le formateur**
- Projet sans Lovable : **accepté (confirmé le 12/11)**. Dans le dossier, l'historique GitHub remplace l'historique Lovable, et les maquettes sont comparées à l'écran final du site.
