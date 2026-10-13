# Portail de validation — L'équipe Gabrielle Germain

Site statique (HTML, CSS, JavaScript, aucune étape de compilation) hébergé sur Cloudflare Pages.
Les données (contenus, statuts, commentaires) sont dans Supabase, projet `equipegg`.

- `index.html`, `app.js`, `style.css` : l'application
- `config.js` : adresse du projet Supabase et clé publique (faite pour le navigateur)
- `ressources.js` : l'onglet Ressources (« Où on en est » et « L'acquisition, simplement ») — à mettre à jour à chaque étape
- `medias/` : images et vidéos d'exemple affichées dans le portail

## Sécurité
- Aucun mot de passe : chaque personne reçoit un **lien personnel** (`/#k=JETON`). Seule l'empreinte du jeton est stockée (table `acces`).
- Sans lien valide, rien n'est lisible : les tables sont fermées et tout passe par les fonctions `portail_charger` et `portail_decider`.
- La cliente peut seulement approuver, demander une modification ou commenter.
- Site non indexé : balise `noindex`, en-tête `X-Robots-Tag` et `robots.txt`.
- Les contenus sont ajoutés et modifiés par l'équipe (Claude, via le connecteur Supabase).

## Cloudflare Pages
- Framework : aucun · Commande de build : (vide) · Dossier de sortie : `/`

## Version 2 (13 octobre 2026)
- **Accueil** : le nombre d'éléments à valider, le temps estimé, le détail par type, et un lot par thème.
- **Un élément à la fois** : plein écran, « J'approuve » / « À modifier » / « Passer », glisser à droite pour approuver, écran de fin avec le résumé.
- **Aperçu Instagram** : Reels, carrousels et photos affichés dans un cadre de publication; stories dans un cadre de story.
- **Note vocale** : enregistrement dans le navigateur + transcription en direct quand le navigateur le permet (fonction `portail_note_vocale`, table `notes_vocales`). L'équipe réécoute avec « ▶ Écouter » (`portail_audio`).
- **Avis ntfy** (topic `gabriellegermain`) : demande de modification, question, note vocale, lot terminé (`portail_fin_lot`).
- Mot d'accueil à la première visite (gardé dans le navigateur : `gg-intro-v2`).
