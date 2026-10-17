import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
import { CONFIG } from './config.js';
import { RESSOURCES, RESSOURCES_MAJ } from './ressources.js';
import { LIVRABLES } from './livrables.js';
import { OUTILS, OUTILS_MAJ } from './outils.js';

const sb = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });

const app = document.getElementById('app');
const etat = {
  jeton: null, membre: null, sections: [], elements: [], commentaires: [],
  vue: lireStockage('vue') || 'accueil', // 'accueil' | 'ressources' | id de section
  ressource: lireStockage('ressource') || RESSOURCES[0].id,
  outil: lireStockage('outil') || null,
  filtre: 'tous', etape: 'toutes', ouverts: new Set(), mode: {},
  focus: null, // session « un élément à la fois »
};

const STATUTS = {
  a_valider: { txt: 'À valider', cls: 's-attente' },
  approuve: { txt: 'Approuvé', cls: 's-ok' },
  modifications: { txt: 'Modifications demandées', cls: 's-modif' },
};
const TYPES = { approbation: 'a approuvé', modifications: 'demande une modification', commentaire: 'a commenté', reponse: 'a répondu' };
const ETAPES = { TOFU: 'Se faire connaître', MOFU: 'Obtenir le contact', BOFU: 'Donner confiance' };

// Temps de lecture estimé par élément (secondes) et nom au pluriel, pour l'accueil.
const SORTES = {
  'Les Reels': { s: 45, un: 'vidéo', plus: 'vidéos' },
  'Les carrousels': { s: 35, un: 'carrousel', plus: 'carrousels' },
  'Les photos': { s: 15, un: 'photo', plus: 'photos' },
  'Les stories': { s: 20, un: 'story', plus: 'stories' },
  'Les légendes': { s: 25, un: 'modèle de légende', plus: 'modèles de légende' },
  'La signature': { s: 20, un: 'élément de signature', plus: 'éléments de signature' },
};
function sorte(item) {
  if (item.section_id === 'marque') return { cle: 'marque', s: 25, un: 'formulation', plus: 'formulations' };
  if (item.section_id === 'idees') return { cle: 'idees', s: 12, un: 'idée', plus: 'idées' };
  const x = SORTES[item.groupe];
  return x ? { cle: item.groupe, ...x } : { cle: item.groupe || item.section_id, s: 25, un: 'élément', plus: 'éléments' };
}
const minutes = (liste) => Math.max(1, Math.round(liste.reduce((t, x) => t + sorte(x).s, 0) / 60));
const pluriel = (n, un, plus) => `${n} ${n > 1 ? plus : un}`;

function lireStockage(k) { try { return localStorage.getItem('gg-' + k); } catch { return null; } }
function ecrireStockage(k, v) { try { localStorage.setItem('gg-' + k, v); } catch { /* rien */ } }

function el(tag, attrs = {}, ...enfants) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v; // contenu écrit par l'équipe seulement
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const e of enfants.flat()) if (e != null && e !== false) n.append(e.nodeType ? e : document.createTextNode(String(e)));
  return n;
}
function svg(chemin, cls = 'ico') {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('class', cls); s.setAttribute('aria-hidden', 'true');
  s.innerHTML = chemin;
  return s;
}
const ICO = {
  maison: '<path d="M3.5 11.5 12 4.5l8.5 7M6 10v9.5h12V10"/>',
  coeur: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
  bulle: '<path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5z"/>',
  avion: '<path d="M21 3 3 10.5l7 2.5 2.5 7L21 3zM10 13l5-5"/>',
  signet: '<path d="M6 3.5h12v17l-6-4.5-6 4.5z"/>',
  son: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>',
  muet: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9.5l5 5M21 9.5l-5 5"/>',
  micro: '<path d="M12 3.5a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0v-5a3 3 0 0 1 3-3zM5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  stop: '<rect x="7" y="7" width="10" height="10" rx="1.5"/>',
  crayon: '<path d="M4 20l1-4.5L15.5 5a2 2 0 0 1 3 0l.5.5a2 2 0 0 1 0 3L8.5 19z"/>',
  coche: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  fleche: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  question: '<path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17.5v.1"/>',
};

const dateFr = (d) => new Date(d).toLocaleString('fr-CA', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

// ---------- Accès par lien personnel (sans mot de passe) ----------
function extraireJeton(txt) {
  const t = (txt || '').trim();
  const m = t.match(/[#?&]k=([A-Za-z0-9_-]{12,})/);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{12,}$/.test(t) ? t : null;
}

function lireJeton() {
  const k = new URLSearchParams(location.hash.slice(1)).get('k') || new URLSearchParams(location.search).get('k');
  if (k) {
    ecrireStockage('jeton', k);
    history.replaceState(null, '', location.pathname); // retire le jeton de la barre d'adresse
    return k;
  }
  return lireStockage('jeton');
}

function lienInvalide(msg) {
  document.getElementById('haut-droite').hidden = true;
  const champ = el('input', { type: 'text', placeholder: 'Collez votre lien ou votre code', autocomplete: 'off', 'aria-label': 'Lien ou code personnel' });
  const info = el('p', { class: 'message erreur', role: 'status' }, msg || '');
  app.replaceChildren(el('section', { class: 'connexion' },
    el('h1', {}, 'Votre lien ', el('i', {}, 'personnel')),
    el('p', {}, 'Ouvrez cet espace avec le lien personnel que vous avez reçu, ou collez-le ici.'),
    el('form', { onsubmit: async (e) => {
      e.preventDefault();
      const k = extraireJeton(champ.value);
      if (!k) { info.textContent = 'Ce lien ne semble pas complet.'; return; }
      etat.jeton = k; ecrireStockage('jeton', k); await charger();
    } }, champ, el('button', { type: 'submit', class: 'bouton' }, 'Entrer')),
    info,
    el('p', { class: 'note-bas' }, 'Vous ne l\'avez plus? Demandez-le à William.')));
}

async function demarrer() {
  etat.jeton = lireJeton();
  if (!etat.jeton) return lienInvalide();
  await charger();
}

document.getElementById('deconnexion').addEventListener('click', () => {
  try { localStorage.removeItem('gg-jeton'); } catch { /* rien */ }
  etat.jeton = null; fermerFocus(true); lienInvalide();
});

// ---------- Données ----------
async function charger() {
  app.replaceChildren(el('div', { class: 'chargement' }, 'Chargement…'));
  const { data, error } = await sb.rpc('portail_charger', { p_jeton: etat.jeton });
  if (error || !data) {
    const invalide = /invalide/i.test(error?.message || '');
    if (invalide) { try { localStorage.removeItem('gg-jeton'); } catch { /* rien */ } }
    return lienInvalide(invalide ? 'Ce lien n\'est plus valide.' : 'Connexion impossible pour le moment. Réessayez dans un instant.');
  }
  etat.membre = data.membre;
  etat.sections = data.sections || [];
  const rang = new Map(etat.sections.map((s, i) => [s.id, i]));
  etat.elements = (data.elements || []).sort((a, b) => (rang.get(a.section_id) ?? 99) - (rang.get(b.section_id) ?? 99) || a.ordre - b.ordre);
  etat.commentaires = data.commentaires || [];
  document.getElementById('haut-droite').hidden = false;
  document.getElementById('qui').textContent = etat.membre.nom;
  const admin = etat.membre.role === 'admin';
  if (!lireStockage('vue') && admin) etat.vue = 'console';
  if (etat.vue === 'console' && !admin) etat.vue = 'accueil';
  if (!['accueil', 'ressources', 'outils', 'console'].includes(etat.vue) && !etat.vue.startsWith('doc:') && !etat.sections.find((x) => x.id === etat.vue)) etat.vue = admin ? 'console' : 'accueil';
  rendre();
  if (!lireStockage('intro-v2') && etat.membre.role !== 'admin') ouvrirIntro();
}

function majLocale(id, data) {
  const cible = etat.elements.find((x) => x.id === id);
  if (cible && data.element) Object.assign(cible, data.element);
  etat.commentaires = etat.commentaires.filter((x) => x.element_id !== id).concat(data.commentaires || []);
}

async function decider(id, decision, texte, { silencieux = false } = {}) {
  const { data, error } = await sb.rpc('portail_decider', { p_jeton: etat.jeton, p_element: id, p_decision: decision, p_texte: texte || null });
  if (error || !data) { alerte(error?.message || 'Erreur'); return false; }
  majLocale(id, data);
  if (!silencieux) rendre();
  return true;
}

async function envoyerNote(id, decision, blob, duree, texte) {
  const b64 = await new Promise((ok, ko) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(',')[1] || '');
    r.onerror = () => ko(r.error);
    r.readAsDataURL(blob);
  });
  const { data, error } = await sb.rpc('portail_note_vocale', {
    p_jeton: etat.jeton, p_element: id, p_audio: b64, p_mime: blob.type || 'audio/webm', p_duree: duree, p_texte: texte || null, p_decision: decision,
  });
  if (error || !data) return { ok: false, message: error?.message };
  majLocale(id, data);
  return { ok: true };
}

async function renvoyer(id, texte) {
  const { data, error } = await sb.rpc('portail_admin_statut', { p_jeton: etat.jeton, p_element: id, p_statut: 'a_valider', p_texte: texte || null });
  if (error || !data) { alerte(error?.message || 'Erreur'); return false; }
  majLocale(id, data);
  alerte('Renvoyé en validation ✓', 'ok');
  rendre();
  return true;
}

async function ecouter(btn, commentaireId) {
  btn.disabled = true; btn.textContent = 'Chargement…';
  const { data, error } = await sb.rpc('portail_audio', { p_jeton: etat.jeton, p_commentaire: commentaireId });
  if (error || !data) { btn.disabled = false; btn.textContent = '▶ Écouter'; alerte('Note introuvable.'); return; }
  const audio = el('audio', { controls: true, src: `data:${data.mime};base64,${data.b64}`, class: 'c-audio' });
  btn.replaceWith(audio);
  audio.play().catch(() => {});
}

function alerte(txt, cls = '') {
  const a = el('div', { class: 'toast ' + cls, role: 'alert' }, txt);
  document.body.append(a);
  setTimeout(() => a.remove(), 3800);
}

// ---------- Rendu général ----------
function compte(liste) {
  const r = { total: liste.length, a_valider: 0, approuve: 0, modifications: 0 };
  for (const x of liste) r[x.statut] = (r[x.statut] || 0) + 1;
  return r;
}
const aValider = (liste = etat.elements) => liste.filter((x) => x.statut === 'a_valider');

function aller(vue) {
  etat.vue = vue; etat.filtre = 'tous'; etat.etape = 'toutes';
  ecrireStockage('vue', vue);
  rendre();
  window.scrollTo({ top: 0 });
}

function navigation() {
  const n = aValider().length;
  const pastille = (txt, vue, badge) => el('button', {
    type: 'button', class: 'nav-p' + (etat.vue === vue ? ' actif' : ''), 'aria-current': etat.vue === vue ? 'page' : null,
    onclick: () => aller(vue),
  }, txt, badge ? el('span', { class: 'nav-b' }, badge) : null);
  const admin = etat.membre.role === 'admin';
  const docs = LIVRABLES.map((L) => {
    const it = elementDoc(L);
    const marque = !L.doc ? '…' : (it?.statut === 'approuve' ? '✓' : (it?.statut === 'modifications' ? '✎' : null));
    return el('button', { type: 'button', class: 'nav-p doc' + (etat.vue === 'doc:' + L.cle ? ' actif' : ''), onclick: () => aller('doc:' + L.cle) },
      el('span', { class: 'nav-n' }, L.n), L.court, marque ? el('span', { class: 'nav-m' }, marque) : null);
  });
  return el('nav', { class: 'nav-portail', 'aria-label': 'Sections' },
    admin ? pastille('Console', 'console', etat.elements.filter((x) => x.statut === 'modifications').length || null) : null,
    pastille(admin ? 'Vue cliente' : 'Accueil', 'accueil', docsAValider().length || null),
    docs,
    admin ? etat.sections.filter((s) => s.id !== 'livrables').map((s) => pastille(s.titre, s.id, aValider(etat.elements.filter((x) => x.section_id === s.id)).length || null)) : null,
    pastille('Outils', 'outils'),
    pastille('Ressources', 'ressources'));
}

function rendre() {
  const scrollY = window.scrollY;
  let contenu;
  if (etat.vue.startsWith('doc:')) contenu = vueDoc(etat.vue.slice(4));
  else if (etat.vue === 'console') contenu = vueConsole();
  else if (etat.vue === 'accueil') contenu = vueAccueil();
  else if (etat.vue === 'ressources') contenu = vueRessources();
  else if (etat.vue === 'outils') contenu = vueOutils();
  else contenu = vueSection();
  app.replaceChildren(navigation(), contenu,
    el('footer', { class: 'pied' }, 'L\'équipe Gabrielle Germain · espace privé de validation'));
  window.scrollTo({ top: scrollY });
}

// ---------- Accueil ----------
function puces(liste) {
  const parSorte = new Map();
  for (const x of liste) {
    const s = sorte(x);
    const c = parSorte.get(s.cle) || { ...s, n: 0 };
    c.n += 1; parSorte.set(s.cle, c);
  }
  return el('ul', { class: 'puces-sortes' }, [...parSorte.values()].map((s) => el('li', {}, el('b', {}, s.n), ' ', s.n > 1 ? s.plus : s.un)));
}

const elementDoc = (L) => etat.elements.find((x) => x.cle === L.cle);
const docsAValider = () => LIVRABLES.filter((L) => L.doc && elementDoc(L)?.statut !== 'approuve' && elementDoc(L)?.statut !== 'modifications');
const ETAT_DOC = {
  approuve: ['Approuvé', 's-ok'], modifications: ['Changements demandés', 's-modif'], a_valider: ['À valider', 's-attente'],
};
function etatDoc(L) {
  if (!L.doc) return ['En préparation', 's-prep'];
  return ETAT_DOC[elementDoc(L)?.statut] || ETAT_DOC.a_valider;
}

function vueAccueil() {
  const prenom = (etat.membre.nom || '').split(' ')[0];
  const prets = LIVRABLES.filter((L) => L.doc);
  const reste = docsAValider();
  const ok = prets.filter((L) => elementDoc(L)?.statut === 'approuve').length;
  const prochain = reste[0];

  const intro = el('section', { class: 'intro' },
    el('p', { class: 'surtitre' }, 'Espace de validation'),
    el('h1', {}, 'Bonjour ', el('i', {}, prenom), '.'),
    el('p', { class: 'chapo' }, 'Voici vos documents, présentés comme ils seront remis. Lisez-les, puis approuvez ou dites-nous quoi changer. Une fois approuvés, ils sont à vous : à montrer à votre équipe et à vos clients.'));

  const lot = reste.length ? el('section', { class: 'lot' },
    el('p', { class: 'lot-sur' }, 'À valider'),
    el('p', { class: 'lot-titre' }, el('b', {}, pluriel(reste.length, 'document vous attend', 'documents vous attendent')), el('span', {}, `${ok} sur ${prets.length} approuvés`)),
    el('div', { class: 'lot-actions' },
      el('button', { type: 'button', class: 'bouton grand', onclick: () => aller('doc:' + prochain.cle) }, `Commencer par « ${prochain.court} »`, svg(ICO.fleche)),
      el('button', { type: 'button', class: 'lien', onclick: ouvrirIntro }, 'Comment ça marche?')))
    : el('section', { class: 'lot fini' }, el('p', { class: 'lot-sur' }, 'Tout est à jour'),
      el('p', { class: 'lot-titre' }, el('b', {}, 'Rien à valider pour le moment ✓')),
      el('p', { class: 'lot-note' }, 'Merci! Nous vous écrivons dès qu\'il y a du nouveau.'));

  const liste = el('section', { class: 'docs' }, el('h2', { class: 'groupe' }, 'Vos 7 documents'),
    el('div', { class: 'docs-grille' }, LIVRABLES.map((L) => {
      const [txt, cls] = etatDoc(L);
      return el('article', { class: 'doc-carte ' + cls, onclick: () => aller('doc:' + L.cle) },
        el('span', { class: 'doc-n' }, String(L.n).padStart(2, '0')),
        el('div', { class: 'doc-txt' }, el('h3', {}, L.titre), el('p', {}, L.sous)),
        el('span', { class: 'statut' }, txt));
    })));
  return el('div', {}, intro, lot, liste);
}

// ---------- Un document + sa zone de validation ----------
function vueDoc(cle) {
  const L = LIVRABLES.find((x) => x.cle === cle) || LIVRABLES[0];
  const item = elementDoc(L);
  const i = LIVRABLES.indexOf(L);
  const suivant = LIVRABLES.slice(i + 1).concat(LIVRABLES.slice(0, i)).find((x) => x.doc && elementDoc(x)?.statut !== 'approuve');
  const [txt, cls] = etatDoc(L);

  const tete = el('div', { class: 'd-tete' },
    el('div', {}, el('p', { class: 'surtitre' }, `Document ${L.n} sur ${LIVRABLES.length}`), el('h1', {}, L.titre), el('p', { class: 'd-usage' }, L.usage)),
    L.doc ? el('div', { class: 'd-outils' },
      el('a', { class: 'bouton secondaire', href: L.doc, target: '_blank', rel: 'noopener' }, 'Ouvrir en plein écran'),
      el('button', { type: 'button', class: 'lien', onclick: () => { try { document.getElementById('d-cadre').contentWindow.print(); } catch { window.open(L.doc, '_blank'); } } }, 'Imprimer / PDF')) : null);

  if (!L.doc) {
    return el('div', { class: 'vue-doc' }, tete, el('div', { class: 'd-prep' },
      el('p', { class: 'lot-sur' }, 'En préparation'), el('h2', {}, 'Nous rédigeons vos offres de services.'),
      el('p', {}, 'Elles apparaîtront ici dès qu\'elles seront prêtes, présentées comme vous les enverrez à vos clients.')));
  }

  const cadre = el('iframe', { id: 'd-cadre', class: 'd-cadre', src: L.doc, title: L.titre, loading: 'eager' });
  const gauche = el('div', { class: 'd-gauche' + (etat.appareil === 'tel' ? ' tel' : '') }, cadre);
  const bascule = el('div', { class: 'd-appareil', role: 'group', 'aria-label': 'Affichage' },
    [['ordi', 'Ordinateur'], ['tel', 'Cellulaire']].map(([v, t]) => el('button', { type: 'button', class: (etat.appareil || 'ordi') === v ? 'actif' : '',
      onclick: (e) => { etat.appareil = v; gauche.classList.toggle('tel', v === 'tel'); [...e.currentTarget.parentNode.children].forEach((x) => x.classList.toggle('actif', x === e.currentTarget)); } }, t)));
  const parties = [];
  cadre.addEventListener('load', () => {
    try {
      const d = cadre.contentDocument;
      const rub = d.querySelectorAll('.rubrique');
      (rub.length ? rub : d.querySelectorAll('section h2, main h2')).forEach((h) => { const t = h.textContent.trim().replace(/\s+/g, ' '); if (t && !parties.includes(t)) parties.push(t); });
      d.querySelectorAll('a[href^="http"]').forEach((a) => a.setAttribute('target', '_blank'));
    } catch { /* rien */ }
  });

  const panneau = el('aside', { class: 'd-panneau', id: 'd-panneau' });
  const remplir = () => {
    const item = elementDoc(L);
    const [txt, cls] = etatDoc(L);
    const bs = document.getElementById('d-barre-statut'); if (bs) bs.textContent = txt;
    panneau.replaceChildren();
    panneau.append(el('div', { class: 'd-etat ' + cls }, el('span', { class: 'statut' }, txt), item ? el('small', {}, `version ${item.version || 1}`) : null));
    if (!item) {
      panneau.append(el('p', { class: 'd-info' }, 'La validation de ce document s\'ouvre bientôt. Vous pouvez déjà le lire.'));
      return;
    }
    const cleOuv = 'd-' + item.id;
    const mode = etat.ouverts.has(cleOuv) ? etat.mode[cleOuv] : null;
    if (mode) {
      panneau.append(formulaire(item, mode, {
        parties,
        apres: () => { etat.ouverts.delete(cleOuv); alerte(mode === 'modifications' ? 'Merci! Votre demande nous est arrivée.' : 'Merci! Votre question nous est arrivée.', 'ok'); remplir(); },
        annuler: () => { etat.ouverts.delete(cleOuv); remplir(); },
      }));
    } else {
      panneau.append(el('h2', {}, item.statut === 'approuve' ? 'Vous avez approuvé ce document.' : 'Ce document vous convient?'));
      const actions = el('div', { class: 'd-actions' });
      if (item.statut !== 'approuve') {
        actions.append(el('button', { type: 'button', class: 'bouton f-ok', onclick: async (e) => {
          e.currentTarget.disabled = true;
          if (await decider(item.id, 'approbation', null, { silencieux: true })) {
            alerte('Approuvé ✓', 'ok');
            if (suivant) aller('doc:' + suivant.cle); else aller('accueil');
          }
        } }, svg(ICO.coche), 'J\'approuve tel quel'));
      }
      actions.append(el('button', { type: 'button', class: 'bouton secondaire', onclick: () => { etat.ouverts.add(cleOuv); etat.mode[cleOuv] = 'modifications'; remplir(); } }, svg(ICO.crayon), item.statut === 'approuve' ? 'Changer d\'avis' : 'Demander un changement'));
      actions.append(el('button', { type: 'button', class: 'lien', onclick: () => { etat.ouverts.add(cleOuv); etat.mode[cleOuv] = etat.membre.role === 'admin' ? 'reponse' : 'commentaire'; remplir(); } }, etat.membre.role === 'admin' ? 'Répondre' : 'Poser une question'));
      panneau.append(actions);
      panneau.append(el('p', { class: 'd-info' }, 'Vous pouvez viser une partie précise et parler au lieu d\'écrire, avec le micro.'));
    }
    if (L.detail) {
      const det = aValider(etat.elements.filter((x) => x.section_id === L.detail));
      if (det.length) panneau.append(el('div', { class: 'd-detail' }, el('p', {}, 'Vous préférez y aller point par point?'),
        el('button', { type: 'button', class: 'lien', onclick: () => ouvrirFocus(det, L.titre) }, `Valider les ${det.length} éléments un à la fois`)));
    }
    const coms = etat.commentaires.filter((c) => c.element_id === item.id);
    if (coms.length) panneau.append(el('h3', { class: 'd-fil-titre' }, 'Vos échanges'), fil(coms));
    if (suivant && item.statut !== 'a_valider') panneau.append(el('button', { type: 'button', class: 'bouton d-suivant', onclick: () => aller('doc:' + suivant.cle) }, `Document suivant : ${suivant.court}`, svg(ICO.fleche)));
  };
  remplir();

  const barre = el('div', { class: 'd-barre' },
    el('button', { type: 'button', class: 'bouton', onclick: () => panneau.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 'Donner mon avis'),
    el('span', { class: 'statut', id: 'd-barre-statut' }, txt));

  return el('div', { class: 'vue-doc' }, tete, el('div', { class: 'd-grille' }, el('div', {}, bascule, gauche), panneau), barre);
}

// ---------- Console (William) ----------
const ICONES_TYPE = { approbation: '✓', modifications: '✎', commentaire: '?', reponse: '↩' };
function depuis(d) {
  const m = Math.round((Date.now() - new Date(d)) / 60000);
  if (m < 1) return 'à l\'instant';
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.round(h / 24);
  return j < 7 ? `il y a ${j} j` : dateFr(d);
}

function vueConsole() {
  const moi = etat.membre.nom;
  const client = etat.commentaires.filter((c) => c.auteur_nom !== moi);
  const derniere = client.reduce((d, c) => (!d || c.cree_le > d ? c.cree_le : d), null);
  const t = compte(etat.elements);
  const pct = (n) => (t.total ? Math.round((n / t.total) * 100) : 0);
  const titreDe = (id) => etat.elements.find((x) => x.id === id);

  const tuiles = el('div', { class: 'k-tuiles' },
    [['À valider', t.a_valider, `${pct(t.a_valider)} %`, ''], ['Approuvés', t.approuve, `${pct(t.approuve)} %`, 'ok'], ['À modifier', t.modifications, 'à traiter', 'modif'],
      ['Dernière activité', derniere ? depuis(derniere) : '—', derniere ? dateFr(derniere) : 'Pas encore de réponse', 'temps']]
      .map(([k, v, s, cls]) => el('div', { class: 'k-tuile ' + cls }, el('span', {}, k), el('b', {}, v), el('small', {}, s))));

  const progression = el('section', { class: 'k-bloc' }, el('h2', {}, 'Par thème'),
    etat.sections.map((s) => {
      const c = compte(etat.elements.filter((x) => x.section_id === s.id));
      const w = (n) => `${c.total ? (n / c.total) * 100 : 0}%`;
      return el('div', { class: 'k-ligne' },
        el('div', { class: 'k-ligne-tete' }, el('button', { type: 'button', class: 'lien', onclick: () => aller(s.id) }, s.titre),
          el('span', {}, `${c.approuve} ✓ · ${c.modifications} ✎ · ${c.a_valider} en attente`)),
        el('div', { class: 'k-pile' }, el('i', { class: 'ok', style: `width:${w(c.approuve)}` }), el('i', { class: 'modif', style: `width:${w(c.modifications)}` })));
    }));

  // À traiter : demandes de modification
  const aTraiter = etat.elements.filter((x) => x.statut === 'modifications');
  const copier = async () => {
    const lignes = aTraiter.map((x) => {
      const dem = etat.commentaires.filter((c) => c.element_id === x.id && c.auteur_nom !== moi && c.type === 'modifications').map((c) => '   - ' + (c.texte || '').replace(/\n/g, ' '));
      return `- [${x.cle}] ${x.titre} (${etat.sections.find((s) => s.id === x.section_id)?.titre || ''}, v${x.version || 1})\n${dem.join('\n')}`;
    });
    const txt = `Demandes de modification de Gabrielle (portail equipegg) — ${new Date().toLocaleDateString('fr-CA')}\n\n${lignes.join('\n\n')}`;
    try { await navigator.clipboard.writeText(txt); alerte('Copié ✓ Colle-le dans la conversation avec Jarvis.', 'ok'); } catch { alerte('Copie impossible dans ce navigateur.'); }
  };
  const blocTraiter = el('section', { class: 'k-bloc' }, el('h2', {}, 'À traiter', el('span', { class: 'k-compte' }, aTraiter.length),
    aTraiter.length ? el('button', { type: 'button', class: 'lien k-copier', onclick: copier }, 'Copier pour Jarvis') : null),
    aTraiter.length ? aTraiter.map((item) => carteTraiter(item)) : el('p', { class: 'k-vide' }, 'Aucune demande de modification en attente.'));

  // Questions sans réponse : dernier message = question de la cliente
  const questions = etat.elements.filter((x) => {
    const coms = etat.commentaires.filter((c) => c.element_id === x.id);
    const der = coms[coms.length - 1];
    return der && der.type === 'commentaire' && der.auteur_nom !== moi;
  });
  const blocQuestions = questions.length ? el('section', { class: 'k-bloc' }, el('h2', {}, 'Questions sans réponse', el('span', { class: 'k-compte' }, questions.length)),
    questions.map((item) => carteTraiter(item, true))) : null;

  // Activité récente
  const filtres = [['tous', 'Tout'], ['modifications', 'Modifications'], ['commentaire', 'Questions'], ['approbation', 'Approbations'], ['audio', 'Notes vocales']];
  const f = etat.filtreActivite || 'tous';
  let act = [...etat.commentaires].sort((a, b) => (a.cree_le < b.cree_le ? 1 : -1));
  if (f === 'audio') act = act.filter((c) => c.audio);
  else if (f !== 'tous') act = act.filter((c) => c.type === f);
  const blocActivite = el('section', { class: 'k-bloc' }, el('h2', {}, 'Activité récente'),
    el('div', { class: 'filtres k-filtres' }, filtres.map(([v, txt]) => el('button', { type: 'button', class: 'puce' + (f === v ? ' actif' : ''), onclick: () => { etat.filtreActivite = v; rendre(); } }, txt))),
    act.length ? el('ol', { class: 'k-fil' }, regrouper(act).slice(0, 40).map((c) => {
      const item = titreDe(c.element_id);
      if (c.n > 1) {
        return el('li', { class: 'k-approbation' }, el('span', { class: 'k-ico' }, '✓'),
          el('div', {}, el('p', { class: 'k-quoi' }, el('b', {}, c.auteur_nom || ''), ` a approuvé ${c.n} éléments`),
            el('details', { class: 'k-details' }, el('summary', {}, 'Voir lesquels'),
              el('ul', {}, c.groupe.map((g) => { const it = titreDe(g.element_id); return el('li', {}, it ? el('button', { type: 'button', class: 'lien', onclick: () => ouvrirElement(it) }, it.titre) : ''); })))),
          el('time', { title: dateFr(c.cree_le) }, depuis(c.cree_le)));
      }
      return el('li', { class: 'k-' + c.type },
        el('span', { class: 'k-ico' }, ICONES_TYPE[c.type] || '·'),
        el('div', {},
          el('p', { class: 'k-quoi' }, el('b', {}, c.auteur_nom || ''), ` ${TYPES[c.type] || ''} · `,
            item ? el('button', { type: 'button', class: 'lien', onclick: () => ouvrirElement(item) }, item.titre) : ''),
          c.texte && c.type !== 'approbation' ? el('p', { class: 'k-texte' }, c.texte) : null,
          c.audio ? el('button', { type: 'button', class: 'lien c-ecouter', onclick: (e) => ecouter(e.currentTarget, c.id) }, '▶ Écouter') : null),
        el('time', { title: dateFr(c.cree_le) }, depuis(c.cree_le)));
    })) : el('p', { class: 'k-vide' }, 'Rien pour le moment. Les réponses de Gabrielle apparaîtront ici.'));

  return el('div', { class: 'console' },
    el('section', { class: 'k-tete' },
      el('p', { class: 'surtitre' }, 'Console'),
      el('h1', {}, 'Où en est ', el('i', {}, 'Gabrielle')),
      el('div', { class: 'k-tete-actions' },
        el('button', { type: 'button', class: 'bouton secondaire', onclick: () => aller('accueil') }, 'Voir comme Gabrielle'),
        el('button', { type: 'button', class: 'lien', onclick: () => { charger(); } }, 'Actualiser'))),
    tuiles, el('div', { class: 'k-grille' }, el('div', {}, blocTraiter, blocQuestions), el('div', {}, progression, blocActivite)));
}

// Regroupe les approbations qui se suivent (même personne) en une seule ligne
function regrouper(liste) {
  const out = [];
  for (const c of liste) {
    const der = out[out.length - 1];
    if (der && c.type === 'approbation' && der.type === 'approbation' && der.auteur_nom === c.auteur_nom) { der.n += 1; der.groupe.push(c); }
    else out.push({ ...c, n: 1, groupe: [c] });
  }
  return out;
}

function ouvrirElement(item) {
  aller(item.section_id);
  setTimeout(() => document.getElementById('e-' + item.cle)?.scrollIntoView({ block: 'center' }), 60);
}

function carteTraiter(item, question = false) {
  const coms = etat.commentaires.filter((c) => c.element_id === item.id && c.auteur_nom !== etat.membre.nom && c.type !== 'approbation');
  const section = etat.sections.find((s) => s.id === item.section_id);
  const cle = 'k-' + item.id;
  const ouvert = etat.ouverts.has(cle) ? etat.mode[cle] : null;
  const art = el('article', { class: 'k-carte' + (question ? ' question' : '') },
    el('p', { class: 'sous' }, `${section?.titre || ''} · ${item.groupe || ''} · v${item.version || 1}`),
    el('h3', {}, el('button', { type: 'button', class: 'lien k-titre', onclick: () => ouvrirElement(item) }, item.titre)),
    el('ol', { class: 'k-demandes' }, coms.slice(-3).map((c) => el('li', {},
      el('p', { class: 'k-texte' }, c.texte || ''),
      c.audio ? el('button', { type: 'button', class: 'lien c-ecouter', onclick: (e) => ecouter(e.currentTarget, c.id) }, '▶ Écouter') : null,
      el('time', {}, depuis(c.cree_le))))));
  const zone = el('div', { class: 'actions' });
  if (ouvert === 'reponse') {
    zone.append(formulaire(item, 'reponse', { apres: () => { etat.ouverts.delete(cle); rendre(); }, annuler: () => { etat.ouverts.delete(cle); rendre(); } }));
  } else if (ouvert === 'renvoi') {
    const ta = el('textarea', { rows: '2', maxlength: '4000', placeholder: 'Ce qui a changé (facultatif) — Gabrielle le verra' });
    zone.append(el('form', { class: 'saisie', onsubmit: async (e) => {
      e.preventDefault(); e.submitter && (e.submitter.disabled = true);
      if (await renvoyer(item.id, ta.value.trim())) { etat.ouverts.delete(cle); rendre(); }
    } }, el('label', {}, 'Renvoyer en validation'), ta,
    el('div', { class: 'saisie-actions' }, el('button', { type: 'submit', class: 'bouton' }, 'Renvoyer à Gabrielle'),
      el('button', { type: 'button', class: 'lien', onclick: () => { etat.ouverts.delete(cle); rendre(); } }, 'Annuler'))));
  } else {
    if (!question) zone.append(el('button', { type: 'button', class: 'bouton', onclick: () => { etat.ouverts.add(cle); etat.mode[cle] = 'renvoi'; rendre(); } }, '✓ Corrigé, renvoyer'));
    zone.append(el('button', { type: 'button', class: question ? 'bouton' : 'bouton secondaire', onclick: () => { etat.ouverts.add(cle); etat.mode[cle] = 'reponse'; rendre(); } }, 'Répondre'));
  }
  art.append(zone);
  return art;
}

// ---------- Ressources ----------
function vueRessources() {
  const r = RESSOURCES.find((x) => x.id === etat.ressource) || RESSOURCES[0];
  return el('div', { class: 'ressources' },
    el('section', { class: 'intro' },
      el('p', { class: 'surtitre' }, 'Ressources'),
      el('h1', {}, r.titre),
      el('p', { class: 'chapo' }, r.sous_titre)),
    el('div', { class: 'sous-onglets', role: 'tablist' }, RESSOURCES.map((x) => el('button', {
      type: 'button', role: 'tab', 'aria-selected': String(x.id === r.id), class: x.id === r.id ? 'actif' : '',
      onclick: () => { etat.ressource = x.id; ecrireStockage('ressource', x.id); rendre(); },
    }, x.titre))),
    el('article', { class: 'ressource', html: r.html }),
    el('p', { class: 'lot-note' }, `Dernière mise à jour : ${RESSOURCES_MAJ}`));
}

// ---------- Outils ----------
const outilsMontes = new Map(); // garde les valeurs saisies d'un rendu à l'autre
function vueOutils() {
  const o = OUTILS.find((x) => x.id === etat.outil);
  const choisir = (id) => { etat.outil = id; ecrireStockage('outil', id || ''); rendre(); window.scrollTo({ top: 0 }); };
  if (!o) {
    return el('div', { class: 'outils' },
      el('section', { class: 'intro' },
        el('p', { class: 'surtitre' }, 'Outils'),
        el('h1', {}, 'Vos outils de ', el('i', {}, 'tous les jours')),
        el('p', { class: 'chapo' }, 'Des calculs rapides à faire avec un client, au bureau ou en visite. D\'autres outils s\'ajouteront au fil du temps.')),
      el('div', { class: 'o-grille' }, OUTILS.map((x) => el('button', { type: 'button', class: 'o-carte', onclick: () => choisir(x.id) },
        el('img', { src: x.picto, alt: '', width: 44, height: 44 }),
        el('b', {}, x.titre), el('span', {}, x.sous)))),
      el('p', { class: 'lot-note' }, `Barèmes à jour au ${OUTILS_MAJ}`));
  }
  if (!outilsMontes.has(o.id)) outilsMontes.set(o.id, o.monter(el));
  return el('div', { class: 'outils' },
    el('button', { type: 'button', class: 'lien o-retour', onclick: () => choisir(null) }, '← Tous les outils'),
    el('section', { class: 'intro' },
      el('p', { class: 'surtitre' }, 'Outils'),
      el('h1', {}, o.titre),
      el('p', { class: 'chapo' }, o.sous)),
    outilsMontes.get(o.id));
}

// ---------- Vue par section (la liste complète) ----------
function vueSection() {
  const section = etat.sections.find((s) => s.id === etat.vue);
  let liste = etat.elements.filter((x) => x.section_id === etat.vue);
  const groupesSection = [...new Set(liste.map((x) => x.groupe))];
  const r = aValider(liste);

  const tete = el('section', { class: 'intro' },
    el('p', { class: 'surtitre' }, 'Tout voir'),
    el('h1', {}, section?.titre || ''),
    el('p', { class: 'chapo' }, section?.description || ''),
    r.length ? el('button', { type: 'button', class: 'bouton', onclick: () => ouvrirFocus(r, section.titre) }, `Valider les ${r.length} restants, un à la fois`) : null);

  const filtres = el('div', { class: 'filtres' },
    [['tous', 'Tout'], ['a_valider', 'À valider'], ['modifications', 'À modifier'], ['approuve', 'Approuvés']].map(([v, t]) =>
      el('button', { type: 'button', class: 'puce' + (etat.filtre === v ? ' actif' : ''), onclick: () => { etat.filtre = v; rendre(); } }, t)),
    etat.vue === 'idees' ? el('span', { class: 'sep' }) : null,
    etat.vue === 'idees' ? [['toutes', 'Toutes les étapes'], ...groupesSection.map((g) => [g, ETAPES[g] || g])].map(([v, t]) =>
      el('button', { type: 'button', class: 'puce' + (etat.etape === v ? ' actif' : ''), onclick: () => { etat.etape = v; rendre(); } }, t)) : null);

  if (etat.filtre !== 'tous') liste = liste.filter((x) => x.statut === etat.filtre);
  if (etat.vue === 'idees' && etat.etape !== 'toutes') liste = liste.filter((x) => x.groupe === etat.etape);

  const corps = el('div', { class: 'liste' });
  if (!liste.length) corps.append(el('p', { class: 'vide' }, 'Rien ici pour le moment.'));
  let groupe = null;
  for (const item of liste) {
    if (item.groupe !== groupe) {
      groupe = item.groupe;
      corps.append(el('h2', { class: 'groupe' }, groupe, etat.vue === 'idees' ? el('small', {}, ETAPES[groupe] || '') : null));
    }
    corps.append(carte(item));
  }
  return el('div', {}, tete, filtres, corps);
}

function fil(coms) {
  if (!coms.length) return null;
  return el('ol', { class: 'fil' }, coms.map((c) => el('li', { class: 'c-' + c.type },
    el('p', { class: 'c-tete' }, el('b', {}, c.auteur_nom || 'Équipe'), ' ', TYPES[c.type] || '', el('time', {}, ' · ' + dateFr(c.cree_le))),
    c.texte ? el('p', { class: 'c-texte' }, c.texte) : null,
    c.audio ? el('button', { type: 'button', class: 'lien c-ecouter', onclick: (e) => ecouter(e.currentTarget, c.id) }, '▶ Écouter') : null)));
}

function carte(item) {
  const st = STATUTS[item.statut] || STATUTS.a_valider;
  const meta = item.meta || {};
  const coms = etat.commentaires.filter((c) => c.element_id === item.id);
  const art = el('article', { class: `carte ${st.cls}`, id: 'e-' + item.cle });

  art.append(el('div', { class: 'carte-tete' },
    el('div', {},
      item.sous_titre ? el('p', { class: 'sous' }, item.sous_titre) : null,
      el('h3', {}, item.titre),
      etiquettes(meta)),
    el('span', { class: 'statut' }, st.txt)));

  if (item.section_id === 'styles' && (item.medias?.length || item.groupe === 'Les stories')) art.append(apercu(item));
  else if (item.medias?.length) art.append(medias(item.medias, meta.galerie));
  if (item.corps) art.append(el('div', { class: 'corps', html: item.corps }));
  if (meta.champs) art.append(champs(meta.champs));
  if (meta.legende && !(item.section_id === 'styles' && item.medias?.length)) {
    art.append(el('details', { class: 'legende' },
      el('summary', {}, meta.exemple ? `Exemple : ${meta.exemple} — voir la légende` : 'Voir la légende'),
      el('pre', {}, meta.legende)));
  }
  if (meta.contexte) art.append(el('p', { class: 'contexte' }, meta.contexte));
  const f = fil(coms); if (f) art.append(f);

  // actions
  const zone = el('div', { class: 'actions' });
  const ouvert = etat.ouverts.has(item.id);
  const admin = etat.membre.role === 'admin';
  if (!ouvert) {
    if (item.statut !== 'approuve') zone.append(el('button', { type: 'button', class: 'bouton', onclick: async (e) => { e.target.disabled = true; await decider(item.id, 'approbation'); } }, '✓ J\'approuve'));
    zone.append(el('button', { type: 'button', class: 'bouton secondaire', onclick: () => { etat.ouverts.add(item.id); etat.mode[item.id] = 'modifications'; rendre(); } }, item.statut === 'approuve' ? 'Changer d\'avis' : 'Demander une modification'));
    zone.append(el('button', { type: 'button', class: 'lien', onclick: () => { etat.ouverts.add(item.id); etat.mode[item.id] = admin ? 'reponse' : 'commentaire'; rendre(); } }, admin ? 'Répondre' : 'Commenter'));
  } else {
    const mode = etat.mode[item.id] || 'commentaire';
    zone.append(formulaire(item, mode, {
      apres: () => { etat.ouverts.delete(item.id); rendre(); },
      annuler: () => { etat.ouverts.delete(item.id); rendre(); },
    }));
  }
  art.append(zone);
  return art;
}

function etiquettes(meta) {
  return (meta.tags || []).length ? el('div', { class: 'tags' }, meta.tags.map((t) => el('span', { class: 'tag' + (/vérifier|confirmer|valider|OACIQ/i.test(t) ? ' tag-alerte' : '') }, t))) : null;
}
function champs(liste) {
  return el('dl', { class: 'champs' }, liste.flatMap(([k, v]) => [el('dt', {}, k),
    el('dd', {}, /^https?:\/\//.test(v) ? el('a', { href: v, target: '_blank', rel: 'noopener' }, new URL(v).hostname.replace('www.', '')) : v)]));
}

function medias(liste, galerie) {
  const wrap = el('div', { class: 'medias' + (galerie || liste.length > 2 ? ' galerie' : '') });
  for (const m of liste) {
    if (m.type === 'video') {
      wrap.append(el('figure', { class: 'm-video' },
        el('video', { src: m.src, poster: m.poster || null, controls: true, playsinline: true, preload: 'none' }),
        m.legende ? el('figcaption', {}, m.legende) : null));
    } else {
      wrap.append(el('figure', { class: 'm-image' },
        el('img', { src: m.src, alt: m.legende || '', loading: 'lazy' }),
        m.legende ? el('figcaption', {}, m.legende) : null));
    }
  }
  return wrap;
}

// ---------- Aperçu « comme sur Instagram » ----------
function apercu(item) {
  const meta = item.meta || {};
  const ms = item.medias || [];
  if (item.groupe === 'Les stories' || ms.some((m) => /story/i.test(m.src))) return cadreStory(item);
  const cadre = el('div', { class: 'ig', 'data-noswipe': '' });
  cadre.append(el('div', { class: 'ig-tete' },
    el('span', { class: 'ig-avatar' }, svg(ICO.maison)),
    el('span', { class: 'ig-nom' }, el('b', {}, 'enmodeimmobilier'), el('small', {}, 'Québec · Lévis')),
    el('span', { class: 'ig-points', 'aria-hidden': 'true' }, '•••')));

  const video = ms.find((m) => m.type === 'video');
  if (video) {
    const v = el('video', { src: video.src, poster: video.poster || null, muted: true, loop: true, playsinline: true, autoplay: true, preload: 'metadata', class: 'ig-reel' });
    v.muted = true;
    const btn = el('button', { type: 'button', class: 'ig-son', 'aria-label': 'Activer le son' }, svg(ICO.muet));
    btn.addEventListener('click', () => {
      v.muted = !v.muted;
      btn.replaceChildren(svg(v.muted ? ICO.muet : ICO.son));
      btn.setAttribute('aria-label', v.muted ? 'Activer le son' : 'Couper le son');
      if (v.paused) v.play().catch(() => {});
    });
    v.addEventListener('click', () => { if (v.paused) v.play().catch(() => {}); else v.pause(); });
    cadre.append(el('div', { class: 'ig-media reel' }, v, btn, el('span', { class: 'ig-badge' }, 'Reel')));
  } else if (ms.length > 1) {
    const piste = el('div', { class: 'ig-piste' }, ms.map((m, i) => el('img', { src: m.src, alt: m.legende || `Page ${i + 1}`, loading: i ? 'lazy' : 'eager' })));
    const points = el('div', { class: 'ig-points-car' }, ms.map((_, i) => el('i', { class: i ? '' : 'on' })));
    const compteur = el('span', { class: 'ig-compteur' }, `1/${ms.length}`);
    piste.addEventListener('scroll', () => {
      const i = Math.round(piste.scrollLeft / piste.clientWidth);
      compteur.textContent = `${i + 1}/${ms.length}`;
      [...points.children].forEach((p, j) => p.classList.toggle('on', j === i));
    }, { passive: true });
    cadre.append(el('div', { class: 'ig-media car' }, piste, compteur), points);
  } else if (ms.length === 1) {
    cadre.append(el('div', { class: 'ig-media' }, el('img', { src: ms[0].src, alt: ms[0].legende || '' })));
  }

  cadre.append(el('div', { class: 'ig-actions' }, svg(ICO.coeur), svg(ICO.bulle), svg(ICO.avion), el('span', { class: 'ig-esp' }), svg(ICO.signet)));
  if (meta.legende) {
    const complet = meta.legende;
    const court = complet.split('\n').filter(Boolean)[0] || complet;
    const p = el('p', { class: 'ig-legende' }, el('b', {}, 'enmodeimmobilier'), ' ', court);
    if (complet.length > court.length + 2) {
      const plus = el('button', { type: 'button', class: 'ig-plus' }, '… plus');
      plus.addEventListener('click', () => p.replaceChildren(el('b', {}, 'enmodeimmobilier'), ' ', el('span', { class: 'ig-complet' }, complet)));
      p.append(' ', plus);
    }
    cadre.append(p);
  }
  return el('div', { class: 'apercu' }, cadre, el('p', { class: 'apercu-note' }, 'Aperçu tel qu\'il paraîtra sur Instagram'));
}

function cadreStory(item) {
  const m = (item.medias || [])[0];
  return el('div', { class: 'apercu' },
    el('div', { class: 'story', 'data-noswipe': '' },
      m ? el('img', { src: m.src, alt: '', class: 'story-fond' }) : null,
      el('div', { class: 'story-barres' }, el('i', { class: 'on' }), el('i'), el('i')),
      el('div', { class: 'story-tete' }, el('span', { class: 'ig-avatar petit' }, svg(ICO.maison)), el('b', {}, 'enmodeimmobilier'), el('small', {}, '2 h')),
      el('div', { class: 'story-sticker' }, el('p', {}, item.titre.replace(/^[A-Z] · /, '')))),
    el('p', { class: 'apercu-note' }, 'Aperçu d\'une story (illustration)'));
}

// ---------- Saisie : texte ou voix ----------
const Reco = window.SpeechRecognition || window.webkitSpeechRecognition;
const peutEnregistrer = !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);

function formulaire(item, mode, { apres, annuler, parties }) {
  const etiquette = mode === 'modifications' ? 'Qu\'est-ce qu\'on change?' : (mode === 'reponse' ? 'Votre réponse' : 'Votre question ou commentaire');
  const ta = el('textarea', { rows: '3', maxlength: '4000', placeholder: mode === 'modifications' ? 'Écrivez-le, ou dites-le à voix haute avec le micro.' : 'Votre message…' });
  const etatVoix = { rec: null, flux: null, morceaux: [], blob: null, debut: 0, duree: 0, minuterie: null, reco: null, base: '' };
  const zoneVoix = el('div', { class: 'voix' });
  const envoyer = el('button', { type: 'submit', class: 'bouton' }, 'Envoyer');
  const info = el('p', { class: 'voix-info', role: 'status' });
  const choixPartie = parties?.length ? el('select', { class: 'partie', 'aria-label': 'Sur quelle partie?' },
    el('option', { value: '' }, 'Sur l\'ensemble du document'), parties.map((x) => el('option', { value: x }, x))) : null;

  function afficherVoix() {
    zoneVoix.replaceChildren();
    if (!peutEnregistrer) {
      zoneVoix.append(el('p', { class: 'voix-info' }, 'Astuce : le micro de votre clavier permet aussi de dicter.'));
      return;
    }
    if (etatVoix.rec) {
      zoneVoix.append(el('button', { type: 'button', class: 'micro actif', onclick: arreter, 'aria-label': 'Arrêter l\'enregistrement' }, svg(ICO.stop), el('span', { class: 'voix-temps' }, '0:00')),
        el('span', { class: 'voix-onde', 'aria-hidden': 'true' }, el('i'), el('i'), el('i'), el('i'), el('i')),
        el('span', { class: 'voix-txt' }, 'Je vous écoute… appuyez pour arrêter'));
    } else if (etatVoix.blob) {
      zoneVoix.append(el('audio', { controls: true, src: URL.createObjectURL(etatVoix.blob), class: 'c-audio' }),
        el('button', { type: 'button', class: 'lien', onclick: () => { etatVoix.blob = null; afficherVoix(); } }, 'Effacer la note'));
    } else {
      zoneVoix.append(el('button', { type: 'button', class: 'micro', onclick: commencer }, svg(ICO.micro), el('span', {}, 'Le dire à voix haute')));
    }
  }

  async function commencer() {
    try {
      etatVoix.flux = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      info.textContent = 'Le micro n\'est pas accessible. Vérifiez la permission du navigateur, ou écrivez votre message.';
      return;
    }
    const types = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
    const type = types.find((t) => MediaRecorder.isTypeSupported?.(t));
    etatVoix.morceaux = [];
    etatVoix.rec = new MediaRecorder(etatVoix.flux, type ? { mimeType: type } : undefined);
    etatVoix.rec.ondataavailable = (e) => e.data?.size && etatVoix.morceaux.push(e.data);
    etatVoix.rec.onstop = () => {
      etatVoix.blob = new Blob(etatVoix.morceaux, { type: (etatVoix.rec?.mimeType || type || 'audio/webm').split(';')[0] });
      etatVoix.flux?.getTracks().forEach((t) => t.stop());
      etatVoix.rec = null;
      afficherVoix();
    };
    etatVoix.rec.start(1000);
    etatVoix.debut = Date.now();
    etatVoix.minuterie = setInterval(() => {
      const s = Math.round((Date.now() - etatVoix.debut) / 1000);
      const t = zoneVoix.querySelector('.voix-temps');
      if (t) t.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      if (s >= 170) arreter();
    }, 500);
    // Transcription en direct, quand le navigateur la permet
    if (Reco) {
      try {
        const r = new Reco();
        r.lang = 'fr-CA'; r.interimResults = true; r.continuous = true;
        etatVoix.base = ta.value.trim();
        r.onresult = (e) => {
          let txt = '';
          for (let i = 0; i < e.results.length; i += 1) txt += e.results[i][0].transcript;
          ta.value = [etatVoix.base, txt.trim()].filter(Boolean).join(' ');
        };
        r.onerror = () => {};
        r.start();
        etatVoix.reco = r;
      } catch { etatVoix.reco = null; }
    }
    info.textContent = '';
    afficherVoix();
  }

  function arreter() {
    clearInterval(etatVoix.minuterie);
    etatVoix.duree = Math.round((Date.now() - etatVoix.debut) / 1000);
    try { etatVoix.reco?.stop(); } catch { /* rien */ }
    etatVoix.reco = null;
    if (etatVoix.rec?.state !== 'inactive') etatVoix.rec?.stop();
  }

  const form = el('form', { class: 'saisie', onsubmit: async (e) => {
    e.preventDefault();
    if (etatVoix.rec) { arreter(); await new Promise((ok) => setTimeout(ok, 350)); }
    let t = ta.value.trim();
    if (!t && !etatVoix.blob) { ta.focus(); info.textContent = 'Écrivez ou enregistrez votre message.'; return; }
    if (choixPartie?.value) t = `[Partie : ${choixPartie.value}]` + (t ? ` ${t}` : '');
    envoyer.disabled = true; envoyer.textContent = 'Envoi…';
    let ok;
    if (etatVoix.blob) {
      const r = await envoyerNote(item.id, mode, etatVoix.blob, etatVoix.duree, t);
      ok = r.ok;
      if (!ok && t) ok = await decider(item.id, mode, t + '\n(La note vocale n\'a pas pu être jointe.)', { silencieux: true });
      if (!ok) info.textContent = 'La note vocale n\'a pas pu être envoyée. Écrivez votre message, s\'il vous plaît.';
    } else {
      ok = await decider(item.id, mode, t, { silencieux: true });
    }
    envoyer.disabled = false; envoyer.textContent = 'Envoyer';
    if (ok) apres();
  } },
  el('label', {}, etiquette), choixPartie ? el('div', { class: 'partie-zone' }, el('span', {}, 'Sur quelle partie?'), choixPartie) : null, ta, zoneVoix, info,
  el('div', { class: 'saisie-actions' }, envoyer,
    el('button', { type: 'button', class: 'lien', onclick: () => { arreter(); etatVoix.flux?.getTracks().forEach((t) => t.stop()); annuler(); } }, 'Annuler')));
  afficherVoix();
  setTimeout(() => ta.focus({ preventScroll: true }), 30);
  return form;
}

// ---------- Mode « un élément à la fois » ----------
function ouvrirFocus(liste, nom) {
  etat.focus = { file: liste.map((x) => x.id), i: 0, nom, approuves: 0, modifs: 0, passes: [], fin: false, saisie: null };
  document.body.classList.add('focus-ouvert');
  rendreFocus();
}

function fermerFocus(silence) {
  const f = etat.focus;
  document.getElementById('focus')?.remove();
  document.body.classList.remove('focus-ouvert');
  etat.focus = null;
  document.removeEventListener('keydown', toucheFocus);
  if (!silence && f) rendre();
}

function toucheFocus(e) {
  if (!etat.focus || etat.focus.saisie) return;
  if (e.key === 'Escape') fermerFocus();
}

function elementCourant() {
  const f = etat.focus;
  return f && etat.elements.find((x) => x.id === f.file[f.i]);
}

function suivant() {
  const f = etat.focus;
  f.saisie = null;
  f.i += 1;
  while (f.i < f.file.length) {
    const x = etat.elements.find((y) => y.id === f.file[f.i]);
    if (x && x.statut === 'a_valider') break;
    f.i += 1;
  }
  if (f.i >= f.file.length) terminerFocus();
  else rendreFocus('entree');
}

function terminerFocus() {
  const f = etat.focus;
  f.fin = true;
  sb.rpc('portail_fin_lot', { p_jeton: etat.jeton, p_lot: f.nom, p_approuves: f.approuves, p_modifs: f.modifs, p_passes: f.passes.length }).then(() => {}, () => {});
  rendreFocus();
}

async function approuverCourant() {
  const item = elementCourant();
  if (!item) return;
  const carteEl = document.querySelector('.f-carte');
  carteEl?.classList.add('sortie-droite');
  const ok = await decider(item.id, 'approbation', null, { silencieux: true });
  if (!ok) { carteEl?.classList.remove('sortie-droite'); return; }
  etat.focus.approuves += 1;
  tampon('✓ Approuvé');
  setTimeout(suivant, 260);
}

function passerCourant() {
  const f = etat.focus;
  const id = f.file[f.i];
  if (!f.passes.includes(id)) f.passes.push(id);
  document.querySelector('.f-carte')?.classList.add('sortie-gauche');
  setTimeout(suivant, 220);
}

function tampon(txt) {
  const t = el('div', { class: 'f-tampon', 'aria-hidden': 'true' }, txt);
  document.getElementById('focus')?.append(t);
  setTimeout(() => t.remove(), 700);
}

function rendreFocus(anim) {
  const f = etat.focus;
  let racine = document.getElementById('focus');
  if (!racine) {
    racine = el('div', { id: 'focus', class: 'focus', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Validation, un élément à la fois' });
    document.body.append(racine);
    document.addEventListener('keydown', toucheFocus);
  }
  if (f.fin) return racine.replaceChildren(ecranFin());

  const item = elementCourant();
  if (!item) return terminerFocus();
  const total = f.file.length;
  const section = etat.sections.find((s) => s.id === item.section_id);

  const haut = el('div', { class: 'f-haut' },
    el('button', { type: 'button', class: 'f-fermer', onclick: () => fermerFocus(), 'aria-label': 'Quitter' }, svg(ICO.x)),
    el('div', { class: 'f-lieu' }, el('b', {}, section?.titre || ''), el('span', {}, item.section_id === 'idees' ? (ETAPES[item.groupe] || item.groupe) : item.groupe)),
    el('span', { class: 'f-compte' }, `${f.i + 1} / ${total}`));
  const barre = el('div', { class: 'f-barre' }, el('span', { style: `width:${Math.round((f.i / total) * 100)}%` }));

  const carteF = el('article', { class: 'f-carte' + (anim === 'entree' ? ' entree' : '') }, contenuFocus(item));
  activerGlisser(carteF);

  let bas;
  if (f.saisie) {
    bas = el('div', { class: 'f-feuille' }, formulaire(item, f.saisie, {
      apres: () => { if (f.saisie === 'modifications') f.modifs += 1; tampon(f.saisie === 'modifications' ? '✎ Noté' : '💬 Envoyé'); setTimeout(suivant, 300); },
      annuler: () => { f.saisie = null; rendreFocus(); },
    }));
  } else {
    bas = el('div', { class: 'f-bas' },
      el('div', { class: 'f-principal' },
        el('button', { type: 'button', class: 'bouton secondaire f-modif', onclick: () => { f.saisie = 'modifications'; rendreFocus(); } }, svg(ICO.crayon), 'À modifier'),
        el('button', { type: 'button', class: 'bouton f-ok', onclick: approuverCourant }, svg(ICO.coche), 'J\'approuve')),
      el('div', { class: 'f-second' },
        el('button', { type: 'button', class: 'lien', onclick: () => { f.saisie = 'commentaire'; rendreFocus(); } }, 'Une question?'),
        el('span', { class: 'f-astuce' }, 'Glissez à droite pour approuver'),
        el('button', { type: 'button', class: 'lien', onclick: passerCourant }, 'Passer →')));
  }
  racine.replaceChildren(el('div', { class: 'f-cadre' }, haut, barre, el('div', { class: 'f-scene' }, carteF), bas));
  racine.querySelector('.f-scene').scrollTop = 0;
}

function contenuFocus(item) {
  const meta = item.meta || {};
  const coms = etat.commentaires.filter((c) => c.element_id === item.id);
  const blocs = [];
  if (item.section_id === 'styles' && (item.medias?.length || item.groupe === 'Les stories')) blocs.push(apercu(item));
  else if (item.medias?.length) blocs.push(medias(item.medias, meta.galerie));
  blocs.push(el('div', { class: 'f-texte' + (item.section_id === 'marque' ? ' citation' : '') },
    item.sous_titre ? el('p', { class: 'sous' }, item.sous_titre) : null,
    el('h2', {}, item.titre),
    etiquettes(meta),
    item.corps ? el('div', { class: 'corps', html: item.corps }) : null,
    meta.champs ? champs(meta.champs) : null,
    meta.legende && !(item.section_id === 'styles' && item.medias?.length) ? el('details', { class: 'legende' }, el('summary', {}, 'Voir la légende'), el('pre', {}, meta.legende)) : null,
    meta.contexte ? el('p', { class: 'contexte' }, meta.contexte) : null,
    fil(coms)));
  return blocs;
}

function activerGlisser(carteF) {
  let x0 = null; let y0 = 0; let dx = 0; let actif = false;
  carteF.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.target.closest('[data-noswipe], button, a, video, audio, details, textarea, input')) return;
    x0 = e.clientX; y0 = e.clientY; dx = 0; actif = false;
  });
  carteF.addEventListener('pointermove', (e) => {
    if (x0 == null) return;
    dx = e.clientX - x0;
    const dy = e.clientY - y0;
    if (!actif && Math.abs(dx) > 14 && Math.abs(dx) > Math.abs(dy) * 1.4) { actif = true; carteF.setPointerCapture?.(e.pointerId); }
    if (!actif) return;
    carteF.style.transform = `translateX(${dx}px) rotate(${dx / 30}deg)`;
    carteF.dataset.sens = dx > 40 ? 'droite' : (dx < -40 ? 'gauche' : '');
  });
  const fin = () => {
    if (x0 == null) return;
    const d = dx; x0 = null;
    if (!actif) return;
    carteF.style.transform = ''; carteF.dataset.sens = '';
    if (d > 110) approuverCourant();
    else if (d < -110) passerCourant();
  };
  carteF.addEventListener('pointerup', fin);
  carteF.addEventListener('pointercancel', () => { x0 = null; carteF.style.transform = ''; carteF.dataset.sens = ''; });
}

function ecranFin() {
  const f = etat.focus;
  const reste = aValider();
  const passes = f.passes.map((id) => etat.elements.find((x) => x.id === id)).filter((x) => x && x.statut === 'a_valider');
  return el('div', { class: 'f-cadre f-fin' },
    el('div', { class: 'f-haut' }, el('button', { type: 'button', class: 'f-fermer', onclick: () => fermerFocus(), 'aria-label': 'Fermer' }, svg(ICO.x))),
    el('div', { class: 'fin' },
      el('div', { class: 'fin-sceau' }, svg(ICO.coche)),
      el('h2', {}, passes.length ? 'Beau travail.' : 'C\'est fait.'),
      el('p', { class: 'fin-lot' }, f.nom),
      el('ul', { class: 'fin-chiffres' },
        el('li', {}, el('b', {}, f.approuves), 'approuvés'),
        el('li', {}, el('b', {}, f.modifs), 'à modifier'),
        el('li', {}, el('b', {}, passes.length), 'passés')),
      el('p', { class: 'fin-msg' }, f.modifs ? 'Vos demandes nous sont arrivées. Nous faisons les changements et nous vous les remontrons ici.' : 'Vos réponses nous sont arrivées. Merci!'),
      el('div', { class: 'fin-actions' },
        passes.length ? el('button', { type: 'button', class: 'bouton', onclick: () => ouvrirFocus(passes, 'Les éléments passés') }, `Revoir les ${passes.length} passés`) : null,
        !passes.length && reste.length ? el('button', { type: 'button', class: 'bouton', onclick: () => ouvrirFocus(reste, 'Toute la liste') }, `Continuer · ${reste.length} restants`) : null,
        el('button', { type: 'button', class: passes.length || reste.length ? 'bouton secondaire' : 'bouton', onclick: () => { fermerFocus(); aller('accueil'); } }, 'Retour à l\'accueil'))));
}

// ---------- Mot d'accueil (première visite) ----------
function ouvrirIntro() {
  const reste = docsAValider();
  const fermer = () => { ecrireStockage('intro-v2', '1'); fond.remove(); };
  const fond = el('div', { class: 'modale-fond', onclick: (e) => { if (e.target === fond) fermer(); } },
    el('div', { class: 'modale', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'modale-titre' },
      el('p', { class: 'surtitre' }, 'Bienvenue'),
      el('h2', { id: 'modale-titre' }, 'Votre espace de ', el('i', {}, 'validation')),
      el('p', {}, 'Ici, vous validez vos 7 documents, présentés comme ils seront remis. Une fois approuvés, ils sont à vous.'),
      el('ul', { class: 'gestes' },
        el('li', {}, el('span', { class: 'g-ico' }, svg(ICO.fleche)), el('div', {}, el('b', {}, 'Lisez le document'), el('small', {}, 'à gauche, ou en plein écran'))),
        el('li', {}, el('span', { class: 'g-ico ok' }, svg(ICO.coche)), el('div', {}, el('b', {}, 'J\'approuve tel quel'), el('small', {}, 'et on passe au suivant'))),
        el('li', {}, el('span', { class: 'g-ico modif' }, svg(ICO.micro)), el('div', {}, el('b', {}, 'Demander un changement'), el('small', {}, 'sur une partie précise, par écrit ou à voix haute')))),
      el('div', { class: 'modale-actions' },
        reste.length ? el('button', { type: 'button', class: 'bouton grand', onclick: () => { fermer(); aller('doc:' + reste[0].cle); } }, 'C\'est parti', svg(ICO.fleche)) : null,
        el('button', { type: 'button', class: reste.length ? 'lien' : 'bouton', onclick: fermer }, reste.length ? 'Plus tard' : 'Compris'))));
  document.body.append(fond);
  fond.querySelector('.bouton')?.focus();
}

demarrer();
