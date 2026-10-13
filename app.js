import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
import { CONFIG } from './config.js';

const sb = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });

const app = document.getElementById('app');
const etat = {
  jeton: null, membre: null, sections: [], elements: [], commentaires: [],
  onglet: lireStockage('onglet') || 'marque', filtre: 'tous', etape: 'toutes', ouverts: new Set(),
};

const STATUTS = {
  a_valider: { txt: 'À valider', cls: 's-attente' },
  approuve: { txt: 'Approuvé', cls: 's-ok' },
  modifications: { txt: 'Modifications demandées', cls: 's-modif' },
};
const TYPES = { approbation: 'a approuvé', modifications: 'demande une modification', commentaire: 'a commenté', reponse: 'a répondu' };

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
  etat.jeton = null; lienInvalide();
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
  etat.elements = data.elements || [];
  etat.commentaires = data.commentaires || [];
  document.getElementById('haut-droite').hidden = false;
  document.getElementById('qui').textContent = etat.membre.nom;
  if (!etat.sections.find((x) => x.id === etat.onglet)) etat.onglet = etat.sections[0]?.id;
  rendre();
}

async function decider(id, decision, texte) {
  const { data, error } = await sb.rpc('portail_decider', { p_jeton: etat.jeton, p_element: id, p_decision: decision, p_texte: texte || null });
  if (error || !data) { alerte(error?.message || 'Erreur'); return false; }
  const cible = etat.elements.find((x) => x.id === id);
  if (cible && data.element) Object.assign(cible, data.element);
  etat.commentaires = etat.commentaires.filter((x) => x.element_id !== id).concat(data.commentaires || []);
  rendre();
  return true;
}

function alerte(txt) {
  const a = el('div', { class: 'toast', role: 'alert' }, txt);
  document.body.append(a);
  setTimeout(() => a.remove(), 4000);
}

// ---------- Rendu ----------
function compte(liste) {
  const r = { total: liste.length, a_valider: 0, approuve: 0, modifications: 0 };
  for (const x of liste) r[x.statut] = (r[x.statut] || 0) + 1;
  return r;
}

function rendre() {
  const scrollY = window.scrollY;
  const tous = compte(etat.elements);
  const prenom = (etat.membre.nom || '').split(' ')[0];
  const fait = tous.approuve + tous.modifications;
  const pct = tous.total ? Math.round((fait / tous.total) * 100) : 0;

  const intro = el('section', { class: 'intro' },
    el('p', { class: 'surtitre' }, 'Espace de validation'),
    el('h1', {}, 'Bonjour ', el('i', {}, prenom), '.'),
    el('p', { class: 'chapo' }, 'Voici ce que nous vous proposons. Pour chaque élément : approuvez-le, ou dites-nous quoi changer. Vos commentaires nous arrivent directement.'),
    el('div', { class: 'progression', 'aria-label': `${fait} sur ${tous.total} éléments traités` },
      el('div', { class: 'barre' }, el('span', { style: `width:${pct}%` })),
      el('p', {}, el('b', {}, `${fait} sur ${tous.total}`), ' traités · ',
        el('span', { class: 'p-ok' }, `${tous.approuve} approuvés`), ' · ',
        el('span', { class: 'p-modif' }, `${tous.modifications} à modifier`), ' · ',
        `${tous.a_valider} à valider`)));

  const onglets = el('nav', { class: 'onglets', role: 'tablist' },
    etat.sections.map((s) => {
      const c = compte(etat.elements.filter((x) => x.section_id === s.id));
      return el('button', {
        type: 'button', role: 'tab', 'aria-selected': String(s.id === etat.onglet), class: s.id === etat.onglet ? 'actif' : '',
        onclick: () => { etat.onglet = s.id; etat.etape = 'toutes'; ecrireStockage('onglet', s.id); rendre(); window.scrollTo({ top: document.querySelector('.onglets').offsetTop - 10 }); },
      }, el('span', {}, s.titre), el('small', {}, c.a_valider ? `${c.a_valider} à valider` : 'Tout est traité ✓'));
    }));

  const section = etat.sections.find((s) => s.id === etat.onglet);
  let liste = etat.elements.filter((x) => x.section_id === etat.onglet);
  const groupesSection = [...new Set(liste.map((x) => x.groupe))];

  const filtres = el('div', { class: 'filtres' },
    [['tous', 'Tout'], ['a_valider', 'À valider'], ['modifications', 'À modifier'], ['approuve', 'Approuvés']].map(([v, t]) =>
      el('button', { type: 'button', class: 'puce' + (etat.filtre === v ? ' actif' : ''), onclick: () => { etat.filtre = v; rendre(); } }, t)),
    etat.onglet === 'idees' ? el('span', { class: 'sep' }) : null,
    etat.onglet === 'idees' ? [['toutes', 'Toutes les étapes'], ...groupesSection.map((g) => [g, g])].map(([v, t]) =>
      el('button', { type: 'button', class: 'puce' + (etat.etape === v ? ' actif' : ''), onclick: () => { etat.etape = v; rendre(); } }, t)) : null);

  if (etat.filtre !== 'tous') liste = liste.filter((x) => x.statut === etat.filtre);
  if (etat.onglet === 'idees' && etat.etape !== 'toutes') liste = liste.filter((x) => x.groupe === etat.etape);

  const corps = el('div', { class: 'liste' });
  if (!liste.length) corps.append(el('p', { class: 'vide' }, 'Rien ici pour le moment.'));
  let groupe = null;
  for (const item of liste) {
    if (item.groupe !== groupe) {
      groupe = item.groupe;
      corps.append(el('h2', { class: 'groupe' }, groupe, etat.onglet === 'idees' ? el('small', {}, { TOFU: 'Se faire connaître', MOFU: 'Obtenir le contact', BOFU: 'Donner confiance' }[groupe] || '') : null));
    }
    corps.append(carte(item));
  }

  app.replaceChildren(intro, onglets,
    el('section', { class: 'entete-section' }, el('p', {}, section?.description || '')),
    filtres, corps,
    el('footer', { class: 'pied' }, 'L\'équipe Gabrielle Germain · espace privé de validation'));
  window.scrollTo({ top: scrollY });
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
      (meta.tags || []).length ? el('div', { class: 'tags' }, meta.tags.map((t) => el('span', { class: 'tag' + (/vérifier|confirmer|valider|OACIQ/i.test(t) ? ' tag-alerte' : '') }, t))) : null),
    el('span', { class: 'statut' }, st.txt)));

  if (item.medias?.length) art.append(medias(item.medias, meta.galerie));
  if (item.corps) art.append(el('div', { class: 'corps', html: item.corps }));
  if (meta.champs) {
    art.append(el('dl', { class: 'champs' }, meta.champs.flatMap(([k, v]) => [el('dt', {}, k),
      el('dd', {}, /^https?:\/\//.test(v) ? el('a', { href: v, target: '_blank', rel: 'noopener' }, new URL(v).hostname.replace('www.', '')) : v)])));
  }
  if (meta.exemple || meta.legende) {
    art.append(el('details', { class: 'legende' },
      el('summary', {}, meta.exemple ? `Exemple : ${meta.exemple} — voir la légende` : 'Voir la légende'),
      el('pre', {}, meta.legende || '')));
  }
  if (meta.contexte) art.append(el('p', { class: 'contexte' }, meta.contexte));

  // fil des commentaires
  if (coms.length) {
    art.append(el('ol', { class: 'fil' }, coms.map((c) => el('li', { class: 'c-' + c.type },
      el('p', { class: 'c-tete' }, el('b', {}, c.auteur_nom || c.auteur_email), ' ', TYPES[c.type] || '', el('time', {}, ' · ' + dateFr(c.cree_le))),
      c.texte ? el('p', { class: 'c-texte' }, c.texte) : null))));
  }

  // actions
  const zone = el('div', { class: 'actions' });
  const ouvert = etat.ouverts.has(item.id);
  const admin = etat.membre.role === 'admin';
  if (!ouvert) {
    if (item.statut !== 'approuve') zone.append(el('button', { type: 'button', class: 'bouton', onclick: async (e) => { e.target.disabled = true; await decider(item.id, 'approbation'); } }, '✓ J\'approuve'));
    zone.append(el('button', { type: 'button', class: 'bouton secondaire', onclick: () => { etat.ouverts.add(item.id); etat.mode = { [item.id]: 'modifications' }; rendre(); } }, item.statut === 'approuve' ? 'Changer d\'avis' : 'Demander une modification'));
    zone.append(el('button', { type: 'button', class: 'lien', onclick: () => { etat.ouverts.add(item.id); etat.mode = { [item.id]: admin ? 'reponse' : 'commentaire' }; rendre(); } }, admin ? 'Répondre' : 'Commenter'));
  } else {
    const mode = etat.mode?.[item.id] || 'commentaire';
    const ta = el('textarea', { rows: '3', maxlength: '4000', placeholder: mode === 'modifications' ? 'Qu\'est-ce qu\'on change? Ex. « Plutôt : … »' : 'Votre commentaire…' });
    zone.append(el('form', { class: 'saisie', onsubmit: async (e) => {
      e.preventDefault();
      const t = ta.value.trim();
      if (!t) { ta.focus(); return; }
      e.submitter && (e.submitter.disabled = true);
      if (await decider(item.id, mode, t)) etat.ouverts.delete(item.id), rendre();
    } },
    el('label', {}, mode === 'modifications' ? 'Votre demande de modification' : (mode === 'reponse' ? 'Votre réponse' : 'Votre commentaire')),
    ta,
    el('div', { class: 'saisie-actions' },
      el('button', { type: 'submit', class: 'bouton' }, 'Envoyer'),
      el('button', { type: 'button', class: 'lien', onclick: () => { etat.ouverts.delete(item.id); rendre(); } }, 'Annuler'))));
    setTimeout(() => ta.focus({ preventScroll: true }), 0);
  }
  art.append(zone);
  return art;
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

demarrer();
