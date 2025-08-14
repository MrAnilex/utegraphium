# Utegraphium

Site statique déployé sur GitHub Pages.

Déploiement rapide :

1. Ce dépôt contient les fichiers de base du site Utegraphium (index.html, styles.css, CNAME).
2. GitHub Pages est configuré pour servir la branche main à la racine.
3. Domaine personnalisé : utegraphium.com (fichier CNAME à la racine).

DNS recommandé :
- Pour le domaine racine (utegraphium.com) créez 4 enregistrements A vers :
  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153
- Pour www.utegraphium.com créez un CNAME vers : MrAnilex.github.io

Après mise en place des DNS, GitHub émettra automatiquement un certificat HTTPS (activez "Enforce HTTPS" si nécessaire).