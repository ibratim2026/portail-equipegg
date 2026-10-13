# Portail de validation — L'équipe Gabrielle Germain

Site statique (HTML, CSS, JavaScript, aucune étape de compilation) hébergé sur Cloudflare Pages.
Les données (contenus, statuts, commentaires) sont dans Supabase, projet `equipegg`.

- `index.html`, `app.js`, `style.css` : l'application
- `config.js` : adresse du projet Supabase et clé publique (faite pour le navigateur)
- `medias/` : images et vidéos d'exemple affichées dans le portail

## Sécurité
- Connexion par lien envoyé par courriel (Supabase Auth).
- Seuls les courriels inscrits dans la table `membres` voient le contenu (règles RLS).
- La cliente ne peut écrire qu'à travers la fonction `decider` : approuver, demander une modification, commenter.
- Les contenus sont ajoutés et modifiés par l'équipe (Claude, via le connecteur Supabase).

## Cloudflare Pages
- Framework : aucun · Commande de build : (vide) · Dossier de sortie : `/`
