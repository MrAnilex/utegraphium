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
2. Servir via un serveur local (recommandé pour geolocation and better browser behavior), par exemple :
   - `npx http-server .` ou `python -m http.server`
3. Ouvrir `http://localhost:8080` (ou le port choisi) dans un navigateur moderne.
4. Autoriser la géolocalisation pour que le thème suive ta météo locale.

Notes
- Les données (lectures, artefacts, messages) sont stockées dans localStorage sous la clé `liquidArchive:v1`.
- Pour synchronisation multi-utilisateurs et modération, implémenter un backend plus tard.

