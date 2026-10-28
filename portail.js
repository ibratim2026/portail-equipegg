// Portail v2 de L'équipe Gabrielle Germain.
// Catégories sur le côté (barre d'onglets en bas sur cellulaire), Validation en fil continu, Bibliothèque des documents validés.
// Gabrielle et William voient la même chose. Les outils d'admin (console, prospects) restent dans ancien.html.
// ?demo : charge les données locales (contenu/<semaine>/semaine.json), sans Supabase, pour vérifier avant de publier.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
import { CONFIG } from './config.js';
import { LIVRABLES } from './livrables.js';

const sb = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
const DEMO = new URLSearchParams(location.search).has('demo');
const SEMAINE_DEMO = '2026-11-02';
const app = document.getElementById('app');

const etat = { jeton: null, membre: null, elements: [], commentaires: [], vue: lire('vue2') || 'Validation', ouverts: new Set() };

// Les documents validés une première fois, rangés par catégorie (décision de William, 28 oct. 2026).
const BIBLIO = {
  'doc-culture': { cat: 'Culture', pdf: 'docs/pdf/guide-culture.pdf', ap: 'bibliotheque/apercus/culture.jpg' },
  'doc-ods': { cat: 'Offres', pdf: 'docs/pdf/offre-vendeurs.pdf', ap: 'bibliotheque/apercus/offre.jpg' },
  'doc-site': { cat: 'Site web', pdf: null, ap: 'bibliotheque/apercus/site.jpg' },
  'doc-publications': { cat: 'Publications', pdf: 'docs/pdf/routine-publications.pdf', ap: 'bibliotheque/apercus/routine.jpg' },
  'doc-styles': { cat: 'Publications', pdf: 'docs/pdf/styles-publication.pdf', ap: 'bibliotheque/apercus/styles.jpg' },
  'doc-idees': { cat: 'Publications', pdf: 'docs/pdf/publications-logique.pdf', ap: 'bibliotheque/apercus/idees.jpg' },
  'doc-roles': { cat: 'Équipe', pdf: 'docs/pdf/qui-fait-quoi.pdf', ap: 'bibliotheque/apercus/roles.jpg' },
};
const CATS = [
  { id: 'Marque', coul: 'var(--brun)', fond: '#E9DFD5' },
  { id: 'Culture', coul: 'var(--toffee)', fond: '#EFE6DC' },
  { id: 'Offres', coul: 'var(--rose)', fond: '#F3DCD6' },
  { id: 'Site web', coul: 'var(--sauge)', fond: '#E3E8E5' },
  { id: 'Publications', coul: 'var(--toffee)', fond: '#EFE6DC' },
  { id: 'Équipe', coul: 'var(--sauge)', fond: '#E3E8E5' },
  { id: 'Outils', coul: 'var(--noisette)', fond: '#EFE6DC' },
];
const EQUIPE = [ // mots de Gabrielle (textos du 26 et du 27 oct. 2026)
  ['gabrielle', 'Gabrielle Germain', 'Courtière en immobilier résidentiel et commercial'],
  ['victoria-racette', 'Victoria Racette', 'Courtière en immobilier résidentiel'],
  ['nancy', 'Nancy Villeneuve', 'Adjointe immobilière'],
  ['antoine', 'Antoine Tanguay', 'Courtier immobilier résidentiel'],
  ['marie-france', 'Marie-France Drolet', 'Courtière en immobilier résidentiel'],
  ['audrey', 'Audrey Vallières-Olivier', 'Courtière en immobilier résidentiel'],
  ['victoria-gagnon', 'Victoria Gagnon', 'Courtière à venir'],
  ['equipe', 'La photo d\'équipe', 'Audrey s\'ajoutera à la prochaine'],
];
const COULEURS = [['Toffee', '#CAB6A0'], ['Sauge', '#9FACA4'], ['Pastel rosé', '#DCA39A'], ['Lait frappé', '#F5F1EA'], ['Noisette', '#8F7060'], ['Terre d\'ombre', '#70574A'], ['Toffee foncé', '#B59981'], ['Sauge foncé', '#81968C'], ['Rosé foncé', '#CE817B']];

function lire(k) { try { return localStorage.getItem('gg-' + k); } catch { return null; } }
function ecrire(k, v) { try { localStorage.setItem('gg-' + k, v); } catch { /* rien */ } }
function el(tag, attrs = {}, ...enfants) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? '' : v);
  }
  for (const e of enfants.flat()) if (e != null) n.append(e);
  return n;
}
function toast(t, erreur) {
  let n = document.querySelector('.toast');
  if (!n) { n = el('div', { class: 'toast', role: 'status' }); document.body.append(n); }
  n.textContent = t; n.classList.toggle('erreur', !!erreur); n.classList.add('on');
  clearTimeout(toast.t); toast.t = setTimeout(() => n.classList.remove('on'), 2200);
}

// ---------- Accès par lien personnel (même jeton que l'ancien portail) ----------
function lireJeton() {
  const k = new URLSearchParams(location.hash.slice(1)).get('k') || new URLSearchParams(location.search).get('k');
  if (k) { ecrire('jeton', k); history.replaceState(null, '', location.pathname + (DEMO ? '?demo' : '')); return k; }
  return lire('jeton');
}
function lienInvalide(msg) {
  app.replaceChildren(el('div', { class: 'acces' },
    el('img', { src: 'marque/logo-equipe_fond-clair.png', alt: 'L\'équipe Gabrielle Germain' }),
    el('h1', { class: 'pf' }, msg || 'Ouvrez votre lien personnel'),
    el('p', {}, 'Utilisez le lien que William vous a envoyé. Vous ne l\'avez plus? Demandez-le-lui.')));
}

// ---------- Données ----------
async function charger() {
  if (DEMO) {
    const s = await fetch(`contenu/${SEMAINE_DEMO}/semaine.json`).then((r) => r.json());
    etat.membre = { nom: 'Démo', role: 'admin' };
    etat.elements = s.elements.map((x, i) => ({ ...x, id: 'demo-' + i }));
    etat.commentaires = [];
    return rendre();
  }
  etat.jeton = lireJeton();
  if (!etat.jeton) return lienInvalide();
  app.replaceChildren(el('div', { class: 'chargement' }, 'Chargement…'));
  const { data, error } = await sb.rpc('portail_charger', { p_jeton: etat.jeton });
  if (error || !data) {
    if (/invalide/i.test(error?.message || '')) { try { localStorage.removeItem('gg-jeton'); } catch { /* rien */ } return lienInvalide('Ce lien n\'est plus valide'); }
    return lienInvalide('Connexion impossible pour le moment. Réessayez dans un instant.');
  }
  etat.membre = data.membre;
  etat.elements = data.elements || [];
  etat.commentaires = data.commentaires || [];
  if (new URLSearchParams(location.search).has('go')) etat.vue = 'Validation';
  rendre();
}

// Les publications de la semaine la plus récente (section « contenu »).
function semaine() {
  const pubs = etat.elements.filter((x) => x.section_id === 'contenu');
  if (!pubs.length) return { titre: null, pubs: [] };
  const derniere = pubs.map((x) => x.groupe).sort().at(-1);
  const liste = pubs.filter((x) => x.groupe === derniere).sort((a, b) => a.ordre - b.ordre);
  return { titre: liste[0].meta?.semaine || 'La semaine', pubs: liste };
}
const aValider = () => semaine().pubs.filter((x) => x.statut === 'a_valider').length;
const derniereNote = (id) => etat.commentaires.filter((c) => c.element_id === id && c.type === 'modifications').sort((a, b) => (a.cree_le < b.cree_le ? 1 : -1))[0]?.texte;

async function decider(item, decision, texte) {
  if (DEMO) {
    item.statut = decision === 'approbation' ? 'approuve' : 'modifications';
    if (texte) etat.commentaires.push({ element_id: item.id, type: 'modifications', texte, cree_le: new Date().toISOString() });
  } else {
    const { data, error } = await sb.rpc('portail_decider', { p_jeton: etat.jeton, p_element: item.id, p_decision: decision, p_texte: texte || null });
    if (error || !data) { toast(error?.message || 'Erreur, réessayez', true); return false; }
    Object.assign(item, data.element);
    etat.commentaires = etat.commentaires.filter((c) => c.element_id !== item.id).concat(data.commentaires || []);
  }
  etat.ouverts.delete(item.id);
  toast(decision === 'approbation' ? 'Approuvée ✓' : 'Modification envoyée à William');
  rendre();
  return true;
}

// ---------- Rendu ----------
function aller(vue) { etat.vue = vue; ecrire('vue2', vue); rendre(); window.scrollTo({ top: 0 }); }

function rendre() {
  const y = rendre.vue === etat.vue ? window.scrollY : 0; rendre.vue = etat.vue;
  const n = aValider();
  document.title = (n ? `(${n}) ` : '') + 'Portail · L\'équipe Gabrielle Germain';
  const items = [{ id: 'Validation', coul: 'var(--rose)' }, ...CATS];
  const bouton = (c, mob) => el('button', { type: 'button', class: etat.vue === c.id ? 'on' : '', 'aria-current': etat.vue === c.id ? 'page' : null, onclick: () => aller(c.id) },
    el('span', { class: 'pt', style: `background:${c.coul}` }), mob ? null : c.id,
    c.id === 'Validation' && n ? el('span', { class: 'pastille', 'aria-label': `${n} à valider` }, String(n)) : null, mob ? c.id : null);
  const cote = el('aside', { class: 'cote' },
    el('img', { class: 'logo', src: 'marque/logo-equipe_fond-clair.png', alt: 'L\'équipe Gabrielle Germain' }),
    el('nav', { 'aria-label': 'Sections' }, bouton(items[0]), el('div', { class: 'sep' }), items.slice(1).map((c) => bouton(c))),
    el('div', { class: 'bas' },
      el('div', { class: 'partage' }, el('span', { class: 'av g' }, 'G'), el('span', { class: 'av w' }, 'W'), 'Gabrielle et William voient la même chose'),
      etat.membre?.role === 'admin' && !DEMO ? el('a', { class: 'lien', href: 'ancien.html' }, 'Console et prospects') : null,
      DEMO ? null : el('button', { type: 'button', class: 'lien', style: 'text-align:left', onclick: () => { try { localStorage.removeItem('gg-jeton'); } catch { /* rien */ } lienInvalide(); } }, 'Quitter')));
  const mob = el('nav', { class: 'onglets-mob', 'aria-label': 'Sections' }, items.map((c) => bouton(c, true)));
  let contenu;
  if (etat.vue === 'Validation') contenu = vueValidation();
  else if (etat.vue === 'Marque') contenu = vueMarque();
  else if (etat.vue === 'Équipe') contenu = vueEquipe();
  else if (etat.vue === 'Outils') contenu = vueOutils();
  else contenu = vueCategorie(etat.vue);
  app.replaceChildren(el('div', { class: 'coquille' }, cote, el('main', { class: 'page' }, contenu), mob));
  window.scrollTo({ top: y });
}

// ---------- Validation : elle descend et valide une publication après l'autre ----------
function carrousel(medias) {
  const piste = el('div', { class: 'piste' }, medias.map((m, i) => el('img', { src: m.src, alt: `Image ${i + 1} sur ${medias.length}`, loading: i ? 'lazy' : 'eager' })));
  const car = el('div', { class: 'car' }, piste);
  if (medias.length > 1) {
    const points = el('div', { class: 'points', 'aria-hidden': 'true' }, medias.map((_, i) => el('i', { class: i ? '' : 'on' })));
    const glisser = (d) => piste.scrollBy({ left: d * piste.clientWidth, behavior: 'smooth' });
    car.append(el('button', { type: 'button', class: 'nav g', 'aria-label': 'Image précédente', onclick: () => glisser(-1) }, '‹'),
      el('button', { type: 'button', class: 'nav d', 'aria-label': 'Image suivante', onclick: () => glisser(1) }, '›'), points);
    piste.addEventListener('scroll', () => { const i = Math.round(piste.scrollLeft / piste.clientWidth); [...points.children].forEach((p, j) => p.classList.toggle('on', i === j)); });
  }
  return car;
}
function zoneValidation(p) {
  const decide = p.statut !== 'a_valider' && !etat.ouverts.has(p.id);
  if (decide) {
    const note = p.statut === 'modifications' ? derniereNote(p.id) : null;
    return el('div', { class: 'fait ' + p.statut },
      el('span', {}, p.statut === 'approuve' ? '✓ Approuvée' : 'Modification envoyée à William'),
      el('button', { type: 'button', class: 'lien', onclick: () => { etat.ouverts.add(p.id); rendre(); } }, 'Changer d\'avis'),
      note ? el('div', { class: 'note' }, '« ' + note + ' »') : null);
  }
  const zone = el('textarea', { placeholder: 'Ce que vous aimeriez changer (visuel, texte, idée)…', 'aria-label': 'Votre modification' });
  return el('div', { class: 'deux' },
    el('div', { class: 'zone ok' }, el('b', {}, 'C\'est parfait'), el('p', {}, 'On la publie telle quelle.'),
      el('button', { type: 'button', class: 'btn ok', onclick: (e) => { e.currentTarget.disabled = true; decider(p, 'approbation'); } }, '✓ J\'approuve')),
    el('div', { class: 'zone modif' }, el('b', {}, 'Je changerais quelque chose'), zone,
      el('button', { type: 'button', class: 'btn modif', onclick: (e) => {
        if (!zone.value.trim()) { zone.focus(); toast('Écrivez ce que vous aimeriez changer'); return; }
        e.currentTarget.disabled = true; decider(p, 'modifications', zone.value.trim());
      } }, 'Envoyer ma modification')));
}
function vueValidation() {
  const { titre, pubs } = semaine();
  if (!pubs.length) {
    return el('div', {}, el('div', { class: 'tete' }, el('h1', {}, 'Validation')),
      el('div', { class: 'vide' }, el('span', { class: 'script' }, 'rien à valider'), 'Vos prochaines publications arriveront ici. Vous recevrez un message de William.'));
  }
  const faits = pubs.filter((x) => x.statut !== 'a_valider').length;
  const prenom = (etat.membre?.nom || 'Gabrielle').split(' ')[0];
  return el('div', {},
    el('div', { class: 'tete' },
      el('div', {}, el('span', { class: 'script', style: 'font-size:36px;color:var(--script)' }, 'bonjour ' + prenom), el('h1', {}, titre)),
      el('div', { class: 'sous' }, 'Avant vendredi midi')),
    el('div', { class: 'prog' }, el('div', { class: 'prog-t' }, `${faits} sur ${pubs.length} revues`), el('div', { class: 'prog-b' }, el('i', { style: `width:${faits / pubs.length * 100}%` }))),
    el('div', { class: 'fil' }, pubs.map((p) => {
      const m = p.meta || {};
      return el('article', { class: 'pub ' + (etat.ouverts.has(p.id) ? '' : p.statut), id: 'pub-' + p.ordre },
        carrousel(p.medias || []),
        el('div', { class: 'pub-txt' },
          el('div', { class: 'pub-meta' }, el('span', { class: 'jr' }, m.reserve ? 'Réserve' : `${m.jour} · ${m.heure}`), m.etage ? el('span', { class: 'etiq ' + m.etage }, m.etage) : null, m.vendeur ? el('span', { class: 'etiq' }, 'Vendeurs') : null, m.format ? el('span', { class: 'etiq' }, m.format) : null),
          el('h2', {}, p.titre),
          el('div', { class: 'leg' }, p.corps || '')),
        el('div', { class: 'pub-val' }, zoneValidation(p)));
    })),
    faits === pubs.length ? el('div', { class: 'merci' }, el('span', { class: 'script' }, 'merci ' + prenom + '!'), el('p', {}, 'Tout est revu. William prépare la programmation de la semaine.')) : null);
}

// ---------- Bibliothèque ----------
function vueCategorie(cat) {
  const c = CATS.find((x) => x.id === cat) || CATS[1];
  const docs = LIVRABLES.filter((L) => BIBLIO[L.cle]?.cat === cat);
  return el('div', {},
    el('div', { class: 'tete' }, el('div', {}, el('h1', {}, cat), el('p', { class: 'sous' }, `${docs.length} document${docs.length > 1 ? 's' : ''} validé${docs.length > 1 ? 's' : ''}, prêt${docs.length > 1 ? 's' : ''} à télécharger`))),
    el('div', { class: 'tuiles' }, docs.map((L) => {
      const b = BIBLIO[L.cle];
      return el('article', { class: 'tuile', style: `background:${c.fond}` },
        el('div', {}, el('div', { class: 'rub' }, '✓ Validé'), el('div', { class: 't' }, L.titre), el('div', { class: 's' }, L.usage || '')),
        el('img', { class: 'ap', src: b.ap, alt: '' }),
        el('div', { class: 'act' },
          el('a', { class: 'btn', href: L.doc, target: '_blank', rel: 'noopener' }, 'Ouvrir'),
          b.pdf ? el('a', { class: 'btn plein', href: b.pdf, download: '' }, '↓ PDF') : null));
    })));
}
function vueMarque() {
  const logo = (src, nom, fonce) => el('div', { class: 'case' + (fonce ? ' fonce' : '') }, el('img', { src, alt: nom }), el('a', { class: 'btn', href: src, download: '' }, '↓ PNG'));
  return el('div', {},
    el('div', { class: 'tete' }, el('div', {}, el('h1', {}, 'Votre marque'), el('p', { class: 'sous' }, 'Logos, couleurs, polices et illustrations du guide des normes.')),
      el('a', { class: 'btn plein', href: 'bibliotheque/marque-gabrielle-germain.zip', download: '' }, '↓ Tout télécharger (ZIP)')),
    el('section', { class: 'bloc' }, el('h2', {}, 'Vos logos'), el('div', { class: 'grille logos' },
      logo('marque/logo-equipe_fond-clair.png', 'Logo de l\'équipe, fond clair'), logo('marque/logo-equipe_fond-fonce.png', 'Logo de l\'équipe, fond foncé', true),
      logo('marque/logo-en-mode.png', 'En mode immobilier', true), logo('marque/sigle-gg.png', 'Sigle GG'),
      logo('marque/remax-1er-choix_fond-clair.png', 'RE/MAX 1er Choix'), logo('marque/remax-1er-choix_fond-fonce.png', 'RE/MAX 1er Choix, fond foncé', true))),
    el('section', { class: 'bloc' }, el('h2', {}, 'Vos couleurs'), el('div', { class: 'grille couleurs' }, COULEURS.map(([n, c]) => el('button', { type: 'button', class: 'coul', onclick: () => { navigator.clipboard?.writeText(c); toast(c + ' copié'); } },
      el('div', { style: 'background:' + c }), el('span', {}, el('b', {}, n), c))))),
    el('section', { class: 'bloc' }, el('h2', {}, 'Vos polices'), el('div', { class: 'grille polices' },
      [['Playfair Display', 'Titres', 'font-family:Playfair Display;font-size:28px'], ['Jost', 'Textes', 'font-family:Jost;font-size:26px'], ['Ms Madi', 'Signature', 'font-family:Ms Madi;font-size:40px']].map(([n, r, s]) =>
        el('a', { class: 'case', href: 'https://fonts.google.com/specimen/' + n.replace(/ /g, '+'), target: '_blank', rel: 'noopener', style: 'text-decoration:none' }, el('div', { style: s + ';line-height:1.2' }, 'Faire équipe'), el('span', { style: 'font-size:13px;color:var(--noisette)' }, `${n} · ${r} · gratuite ↗`))))),
    el('section', { class: 'bloc' }, el('h2', {}, 'Vos illustrations'), el('div', { class: 'grille logos' },
      ['maison-pastel-rose-fonce', 'trio-de-maisons-toffee', 'motif-maison-twist-horizontal-sauge', 'trait-long-pastel-rose-fonce', 'fleche-toffee-fonce', 'sapin-sauge-fonce', 'a-vendre', 'vendu'].map((n) => logo(`marque/${n}.png`, n)))));
}
function vueEquipe() {
  return el('div', {}, vueCategorie('Équipe'),
    el('section', { class: 'bloc', style: 'margin-top:30px' }, el('h2', {}, 'Les photos de l\'équipe'),
      el('div', { class: 'grille photos' }, EQUIPE.map(([f, n, r]) => el('div', { class: 'photo' }, el('img', { src: `bibliotheque/equipe/${f}.jpg`, alt: n, loading: 'lazy' }),
        el('div', {}, el('b', {}, n), el('span', {}, r), el('a', { class: 'lien', href: `bibliotheque/equipe/${f}.jpg`, download: '' }, '↓ Pleine qualité')))))));
}
function vueOutils() {
  try { localStorage.setItem('gg-vue', 'outils'); } catch { /* rien */ }
  return el('div', {}, el('div', { class: 'tete' }, el('div', {}, el('h1', {}, 'Outils'), el('p', { class: 'sous' }, 'Paiement hypothécaire, mise de fonds, taxe de bienvenue, net au vendeur.'))),
    el('iframe', { class: 'cadre-outils', src: 'ancien.html', title: 'Outils de calcul' }));
}

charger();
