# Assistant Zieli (RAG) – mode d'emploi

*Créé le 13/11/2026. L'assistant répond aux dirigeants à partir des documents Zieli (règles de calcul, glossaire, FAQ, guides publics). Il ne voit pas les chiffres de l'entreprise.*

## Comment ça marche (en une image)

```
Site (bouton « Une question ? »)
  → serveur.ps1 ou fonction Netlify « assistant »   (la clé n8n reste ici)
  → n8n, workflow « Zieli - assistant »
       1. transforme la question en « empreinte » (embedding OpenAI)
       2. la compare aux 29 passages d'Airtable (table « Assistant - Connaissances »)
       3. garde les 4 passages les plus proches (les 2 premiers sont affichés comme sources)
       4. demande à OpenAI une réponse basée UNIQUEMENT sur ces passages
       5. note la question et la réponse dans Airtable (table « Assistant - Questions »)
  → la réponse revient sur le site, avec ses sources
```

**RAG** = *Retrieval-Augmented Generation* : on va **chercher** les bons passages (retrieval) avant de **rédiger** la réponse (generation).
**Embedding** = une liste de nombres qui résume le sens d'un texte. Deux textes au sens proche ont des embeddings proches.

## Ce qui est déjà fait

| Où | Quoi |
|---|---|
| Airtable | Table **Assistant - Connaissances** (`tblOmbXZr14S1Q7Z5`) avec les 29 passages des 4 documents du dossier `rag/` |
| Airtable | Table **Assistant - Questions** (`tbl0HyvMyCNiYlTjz`) : date, question, réponse, sources, entreprise (sans nom de personne) |
| Fichiers | `n8n-workflow-assistant-indexation.json` et `n8n-workflow-assistant.json` (à importer dans n8n) |
| Site | Bouton « Une question ? » + fenêtre de discussion (`assistant.js`, `index.html`, `styles.css`) |
| Serveurs | Adresse `/api/assistant` dans `serveur.ps1` et dans la fonction Netlify `netlify/functions/assistant.mjs` |

## Ce qu'il te reste à faire

### Étape 1 – Enregistrer ta clé OpenAI dans n8n (une seule fois)
1. Dans n8n, menu de gauche : **Credentials** (ou **Overview → Credentials**) → **Create credential**.
2. Cherche **OpenAI** → colle ta clé dans **API Key** → **Save**. Nomme-la par exemple « OpenAI Zieli ».
3. Conseil : dans ton compte OpenAI (platform.openai.com → *Limits* ou *Billing*), fixe une **limite de dépense mensuelle** (par exemple 5 €).

⚠️ Ne colle jamais la clé OpenAI dans un fichier du projet ni dans un nœud : seulement dans ce Credential.

### Étape 2 – Importer et lancer le workflow d'indexation (calcul des empreintes)
1. n8n → **Create workflow** → menu **⋯** en haut à droite → **Import from File…** → choisis `n8n-workflow-assistant-indexation.json`.
2. Ouvre chaque nœud qui affiche un triangle rouge et choisis le bon Credential :
   - **Lire passages sans embedding** : ton Credential Airtable habituel.
   - **Calculer embedding** : Credential « OpenAI Zieli ».
   - **Enregistrer embedding** : ton Credential Airtable (type *Airtable Personal Access Token*).
3. **Save**, puis **Execute workflow** (bouton du bas).
4. Vérifie dans Airtable, table **Assistant - Connaissances** : la colonne **Embedding** est remplie de nombres pour les 29 lignes.

Ce workflow n'a pas besoin d'être publié : on le lance à la main.

### Étape 3 – Importer et publier le workflow de l'assistant
1. n8n → **Create workflow** → **⋯** → **Import from File…** → `n8n-workflow-assistant.json`.
2. Choisis les Credentials :
   - **Question du site** (webhook) : le **même Credential « Header Auth »** que le workflow des remarques (celui avec `X-Zieli-Cle`).
   - **Lire passages** et **Noter la question** : ton Credential Airtable.
   - **Embedding question** et **Demander a OpenAI** : « OpenAI Zieli ».
3. **Save**, puis **Publish** (comme pour tes autres workflows).

### Étape 4 – Tester sur le serveur local
1. Ouvre http://localhost:8000/ et connecte-toi (par exemple en libraire).
2. Clique sur **Une question ?** en bas à droite et pose : « C'est quoi le point bas ? ».
3. Tu dois voir une réponse en quelques secondes, avec « Sources : … » en dessous.
4. Vérifie dans Airtable, table **Assistant - Questions**, que la question est notée.

Questions de test conseillées :
- « Pourquoi le bandeau est rouge ? » (FAQ)
- « C'est quoi la TVA à reverser ? » (glossaire)
- « Ma banque me refuse un prêt, que faire ? » (Médiation du crédit, avec lien)
- « Combien j'aurai fin décembre ? » → il doit dire qu'il ne voit pas les chiffres et indiquer où les lire.
- « Donne-moi une recette de crêpes » → il doit dire que ce n'est pas dans ses documents.

### Étape 5 – Mettre en ligne sur Netlify
Quand le test local est bon : me demander d'envoyer sur GitHub. Netlify utilisera la nouvelle fonction `assistant`. **Aucune nouvelle variable** n'est nécessaire (la clé `n8n` existe déjà ; la clé OpenAI reste dans n8n).

## Modifier ce que sait l'assistant
- **Corriger un passage** : modifie le **Texte** dans Airtable, **vide** sa case **Embedding**, puis relance le workflow d'indexation.
- **Ajouter un passage** : nouvelle ligne (Titre, Document, Texte, éventuellement Lien source), puis relance l'indexation.
- Garde les fichiers du dossier `rag/` à jour en même temps (ils servent de copie de référence).

## Réglages possibles (dans le workflow « Zieli - assistant »)
- **Modèle de réponse** : nœud « Demander a OpenAI », `gpt-4o-mini`. Si OpenAI répond « model not found », remplace-le par un modèle « mini » proposé dans ton compte.
- **Nombre de passages** et **seuil de proximité** : nœud « Choisir les passages » (`passages.slice(0, 4)` = passages lus, `retenus.slice(0, 2)` = sources affichées ; seuil `0.25`).
- **Consignes** (ton, longueur, limites) : nœud « Choisir les passages », texte `consignes`.

## Coût
Très faible : quelques centimes pour des centaines de questions avec un modèle « mini ». L'indexation des 29 passages coûte moins d'un centime.

## Sécurité et RGPD
- Les clés restent côté serveur (Netlify, `serveur.ps1`) et dans n8n : jamais dans le navigateur ni sur GitHub.
- L'assistant n'envoie à OpenAI que la question et les passages des documents, **pas les chiffres de l'entreprise**.
- La table « Assistant - Questions » ne contient pas de nom de personne. Si un dirigeant écrit des informations personnelles dans sa question, elles y seront : à mentionner dans les mentions légales / RGPD (étape prévue après le 16/11).
- Les réponses sont affichées comme du texte simple (pas de HTML) : une réponse ne peut pas modifier la page.

## Si ça ne marche pas
| Message ou symptôme | Piste |
|---|---|
| « Je n'arrive pas à répondre pour le moment » | Le workflow n'est pas publié, ou un Credential manque. Regarde **Executions** dans n8n. |
| Réponse sans aucune source | La colonne Embedding est vide : relance l'indexation. |
| Marche en local mais pas sur Netlify | La fonction Netlify a ~10 secondes maximum : regarde les logs de la fonction `assistant` dans Netlify. |
| Erreur 401 dans n8n | Clé OpenAI ou Credential Airtable incorrect. |
