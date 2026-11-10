# Ouvrir et modifier la maquette dans VS Code

## 1. Ouvrir le projet
1. Dézippe `zieli26-vscode.zip` (clic droit > Extraire tout).
2. Dans VS Code : **Fichier > Ouvrir le dossier…** et choisis le dossier `zieli26-vscode`.
3. VS Code propose d'installer l'extension recommandée **Live Server** : accepte.

## 2. Voir le rendu en direct
- Clic droit sur `index.html` > **Open with Live Server**.
- La page s'ouvre dans ton navigateur et se met à jour à chaque enregistrement (Ctrl + S).
- Ton compte (accès à toutes les entreprises) : `elise.zieli@test.exemple`, mot de passe défini dans `donnees.js`.
- Comptes de test des dirigeants, mot de passe `demo` : `libraire@utopie.example`, `boulanger@fournildor.example`.

## Afficher les chiffres d'Airtable
Live Server n'affiche que les chiffres fictifs. Pour les chiffres d'Airtable :
1. Sur https://airtable.com/create/tokens, crée un jeton avec le droit `data.records:read`, limité à la base **zieli26**.
2. Colle-le seul dans un fichier `airtable-token.txt`, placé **à côté** du dossier `zieli26-vscode` (pas dedans).
3. Double-clique sur `Lancer le site.bat` et laisse la fenêtre ouverte.

Les chiffres sont relus dans Airtable toutes les 5 minutes au plus. Un bandeau rouge s'affiche si Airtable ne répond pas : les chiffres sont alors fictifs.
Ce fonctionnement est réservé à ton ordinateur : ne mets pas ce site en ligne tel quel, car la page reçoit les chiffres de toutes les entreprises.

## 3. Où modifier quoi
| Je veux changer… | Fichier | Où regarder |
|---|---|---|
| Une couleur | `styles.css` | les variables tout en haut (`--marine`, `--vert`…) |
| Un texte affiché (titre, libellé) | `index.html` | chercher le texte avec Ctrl + F |
| Un libellé du tableau (« Entrées »…) | `app.js` | section 3.6 TABLEAU MENSUEL |
| Un montant, une catégorie | `donnees.js` | `DONNEES_LIBRAIRIE` ou `DONNEES_BOULANGERIE` |
| Le seuil d'alerte | `donnees.js` | `seuilAlerte` (un par entreprise) |
| Le graphique | `app.js` | section 3.5 GRAPHIQUE |
| Le bloc « Une remarque ? » | `index.html` (champs) et `app.js` (section 3.7) | |

Chaque section du code est commentée en français.

## 4. Bonnes pratiques
- **Une modification à la fois**, puis Ctrl + S et vérifie le rendu.
- Avant une grosse modification, **copie le dossier** (ex. `zieli26-vscode_sauvegarde`) pour pouvoir revenir en arrière.
- Si la page devient blanche : appuie sur F12 dans le navigateur, onglet **Console**, le message rouge indique la ligne en erreur.
- Ne mets jamais de vraie donnée client ni de clé Airtable dans ces fichiers : tout ce qui est dans la page est lisible par n'importe qui.
