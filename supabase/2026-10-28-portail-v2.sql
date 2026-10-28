-- Portail v2 · 28 oct. 2026 · préparé par Jang, À APPLIQUER SEULEMENT AVEC LE GO DE WILLIAM.
-- 1. Section « contenu » : les publications de la semaine que Gabrielle valide dans le fil continu.
-- 2. Les 8 publications de la semaine du 2 novembre 2026.
-- 3. Les 5 documents en « modifications » passent à « approuve » (décision de William : déjà validés une première fois, ils vont dans la Bibliothèque).
begin;

insert into public.sections (id, titre, description, ordre)
values ('contenu', 'Publications à valider', 'Le contenu de la semaine suivante, à approuver ou à modifier.', 4)
on conflict (id) do nothing;

insert into public.elements (cle, section_id, groupe, titre, sous_titre, corps, medias, meta, ordre, statut) values
  ('pub-2026-11-02-1', 'contenu', '2026-11-02', 'Les coûts autour de l''achat', 'Préparation, sérénité', 'Le prix de la maison n''est pas le seul montant à prévoir. 🏡

À l''achat : la mise de fonds, l''inspection, le notaire.
Après : la taxe de bienvenue, l''assurance prêt si votre mise de fonds est sous 20 %, le déménagement.

Vous repartez avec un plan clair : budget, secteurs, échéancier. Enregistrez-le pour votre budget.

Faire équipe, à chaque étape. ✨

#premierachat #budgetmaison #immobilierquebec #quebec #levis

Gabrielle Germain, courtière en immobilier résidentiel et commercial · RE/MAX 1er Choix inc., agence immobilière', '[{"src": "contenu/2026-11-02/p1-1.jpg", "type": "image", "legende": "Page 1/4"}, {"src": "contenu/2026-11-02/p1-2.jpg", "type": "image", "legende": "Page 2/4"}, {"src": "contenu/2026-11-02/p1-3.jpg", "type": "image", "legende": "Page 3/4"}, {"src": "contenu/2026-11-02/p1-4.jpg", "type": "image", "legende": "Page 4/4"}]'::jsonb, '{"semaine": "Semaine du 2 novembre 2026", "jour": "Lundi 2 nov.", "heure": "18 h 30", "etage": "TOFU", "format": "Carrousel", "vendeur": false, "reserve": false, "plateformes": "Instagram · Facebook"}'::jsonb, 1, 'a_valider'),
  ('pub-2026-11-02-2', 'contenu', '2026-11-02', 'Promesse d''achat acceptée ≠ propriétaire', 'Soulagement', 'Votre offre est acceptée. Bravo! 🔑

Mais à ce moment-là, la maison ne vous appartient pas encore. Il reste les conditions (souvent l''inspection et le financement), leurs délais, puis la signature chez le notaire.

C''est là que vous devenez propriétaire. Et là, on célèbre.

Enregistrez-le pour votre premier achat. On vous accompagne à chaque étape.

Faire équipe, à chaque étape. ✨

#premierachat #immobilierquebec #promessedachat #quebec #levis

Gabrielle Germain, courtière en immobilier résidentiel et commercial · RE/MAX 1er Choix inc., agence immobilière', '[{"src": "contenu/2026-11-02/p2-1.jpg", "type": "image", "legende": "Page 1/6"}, {"src": "contenu/2026-11-02/p2-2.jpg", "type": "image", "legende": "Page 2/6"}, {"src": "contenu/2026-11-02/p2-3.jpg", "type": "image", "legende": "Page 3/6"}, {"src": "contenu/2026-11-02/p2-4.jpg", "type": "image", "legende": "Page 4/6"}, {"src": "contenu/2026-11-02/p2-5.jpg", "type": "image", "legende": "Page 5/6"}, {"src": "contenu/2026-11-02/p2-6.jpg", "type": "image", "legende": "Page 6/6"}]'::jsonb, '{"semaine": "Semaine du 2 novembre 2026", "jour": "Mardi 3 nov.", "heure": "18 h 30", "etage": "TOFU", "format": "Carrousel", "vendeur": false, "reserve": false, "plateformes": "Instagram · Facebook"}'::jsonb, 2, 'a_valider'),
  ('pub-2026-11-02-3', 'contenu', '2026-11-02', 'La liste à vérifier avant votre première visite', 'Préparation, assurance', 'Votre première visite approche? 🏡

Avant de partir : votre préapprobation, vos 3 essentiels, le trajet.
Sur place : la lumière, les signes d''eau, le rangement, les bruits.
Juste après : vos notes, la comparaison, vos questions.

Bien préparé, on visite moins, mais mieux.

👉 Pour recevoir seulement les propriétés qui vous ressemblent, écrivez « ALERTE » en message. C''est gratuit.

Faire équipe, à chaque étape. ✨

#premierachat #visitemaison #immobilierquebec #levis #quebec

Gabrielle Germain, courtière en immobilier résidentiel et commercial · RE/MAX 1er Choix inc., agence immobilière', '[{"src": "contenu/2026-11-02/p3-1.jpg", "type": "image", "legende": "Page 1/5"}, {"src": "contenu/2026-11-02/p3-2.jpg", "type": "image", "legende": "Page 2/5"}, {"src": "contenu/2026-11-02/p3-3.jpg", "type": "image", "legende": "Page 3/5"}, {"src": "contenu/2026-11-02/p3-4.jpg", "type": "image", "legende": "Page 4/5"}, {"src": "contenu/2026-11-02/p3-5.jpg", "type": "image", "legende": "Page 5/5"}]'::jsonb, '{"semaine": "Semaine du 2 novembre 2026", "jour": "Mercredi 4 nov.", "heure": "18 h 30", "etage": "MOFU", "format": "Carrousel", "vendeur": false, "reserve": false, "plateformes": "Instagram · Facebook"}'::jsonb, 3, 'a_valider'),
  ('pub-2026-11-02-4', 'contenu', '2026-11-02', 'Avant / après : petits gestes, grande différence', 'Fierté, préparation', 'Vendre, ça se prépare. 🏡

Avant les photos : désencombrer, régler les petites réparations, faire entrer la lumière.
Les papiers : le certificat de localisation à jour, les comptes de taxes, les factures de travaux.

L''acheteur voit les détails en premier, et il va demander les papiers.

On regarde votre maison avec les yeux de l''acheteur, ensemble. Enregistrez-le pour préparer votre vente.

Faire équipe, à chaque étape. ✨

#vendremamaison #immobilierquebec #conseilsvendeurs #levis #quebec

Gabrielle Germain, courtière en immobilier résidentiel et commercial · RE/MAX 1er Choix inc., agence immobilière', '[{"src": "contenu/2026-11-02/p4-1.jpg", "type": "image", "legende": "Page 1/4"}, {"src": "contenu/2026-11-02/p4-2.jpg", "type": "image", "legende": "Page 2/4"}, {"src": "contenu/2026-11-02/p4-3.jpg", "type": "image", "legende": "Page 3/4"}, {"src": "contenu/2026-11-02/p4-4.jpg", "type": "image", "legende": "Page 4/4"}]'::jsonb, '{"semaine": "Semaine du 2 novembre 2026", "jour": "Jeudi 5 nov.", "heure": "18 h 30", "etage": "TOFU", "format": "Carrousel", "vendeur": true, "reserve": false, "plateformes": "Instagram · Facebook"}'::jsonb, 4, 'a_valider'),
  ('pub-2026-11-02-5', 'contenu', '2026-11-02', 'Le vocabulaire de l''immobilier en 60 secondes', 'Confiance', 'Préapprobation, inspection, certificat de localisation… 🔑

Les mots de l''immobilier peuvent intimider. Voici les 6 qui reviennent le plus quand on achète, expliqués simplement.

Un mot vous échappe? Écrivez-nous, on vous l''explique.

Faire équipe, à chaque étape. ✨

#premierachat #immobilierquebec #lexiqueimmobilier #quebec #levis

Gabrielle Germain, courtière en immobilier résidentiel et commercial · RE/MAX 1er Choix inc., agence immobilière', '[{"src": "contenu/2026-11-02/p5-1.jpg", "type": "image", "legende": "Page 1/8"}, {"src": "contenu/2026-11-02/p5-2.jpg", "type": "image", "legende": "Page 2/8"}, {"src": "contenu/2026-11-02/p5-3.jpg", "type": "image", "legende": "Page 3/8"}, {"src": "contenu/2026-11-02/p5-4.jpg", "type": "image", "legende": "Page 4/8"}, {"src": "contenu/2026-11-02/p5-5.jpg", "type": "image", "legende": "Page 5/8"}, {"src": "contenu/2026-11-02/p5-6.jpg", "type": "image", "legende": "Page 6/8"}, {"src": "contenu/2026-11-02/p5-7.jpg", "type": "image", "legende": "Page 7/8"}, {"src": "contenu/2026-11-02/p5-8.jpg", "type": "image", "legende": "Page 8/8"}]'::jsonb, '{"semaine": "Semaine du 2 novembre 2026", "jour": "Vendredi 6 nov.", "heure": "18 h 30", "etage": "TOFU", "format": "Carrousel", "vendeur": false, "reserve": false, "plateformes": "Instagram · Facebook"}'::jsonb, 5, 'a_valider'),
  ('pub-2026-11-02-6', 'contenu', '2026-11-02', '5 questions à poser pendant une visite libre', 'Préparation', 'Visite libre demain? Posez ces 5 questions. 🏡

1. Depuis quand est-elle en vente?
2. Pourquoi les propriétaires vendent-ils?
3. Quels travaux ont été faits, et quand?
4. Combien coûtent le chauffage et l''électricité?
5. Y a-t-il déjà eu de l''eau?

Les bonnes questions révèlent ce que la fiche ne dit pas.

👉 Pour recevoir les propriétés qui vous ressemblent, écrivez « ALERTE » en message. C''est gratuit.

Faire équipe, à chaque étape. ✨

#visitelibre #premierachat #immobilierquebec #levis #quebec

Gabrielle Germain, courtière en immobilier résidentiel et commercial · RE/MAX 1er Choix inc., agence immobilière', '[{"src": "contenu/2026-11-02/p6-1.jpg", "type": "image", "legende": "Page 1/7"}, {"src": "contenu/2026-11-02/p6-2.jpg", "type": "image", "legende": "Page 2/7"}, {"src": "contenu/2026-11-02/p6-3.jpg", "type": "image", "legende": "Page 3/7"}, {"src": "contenu/2026-11-02/p6-4.jpg", "type": "image", "legende": "Page 4/7"}, {"src": "contenu/2026-11-02/p6-5.jpg", "type": "image", "legende": "Page 5/7"}, {"src": "contenu/2026-11-02/p6-6.jpg", "type": "image", "legende": "Page 6/7"}, {"src": "contenu/2026-11-02/p6-7.jpg", "type": "image", "legende": "Page 7/7"}]'::jsonb, '{"semaine": "Semaine du 2 novembre 2026", "jour": "Samedi 7 nov.", "heure": "18 h 30", "etage": "MOFU", "format": "Carrousel", "vendeur": false, "reserve": false, "plateformes": "Instagram · Facebook"}'::jsonb, 6, 'a_valider'),
  ('pub-2026-11-02-7', 'contenu', '2026-11-02', 'Vendue en 2 jours à Limoilou : 374 900 $ demandé, 395 000 $ obtenu', 'Fierté, confiance', 'Demandé : 374 900 $.
Obtenu : 395 000 $.
En 2 jours, à Limoilou. 🔑

Pas un hasard : on voit votre maison comme l''acheteur la verra, avec le bon plan dès le départ, et on reste jusqu''au bout.

Vous pensez vendre? Écrivez-moi « VENDRE » en message : on regarde ensemble ce que votre propriété peut aller chercher.

Faire équipe, à chaque étape. ✨

#vendremamaison #limoilou #immobilierquebec #remax1erchoix #quebec

Gabrielle Germain, courtière en immobilier résidentiel et commercial · RE/MAX 1er Choix inc., agence immobilière', '[{"src": "contenu/2026-11-02/p7-1.jpg", "type": "image", "legende": "Page 1/3"}, {"src": "contenu/2026-11-02/p7-2.jpg", "type": "image", "legende": "Page 2/3"}, {"src": "contenu/2026-11-02/p7-3.jpg", "type": "image", "legende": "Page 3/3"}]'::jsonb, '{"semaine": "Semaine du 2 novembre 2026", "jour": "Dimanche 8 nov.", "heure": "10 h", "etage": "BOFU", "format": "Carrousel", "vendeur": true, "reserve": false, "plateformes": "Instagram · Facebook"}'::jsonb, 7, 'a_valider'),
  ('pub-2026-11-02-8', 'contenu', '2026-11-02', 'Les 3 erreurs des vendeurs pressés', 'Lucidité', 'Vendre vite, oui. Trop vite, non. 🏡

Les 3 erreurs qu''on voit le plus souvent :
1. Le prix mal fixé.
2. Les photos ratées.
3. La maison pas prête.

On bâtit le bon plan avec vous, dès le départ. Partagez-le à un propriétaire qui pense vendre.

Faire équipe, à chaque étape. ✨

#vendremamaison #immobilierquebec #conseilsvendeurs #levis #quebec

Gabrielle Germain, courtière en immobilier résidentiel et commercial · RE/MAX 1er Choix inc., agence immobilière', '[{"src": "contenu/2026-11-02/p8-1.jpg", "type": "image", "legende": "Page 1/5"}, {"src": "contenu/2026-11-02/p8-2.jpg", "type": "image", "legende": "Page 2/5"}, {"src": "contenu/2026-11-02/p8-3.jpg", "type": "image", "legende": "Page 3/5"}, {"src": "contenu/2026-11-02/p8-4.jpg", "type": "image", "legende": "Page 4/5"}, {"src": "contenu/2026-11-02/p8-5.jpg", "type": "image", "legende": "Page 5/5"}]'::jsonb, '{"semaine": "Semaine du 2 novembre 2026", "jour": "Réserve", "heure": "—", "etage": "TOFU", "format": "Carrousel", "vendeur": true, "reserve": true, "plateformes": "Instagram · Facebook"}'::jsonb, 8, 'a_valider');

update public.elements set statut = 'approuve'
where section_id = 'livrables' and cle in ('doc-culture','doc-ods','doc-site','doc-publications','doc-styles') and statut = 'modifications';

commit;
