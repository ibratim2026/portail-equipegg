# Portail de validation — L'équipe Gabrielle Germain

Site statique (HTML, CSS, JavaScript, aucune étape de compilation) hébergé sur Cloudflare Pages.
Les données (contenus, statuts, commentaires) sont dans Supabase, projet `equipegg`.

- `index.html`, `app.js`, `style.css` : l'application
- `config.js` : adresse du projet Supabase et clé publique (faite pour le navigateur)
- `medias/` : images et vidéos d'exemple affichées dans le portail

## Sécurité
- Aucun mot de passe : chaque personne reçoit un **lien personnel** (`/#k=JETON`). Seule l'empreinte du jeton est stockée (table `acces`).
- Sans lien valide, rien n'est lisible : les tables sont fermées et tout passe par les fonctions `portail_charger` et `portail_decider`.
- La cliente peut seulement approuver, demander une modification ou commenter.
- Site non indexé : balise `noindex`, en-tête `X-Robots-Tag` et `robots.txt`.
- Les contenus sont ajoutés et modifiés par l'équipe (Claude, via le connecteur Supabase).

## Cloudflare Pages
- Framework : aucun · Commande de build : (vide) · Dossier de sortie : `/`
