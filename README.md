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

## Console (William) — 13 octobre 2026
- Le lien admin ouvre la **Console** : tuiles (à valider, approuvés, à modifier, dernière activité), « À traiter » (demandes de modification avec ▶ Écouter, « ✓ Corrigé, renvoyer », « Répondre », « Copier pour Jarvis »), questions sans réponse, avancement par thème, activité récente filtrable (les approbations qui se suivent sont regroupées).
- « Corrigé, renvoyer » appelle `portail_admin_statut` (admin seulement) : remet l'élément « À valider », version +1, avec une note visible par Gabrielle.

## Livrables — 7 documents finis (13 octobre 2026)
- `livrables.js` : la liste des 7 documents (culture, offres, site, routine de publications, styles, idées, qui fait quoi), reliés aux éléments `doc-*` de la section `livrables` dans Supabase.
- `docs/` : les documents eux-mêmes, présentables tels quels (web + impression PDF) : `culture.html`, `site/`, `publications.html`, `styles.html`, `idees.html`, `qui-fait-quoi.html`. Gabarit commun `doc.css` (styles et qui-fait-quoi utilisent aussi `hub.css`).
- Dans le portail : chaque document s'ouvre à gauche (bascule ordinateur / cellulaire), la zone de validation à droite (approuver, demander un changement sur une partie précise, question, note vocale, échanges). Les éléments détaillés (marque, styles, idées) restent validables un par un.
- Les offres de services (doc-ods) sont « en préparation » tant que `doc` est vide dans `livrables.js`.
