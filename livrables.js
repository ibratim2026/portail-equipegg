// Les 7 livrables présentés à Gabrielle : chaque document fini + sa zone de validation.
// cle = l'élément correspondant dans Supabase (section « livrables »). doc = la page à afficher.
// detail = la section dont les éléments peuvent être validés un par un (facultatif).

export const LIVRABLES = [
  { cle: 'doc-culture', n: 1, court: 'Culture', titre: 'Votre culture', sous: 'Vision, mission, promesse, valeurs, standards de service, principes.', doc: 'docs/culture.html', detail: 'marque', usage: 'À montrer à votre équipe et à vos clients.' },
  { cle: 'doc-ods', n: 2, court: 'Offres', titre: 'Vos offres de services', sous: 'Vendeurs et acheteurs, prêtes à envoyer à un client.', doc: null, usage: 'À envoyer avant ou après une rencontre.' },
  { cle: 'doc-site', n: 3, court: 'Site web', titre: 'Votre site web', sous: 'La maquette complète : accueil, je vends, j\'achète, l\'équipe, l\'Alerte.', doc: 'docs/site/index.html', usage: 'La base de votre nouveau site.' },
  { cle: 'doc-publications', n: 4, court: 'Routine', titre: 'La routine de publications', sous: 'Ce qu\'on publie, quand, et les 4 premières semaines.', doc: 'docs/publications.html', usage: 'Le calendrier de votre présence en ligne.' },
  { cle: 'doc-styles', n: 5, court: 'Styles', titre: 'Les styles de publication', sous: 'Reels, carrousels, photos, stories, légendes, avec un exemple pour chacun.', doc: 'docs/styles.html', detail: 'styles', usage: 'Le guide pour toute personne qui produit votre contenu.' },
  { cle: 'doc-idees', n: 6, court: 'Idées', titre: 'Les 60 idées de publication', sous: 'Classées par étape : se faire connaître, obtenir le contact, donner confiance.', doc: 'docs/idees.html', detail: 'idees', usage: 'La banque d\'idées des prochains mois.' },
  { cle: 'doc-roles', n: 7, court: 'Qui fait quoi', titre: 'Qui fait quoi', sous: 'Les rôles, la routine de chaque jour, de chaque semaine et de chaque mois.', doc: 'docs/qui-fait-quoi.html', usage: 'Pour que chacun sache ce qu\'il a à faire.' },
];
