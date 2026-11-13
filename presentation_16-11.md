# Présentation Zieli au formateur — 16 novembre 2026 · 8 minutes

*Fiche à garder sous les yeux. Diapositives de secours (intro, captures, conclusion) : https://claude.ai/artifact/GsNe48gYFdvPjjVMBSKhZC*

## Avant de commencer (la veille et 15 min avant)
- [ ] Onglet 1 : **https://zieli-jedha.netlify.app/**, mot de passe Netlify déjà saisi, **connectée en libraire** (`libraire@chapitre-un.example` / `demo`).
- [ ] Onglet 2 : **Airtable**, table Entreprises (seuil 10 000 €, logo).
- [ ] Onglet 3 : **n8n**, liste des 3 workflows.
- [ ] Onglet 4 : **Gmail** (pour montrer l'e-mail reçu) — ou téléphone à portée de main.
- [ ] Fichier : un **récapitulatif mensuel** (PowerPoint) ouvert.
- [ ] Diapositives de secours ouvertes, au cas où internet faiblit.
- [ ] Chronomètre lancé.

---

## 0:00 – 1:00 · Le problème et Zieli
*(diapositives 1 à 3, ou sans écran)*
- « Les dirigeants de petites entreprises découvrent souvent leurs difficultés de trésorerie trop tard : leurs chiffres comptables sont illisibles pour eux. »
- « Zieli, c'est mon offre de **bras droit financier** : je décode leurs chiffres, je fais ressortir l'essentiel, et j'automatise les tâches pénibles. »
- « Mon premier client test est une librairie. »

## 1:00 – 4:30 · Démo en direct, côté dirigeant
1. **Connexion** → logo Zieli, puis tableau de bord avec le logo de la librairie.
2. **Les 2 questions clés en 30 secondes** :
   - « Combien aurai-je fin décembre ? » → **28 062 €** (tableau).
   - « Quel est mon point bas d'ici 6 mois ? » → **bandeau rouge** : 9 912 € fin janvier, sous son seuil de 10 000 €.
3. **Graphique** : réel (trait plein), prévu (pointillés), point « aujourd'hui », ligne rouge du seuil. Choisir la période **de mai 2026 à octobre 2026** (6 mois d'historique), puis revenir avec **« 12 mois glissants »**.
4. **Tableau** : déplier **Encaissements** (▸), puis cliquer sur **octobre** pour voir Prévu et Écart.
5. **Formulaire « Une remarque / une question ? »** : envoyer une **Explication des écarts** → montrer l'**e-mail reçu** (copie au dirigeant + alerte pour moi).

## 4:30 – 6:00 · Les coulisses (côté Elise)
- **Airtable** : « Toutes les données vivent ici : entreprises, catégories, transactions, prévisionnel, commentaires. »
- **n8n** : « 3 automatisations : les remarques en temps réel, un contrôle des données le 5 du mois à 8 h pour moi, et le récapitulatif envoyé aux clients le 5 à 12 h. »
- **Récapitulatif mensuel** : montrer 1 ou 2 diapositives du PowerPoint.

## 6:00 – 7:00 · Mes choix techniques
- « J'ai construit le site dans **VS Code avec Claude Code**, versionné sur **GitHub**, mis en ligne sur **Netlify**. »
- « Les clés d'accès (Airtable, n8n) restent **côté serveur**, dans des fonctions Netlify : elles ne sont jamais dans la page. »
- « J'ai abandonné Lovable : plus de liberté sur le design et pas de limite de crédits. »

## 7:00 – 8:00 · Résultats et suite
- **Test avec la libraire** : « La dirigeante n'est disponible que le 18/11. J'ai donc fait un **entretien fictif** pour préparer le déroulé » → montrer `test_libraire_exemple_fictif.md` en disant clairement qu'il est **fictif**. Le vrai test a lieu le 18/11.
- **Prochaines étapes** : vraie connexion sécurisée côté serveur (chaque dirigeant ne reçoit que ses données), mentions légales / RGPD / accessibilité, puis certification Bloc 1.
- **Mes questions** : qu'attendez-vous pour les tests de sécurité (URL directe, inter-rôles) ? Des conseils pour le dossier ?

---

## Si quelque chose ne marche pas
- **Le site ne charge pas** → passer aux diapositives de captures (démo de secours).
- **Bandeau rouge « Données Airtable indisponibles »** → le dire calmement : « ce sont les chiffres de secours », et continuer.
- **L'e-mail tarde** → montrer un e-mail reçu lors d'un test précédent.
- **Retard sur le temps** → sauter « Les coulisses » et dire une phrase sur n8n.
