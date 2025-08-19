# Archive Liquide — blog expérimental (prototype)

Ce dépôt contient un prototype d'un blog expérimental à l'esthétique "liquid glass futuriste", combinant son génératif, contenu verrouillé, artefacts, et interactions narratives.

Fonctionnalités clés (prototype)
- Esthétique verre liquide : gradients, blur, formes SVG organiques animées.
- Thème évolutif selon l'heure locale et la météo (Open-Meteo, sans clé).
- Articles modulés : certains s'ouvrent seulement après lecture d'autres articles ou à partir d'une date.
- Ambiances sonores génératives par article (WebAudio).
- Artefacts collectable stockés en localStorage.
- Commentaires narratifs locaux (micro-histoires).
- Boîte aux lettres locale pour messages créatifs.
- Mots "aside" cliquables qui ouvrent apartés visuels.

Installation & exécution
1. Copier les fichiers (`index.html`, `style.css`, `app.js`) dans un dossier.
2. Servir via un serveur local (recommandé pour geolocation et meilleures pratiques), par exemple :
   - `npx http-server .` ou `python -m http.server`
3. Ouvrir `http://localhost:8080` (ou le port choisi) dans un navigateur moderne.
4. Autoriser la géolocalisation pour que le thème suive ta météo locale.

Architecture (fichiers)
- index.html : structure et composants UI.
- style.css : styles et effets glass/liquid.
- app.js : logique de rendu, WebAudio, stockage local, météo, interaction.

Personnalisation rapide
- Ajouter/éditer articles : modifier la variable `posts` dans `app.js`. Champs utiles :
  - id, title, excerpt, body (HTML), ambient (type/intensity), artifact, unlock.
  - unlock.type: "none" | "requires" | "date". Pour date, `unlock.timestamp` (ms).
- Modifier les ambiances : dans `startAmbienceFor()` (app.js), ajouter/affiner types (`wind`, `water`, `drone`, `bell`, ...).
- Sauvegarde : tout est stocké dans localStorage sous la clé `liquidArchive:v1`.

Notes sur la démo
- Le prototype est entièrement côté client, pour préserver l'aspect expérimental et privé.
- Pour persistance multi-utilisateurs / modération, prévoir un backend (API) plus tard.
- Open-Meteo est utilisé pour la météo sans clé API ; si tu préfères un autre fournisseur, adapte la requête.

Idées d'évolution
- Graphismes GPGPU / WebGL pour formes liquides plus organiques.
- Ambiances sonores plus riches avec Convolver (IR reverb) et LFOs plus complexes.
- Système de progression multiplateforme (compte, synchronisation).
- Modération collaborative pour les "micro-histoires".
- Support pour images vectorielles interactives dans les apartés.

Si tu veux, je peux :
- Transformer ce prototype en repo prêt à pousser (avec commit message).
- Ajouter une API de backend léger pour synchroniser artefacts et commentaires.
- Améliorer les ambiances (exemples sonores plus complexes) ou créer davantage d'articles et d'artefacts.

Dis-moi quelle suite tu souhaites (p.ex. génération de repo Git, implémentation serveur, ou extension sonore).