# Présentation Zieli au formateur — 16 novembre 2026 · 8 minutes

*Fiche à garder sous les yeux. Diapositives (17) : https://claude.ai/artifact/GsNe48gYFdvPjjVMBSKhZC — mises à jour le 13/11.*

## Avant de commencer (la veille et 15 min avant)
- [ ] Onglet 1 : **https://zieli-jedha.netlify.app/**, mot de passe Netlify déjà saisi, **connectée en libraire** (`libraire@chapitre-un.example` / `demo` : l'en-tête affiche « Sandrine · Dirigeant »).
- [ ] Onglet 2 : **Airtable**, table Entreprises (seuil 10 000 €, logo).
- [ ] Onglet 3 : **n8n**, liste des 5 workflows.
- [ ] Onglet 4 : **Gmail** (pour montrer l'e-mail reçu) — ou téléphone à portée de main.
- [ ] Fichier : un **récapitulatif mensuel** (PowerPoint) ouvert.
- [ ] Diapositives ouvertes, au cas où internet faiblit.
- [ ] Chronomètre lancé.

## Plan des diapositives
| Diapo | Contenu | Usage |
|---|---|---|
| 1 | Titre | ouverture |
| 2 | Le problème | à montrer |
| 3 | Mes personas : Sandrine (librairie) et Karim (boulangerie) | à montrer |
| 4 | Zieli, le bras droit financier | à montrer |
| 5 à 9 | Démo : connexion, tableau de bord, détail et récapitulatif, formulaire, e-mail reçu | **secours** si le site ne répond pas (sinon démo en direct) |
| 10 | Le projet en un schéma (je construis / le dirigeant consulte / j'automatise) | à montrer |
| 11 | Les coulisses : Netlify, Airtable, les 5 automatisations n8n | à montrer |
| 12 | Qui parle à qui, pourquoi, avec quelle clé (schéma) | au choix avec la 13 |
| 13 | Qui appelle qui, quand, avec quelle clé (tableau : déclencheur, sens, clé, action) | au choix avec la 12 |
| 14 | L'assistant « Une question ? » : un RAG | à montrer si le temps le permet |
| 15 | Prochaines étapes | à montrer |
| 16 | Mes questions | à montrer |
| 17 | Merci | clôture |

---

## 0:00 – 1:30 · Le problème, les personas et Zieli
*(diapositives 1 à 4)*
- « Les dirigeants de petites entreprises découvrent souvent leurs difficultés de trésorerie trop tard : leurs chiffres comptables sont illisibles pour eux. »
- « Mes deux personas : **Sandrine**, libraire, dont l'activité est très saisonnière ; **Karim**, boulanger, qui se demande s'il peut investir. Ils sont fictifs, construits à partir de vrais besoins. »
- « Zieli, c'est mon offre de **bras droit financier** : je décode leurs chiffres, je fais ressortir l'essentiel, et j'automatise les tâches pénibles. »

## 1:30 – 4:30 · Démo en direct, côté dirigeant
1. **Connexion** (diapo 5 en secours) → logo Zieli, puis tableau de bord de Sandrine avec le logo de la librairie.
2. **Les 2 questions clés en 30 secondes** :
   - « Combien aurai-je fin décembre ? » → **28 062 €** (tableau).
   - « Quel est mon point bas d'ici 6 mois ? » → **bandeau rouge** : 9 912 € fin janvier, sous son seuil de 10 000 €.
3. **Graphique** (diapo 6 en secours) : réel (trait plein), prévu (pointillés), point « aujourd'hui », ligne rouge du seuil. Choisir la période **de mai 2026 à octobre 2026** (6 mois d'historique), puis revenir avec **« 12 mois glissants »**.
4. **Tableau** (diapo 7 en secours) : déplier **Encaissements** (▸), puis cliquer sur **octobre** pour voir Prévu et Écart.
5. **Formulaire « Une remarque / une question ? »** (diapo 8 en secours) : envoyer une **Explication des écarts** → montrer l'**e-mail reçu** (capture en diapo 9).
6. *(Si le temps le permet)* **Assistant « Une question ? »** : poser « C'est quoi le point bas ? ».

## 4:30 – 6:30 · Les coulisses (côté Elise)
- **Diapo 10 « Le projet en un schéma »** : lire les 3 lignes en 20 secondes : je construis (Claude Code + Airtable → VS Code → serveur local → GitHub, puis Netlify), le dirigeant consulte (Netlify → site Zieli), j'automatise (n8n → Airtable, OpenAI, Gmail).
- **Diapo 11 « Les coulisses »** : « Toutes les données vivent dans Airtable. n8n fait 5 automatisations : les remarques, le contrôle le 5 à 8 h pour moi, le récapitulatif aux clients le 5 à 12 h, l'assistant, et l'indexation de l'assistant. » Le contrôle de 8 h me laisse la matinée pour corriger avant l'envoi de midi.
- **Diapo 12 ou 13** (en garder une selon le temps) : qui appelle qui, pourquoi et avec quelle clé. Insister sur la règle : **aucune clé dans le navigateur ni sur GitHub** ; un **webhook** est l'adresse où mon serveur dépose un message pour n8n, et la clé n8n en est le cadenas. Ne jamais afficher la valeur d'une clé.
- **Diapo 14 « L'assistant : un RAG »** : « d'abord chercher dans mes documents, puis rédiger avec eux seulement ». Exemple vécu : une réponse fausse corrigée en réécrivant le passage dans Airtable.
- **Mes choix techniques** (à dire) : « Construit dans VS Code avec Claude Code, versionné sur GitHub, mis en ligne sur Netlify. J'ai abandonné Lovable : plus de liberté sur le design et pas de limite de crédits. »

## 6:30 – 8:00 · Prochaines étapes et questions
- **Diapo 15 « Prochaines étapes »** :
  - « Pour la bonne conduite du projet, j'ai réalisé un **entretien fictif**, car la dirigeante de la librairie n'est disponible que le 18 novembre. Je passerai mon projet en professionnel après l'entretien réel du 18. » Si on demande, montrer `test_libraire_exemple_fictif.md` en disant clairement qu'il est **fictif**.
  - Avant la certification : vraie connexion côté serveur, mentions légales / RGPD / accessibilité, le Bloc 1 (jeu d'essai, dossier de projet, Dossier Professionnel), et fiabiliser les calculs : le contrôle du 5 vérifiera que les totaux d'Airtable égalent ceux de n8n, et que les chiffres du site égalent ceux du PowerPoint.
  - Pour faire évoluer Zieli : une base sans limite (alternative à Airtable), l'import depuis le logiciel comptable, un assistant qui connaît les chiffres du dirigeant et son calendrier fiscal et social, un agent de veille sectorielle.
- **Diapo 16 « Mes questions »** : qu'attendez-vous pour les tests de sécurité (URL directe, inter-rôles) ? Des conseils pour le dossier ?

---

## Si quelque chose ne marche pas
- **Le site ne charge pas** → passer aux diapositives 5 à 9 (démo de secours).
- **Bandeau rouge « Données Airtable indisponibles »** → le dire calmement : « ce sont les chiffres de secours », et continuer.
- **L'e-mail tarde** → montrer la capture de la diapo 9.
- **Retard sur le temps** → passer la diapo 14 (RAG) et ne garder qu'une des diapos 12 ou 13, en une phrase.
