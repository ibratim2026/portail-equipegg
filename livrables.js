// Les 7 livrables présentés à Gabrielle : chaque document fini + sa zone de validation.
// cle = l'élément correspondant dans Supabase (section « livrables »). doc = la page à afficher.
// min = temps de lecture estimé (minutes), utilisé à l'accueil et dans le courriel de rappel.
// detail = la section dont les éléments peuvent être validés un par un (facultatif).

export const LIVRABLES = [
  { cle: 'doc-culture', min: 4, n: 1, court: 'Culture', titre: 'Votre guide culture', sous: 'Le guide court : vision, mission, promesse, valeurs, standards, principes et un aide-mémoire d\'une page.', doc: 'docs/culture/', detail: 'marque', usage: 'À montrer à votre équipe et à vos clients.' },
  { cle: 'doc-ods', min: 5, n: 2, court: 'Offres', titre: 'Vos offres de services', sous: 'Vendeurs : votre offre en magazine, à feuilleter ou à envoyer en PDF.', doc: 'docs/ods/vendeurs.html', usage: 'À envoyer avant ou après une rencontre.' },
  { cle: 'doc-site', min: 6, n: 3, court: 'Site web', titre: 'Votre site web', sous: 'La maquette complète : accueil, je vends, j\'achète, l\'équipe, l\'Alerte.', doc: 'docs/site/index.html', usage: 'La base de votre nouveau site.' },
  { cle: 'doc-publications', min: 4, n: 4, court: 'Routine', titre: 'La routine de publications', sous: 'Ce qu\'on publie, quand, et les 4 premières semaines.', doc: 'docs/publications.html', usage: 'Le calendrier de votre présence en ligne.' },
  { cle: 'doc-styles', min: 4, n: 5, court: 'Styles', titre: 'Les styles de publication', sous: 'Reels, carrousels, photos, stories : un exemple de chaque style, à approuver.', doc: 'docs/styles.html', detail: 'styles', usage: 'Le guide pour toute personne qui produit votre contenu.' },
  { cle: 'doc-idees', min: 4, n: 6, court: 'Publications', titre: 'Vos publications et leur logique', sous: 'Se faire connaître, obtenir le contact, donner confiance : la logique et 9 publications à valider.', doc: 'docs/idees.html', detail: 'idees', usage: 'Comment chaque publication vous amène des clients.' },
  { cle: 'doc-roles', min: 2, n: 7, court: 'Qui fait quoi', titre: 'Qui fait quoi', sous: 'Vos routines et celles de William : chaque jour, chaque semaine, chaque mois.', doc: 'docs/qui-fait-quoi.html', usage: 'Pour que chacun sache ce qu\'il a à faire.' },
];
