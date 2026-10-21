# Vaulty

Application web de gestion de budget au style noir et verre dépoli.

## Structure

- `index.html` : point d'entrée de l'application
- `css/styles.css` : direction artistique et responsive design
- `js/app.js` : vues, navigation et interactions
- `js/data.js` : modèle de données et persistance locale
- `js/utils.js` : fonctions utilitaires
- `assets/images/logo-vaulty.png` : logo fourni
- `manifest.webmanifest` + `sw.js` : installation PWA et fonctionnement hors ligne

## Lancer localement

L’application peut être testée immédiatement en double-cliquant sur `index.html`. Pour tester aussi l’installation PWA et le mode hors ligne, lance un petit serveur HTTP :

```bash
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000/Vaulty/` si le serveur est lancé depuis le dossier parent, ou `http://localhost:8000/` s'il est lancé depuis `Vaulty`.

## Publier sur GitHub Pages

1. Créer un dépôt GitHub.
2. Glisser tout le contenu du dossier `Vaulty` à la racine du dépôt.
3. Dans **Settings > Pages**, choisir **Deploy from a branch**, puis la branche `main` et le dossier `/root`.

## Fonctionnalités incluses

- Accueil avec le logo et les quatre univers.
- Lézards : revenu mensuel, revenus ponctuels, catégories et total.
- Kangourous : enveloppes, budgets, dépenses, périodicité et date de début.
- Écureuils : objectifs, date ou montant de déblocage, ajout et transfert de fonds.
- Aigle : visualisation avec filtres actifs, prévisualisation de faisabilité, extraction XLSX complète et conversion d'euros en jours de travail.
- Extraction XLSX : feuilles Synthèse, Lézards, Kangourous, dépenses Kangourous, Écureuils, dépenses Écureuils et copie brute du `localStorage`.
- Données conservées dans `localStorage` sur l'appareil.
- Design responsive, installable comme PWA.

## Choix de vocabulaire

Le brief mentionne parfois des « Koalas » dans la prévisualisation de l'Aigle. Comme les quatre univers principaux sont Lézards, Kangourous, Écureuils et Aigle, cette première version interprète les Koalas comme les objectifs Écureuils à financer.

## Limite importante

Cette version est 100 % locale et sans compte utilisateur. Les données ne sont ni synchronisées ni sauvegardées sur un serveur. Une suppression du stockage du navigateur efface les données.


## Export XLSX

La bibliothèque XLSX est chargée depuis jsDelivr. Une connexion internet est donc nécessaire lors du premier chargement de la page pour activer l’export. Les autres fonctions de Vaulty restent locales.
