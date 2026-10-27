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
- `docs/` : les documents eux-mêmes, présentables tels quels (web + impression PDF) : `culture/` (magazine), `site/`, `publications.html`, `styles.html`, `idees.html`, `qui-fait-quoi.html`. Gabarit commun `doc.css` (styles et qui-fait-quoi utilisent aussi `hub.css`).
- Dans le portail : chaque document s'ouvre à gauche (bascule ordinateur / cellulaire), la zone de validation à droite (approuver, demander un changement sur une partie précise, question, note vocale, échanges). Les éléments détaillés (marque, styles, idées) restent validables un par un.
- Les offres de services (doc-ods) sont « en préparation » tant que `doc` est vide dans `livrables.js`.

## Image de marque officielle (13 octobre 2026)
Source : le dossier « Marketing » partagé par Gabrielle (Guide des normes de l'image de marque 2021, Agence M, + gabarits 2025). Copie locale : `Gabrielle Germain/06-marketing-gabrielle/`.
- `marque/` : logos officiels (versions fond clair, moyen, foncé), énoncé « En mode IMMOBILIER », « Par Gabrielle Germain », « Vendu », traits gestuels, pictogrammes (maison, flèche, sapin, trio de maisons) et motifs de maisons, redimensionnés pour le web.
- Couleurs officielles partout : toffee #CAB6A0, sauge #9FACA4, pastel rosé #DCA39A, lait frappé #F5F1EA, noisette #8F7060, terre d'ombre #70574A, nuances foncées #B59981 / #81968C / #CE817B. Texte en terre d'ombre, aucun aplat noir.
- Polices : Jost (pour Objektiv Mk1), Playfair Display (pour Ambroise / The Seasons), Ms Madi (pour Saturday Rock, toujours en noir). La police Saturday Rock n'est pas intégrée au web (licence de bureau).
- `docs/couv.css` : couverture commune des documents (aplat toffee, logo officiel, titre en capitales + accroche manuscrite, motif de maisons).
- Magazine ODS : aplats toffee / sauge / rosé, photos en encart avec le filtre chaud de la marque (#C9B59F), comme ses gabarits 2025.

## Outils (17 octobre 2026)
- Nouvel onglet **Outils** (pour Gabrielle) : `outils.js` contient la liste des outils et leurs calculs. Pour en ajouter un, ajouter un objet à `OUTILS` (`id`, `titre`, `sous`, `picto`, `monter(el)`).
- Premiers outils : paiement hypothécaire (intérêt composé semestriel, prime SCHL), mise de fonds minimale et SCHL, taxe de bienvenue (Québec, Lévis, barème de base), net au vendeur (rétribution + TPS/TVQ).
- **À revoir chaque 1er janvier** : tranches des droits de mutation (`BAREMES_MUTATION`) et `OUTILS_MAJ`.

## Parcours guidé (17 octobre 2026) : Gabrielle ouvre, valide, ferme
- **Côté Gabrielle, aucun menu.** Accueil = « N documents à valider · environ X min » + un seul bouton **Commencer**. « Voir tous mes documents » est plié; Outils et « Où on en est » sont de petits liens en bas de page.
- **Séance** (`etat.parcours`) : barre « Document 2 sur 6 » + « Plus tard ». Deux gros boutons : **J'approuve** / **Je veux un changement** (micro). Le reste (question, point par point, plein écran) est plié sous « Autre chose? ». Après une approbation *ou* une demande de changement, le document suivant s'ouvre tout seul; à la fin, écran « C'est tout pour aujourd'hui ».
- Sur cellulaire, les deux boutons restent fixés en bas de l'écran.
- **Lien direct** : `https://equipegg.pelion.ca/?go` ouvre directement le premier document à valider (lien à mettre dans les courriels de rappel).
- Unité unique : **documents**. Temps estimé = champ `min` de chaque livrable (`livrables.js`), utilisé à l'accueil et dans le courriel de rappel.
- Le bouton « Quitter » (déconnexion) est caché pour Gabrielle, pour qu'elle ne perde pas son accès.
- **Console** : une ligne d'état (documents à valider, à traiter par toi, dernière activité), puis demandes de changement et questions; « Avancement par thème » et « Activité récente » sont pliés. Menu admin : Console, Vue cliente, Contenus (menu déroulant), Outils, Ressources.

## Culture en magazine (17 octobre 2026)
- `docs/culture/` : le **guide culture court**, magazine de 10 pages (couverture, vision + mission, promesse + positionnement, 6 valeurs + forces, standards, expérience + personnalité, principes de communication, **aide-mémoire d'une page à imprimer**, équipe, dos). Même format que l'offre vendeurs (`../ods/magazine.css` + `culture.css`, page-flip, `?impression` pour le PDF).

## Image de marque partout (17 octobre 2026)
- `marque/marque.css` : la feuille de marque, chargée **en dernier** sur chaque page (portail, 7 documents, site, magazines). Titres en Objektiv Bold → Jost 700, capitales, approche 100; accroches (`<i>` dans un titre) en Saturday Rock → Ms Madi, toujours en noir; sous-titres en Ambroise → Playfair Display.
- Toutes les couleurs ramenées aux couleurs officielles du guide 2021 (toffee, sauge, pastel rosé et leurs foncés, lait frappé, noisette, terre d'ombre, blanc, noir). Les teintes pâles sont les couleurs officielles en transparence. Seule exception : l'aperçu Instagram du portail garde les couleurs d'Instagram.
- Source du guide : dossier « Image de marque » partagé par Gabrielle dans Google Drive (`_gabrielle-germain_guide-normes_2021.pdf`).
- **Contraste (règle)** : texte au moins 4,5:1 (3:1 pour les grands titres). Sur toffee, sauge ou pastel rosé : texte **noir** (le guide permet « noir sur fond couleur »). Sur terre d'ombre : texte **lait frappé**. Noisette et les foncés (sauge, rosé) ne servent plus de couleur de texte, sauf les grands chiffres décoratifs en noisette. Les magazines sont sur fond lait frappé (plus de brun sur brun dans le portail). Vérifié par un audit automatique de contraste sur tous les écrans et documents.
- **Mise en page des magazines** : sous le titre, le contenu est groupé dans `.corps` et centré dans l'espace restant (jamais un texte en haut, un bloc en bas et le centre vide). Textures : `texture-papier` (grain léger) et `texture-motif` + `toffee-m` / `rose-m` / `sauge-m` (motif de maisons gestuelles de la marque sur la couleur du même nom; `doux` pour un filigrane sur fond lait frappé).

## Site web : fini et branché (17 octobre 2026)
- **Formulaires branchés** : évaluation, Alerte et « Parlons de votre projet » appellent la fonction Supabase `site_prospect` (table `prospects`, fermée au public; anti-répétition 5 envois/h par courriel; pot de miel anti-robots `.pot`). En cas d'échec, message avec le téléphone, rien n'est perdu côté visiteur.
- **Avis** : ntfy « Nouvelle demande sur le site », **sans aucun renseignement personnel** (le topic ntfy est public). Les coordonnées sont dans la **console** du portail, bloc « Demandes du site » (`portail_prospects`, `portail_prospect_traite`, admin seulement), avec « Marquer comme traité ».
- **Loi 25** : `docs/site/confidentialite.html` (politique de confidentialité, liée depuis chaque case de consentement et le pied de page). Données hébergées au Canada (Supabase ca-central-1). À faire relire avant la mise en ligne publique.
- Mention légale : « RE/MAX 1er Choix inc., agence immobilière » (Gabrielle passe chez RE/MAX 1er Choix, oct. 2026; nom tel qu'affiché sur Centris).
- Polices Jost 600/700 chargées (titres de marque), favicon, balises de partage (og:).
- Correctif : les teintes pâles sont maintenant opaques partout (#EAE2D7, #EFDED7, #DFDFD8) : les cartes empilées de « Je vends » laissaient voir le texte des cartes dessous.
- Tests : 36 vérifications automatiques (formulaires, échec d'envoi, pot de miel, navigation, menu mobile, fenêtre, FAQ, politique) passent sur ordi et cellulaire; aucun texte sous le seuil de contraste.

## Retours de William (17 octobre 2026, soir)
- **Site** : menu mobile corrigé (le fond flou de l'en-tête enfermait le menu dans la barre du haut; menu plein écran, Échap ferme, page figée derrière). Témoignages refaits en vraies citations (carte, guillemets rosés, nom et contexte) au lieu du texte qui se remplit.
- **Styles** (`docs/styles.html`) : refait en page visuelle courte, à approuver. Seulement Reels (5), carrousels (5), photos (4), stories (4) : un exemple + une phrase chacun, rien de caché. Retirés : la signature (couleurs de marque, déjà validées), la base, la grille, les légendes, les formats, « avant de publier ». Reel A devient « Gabrielle dans le décor » (`medias/reel-a-gg.jpg` : Gabrielle à distance dans une pièce, la question écrite en haut, lisible). Portrait : `medias/photo-b-gg.jpg`. « Le panoramique prestige » devient « La grande photo ». Supabase : 5 éléments de styles retirés (signature ×3, légendes, menu des stories), textes raccourcis.
- **Publications** (`docs/idees.html`) : la logique en entonnoir (se faire connaître 5/10, obtenir le contact 3/10, donner confiance 2/10) et 9 publications à valider, 3 par format (Reel, carrousel, story) et 3 par étape. Supabase : les 51 autres idées sont au statut `retire` (gardées pour plus tard).
- **Qui** (`docs/qui-fait-quoi.html`, refait le 19 oct. : 3 routines jour / semaine / mois, Gabrielle et William côte à côte) : seulement Gabrielle, son équipe (Victoria, Nancy) ou William. « Notre équipe » et « l'agence Momentum » sont remplacés par William dans la routine, les publications et les ressources.

## Retours de Gabrielle (26 octobre 2026), appliqués le 27 oct.
- **Bannière : RE/MAX 1er Choix** partout (7 documents, site, politique, images d'exemple). Mention légale : « RE/MAX 1er Choix inc., agence immobilière ». La « Protection Royale » (programme Royal LePage) est retirée du site et de l'offre.
- Titre : « courtière en immobilier résidentiel et commercial ». Courriel : gabrielle@gabriellegermain.ca.
- **Distinctions** (offre + site) : Top 2 % national 2022 à 2026, Top 35 des 35 ans et moins 2022 à 2026, Cercle Exclusif 2024 à 2026. Retirés : Diamant, Diamant Rouge, Cercle Sélect, Fondation Un toit pour tous (Royal LePage).
- **Offre de services** : plus aucun % de commission (page 8 « Sur mesure », page 13 sans investissement), dos avec les coordonnées de Gabrielle seulement.
- **Site** : l'équipe compte 6 personnes (textes mis à jour; les 3 autres membres restent à ajouter : noms, rôles, photos).
- **Styles** : plus de vendeurs. Carrousels B (« Le reçu » d'une vraie vente à Limoilou) et D (« Le cahier » : la liste du vendeur) refaits pour les vendeurs; étiquettes Vendeurs / Acheteurs sur chaque exemple. Les vidéos des Reels C, D, E restent orientées acheteurs.
- **En attente de Gabrielle** : les nouvelles photos (couvertures, culture, site, styles), le logo et les normes RE/MAX, les 3 nouveaux membres de l'équipe. Les 5 documents restent « à modifier » jusqu'aux photos.
- **Logo RE/MAX 1er Choix** (27 oct.) : `marque/remax-1er-choix_fond-clair.svg` (texte noir) et `_fond-fonce.svg` (texte crème) + PNG transparents. Source : logo officiel de l'agence publié par RE/MAX Québec (`media.remax-quebec.com/assets/agencies/logos/1erchoix.svg`). Placé à l'endos de l'offre, à l'endos de la culture et au pied du site. À valider avec les normes RE/MAX pour les logos d'équipe.
