// Onglet Outils : petites calculatrices pour le travail de tous les jours de Gabrielle.
// Pour ajouter un outil : ajouter un objet à OUTILS ({ id, titre, sous, picto, maj, monter(el) }).
// monter(el) reçoit l'aide `el` du portail et renvoie l'élément à afficher.
// Les barèmes ci-dessous sont à revoir chaque 1er janvier (indexation des tranches).

export const OUTILS_MAJ = '17 octobre 2026';

// ---------- Calculs (purs, testables) ----------

// Droits de mutation 2026. Sources : ville.quebec.qc.ca et levis.ca (consultées le 17 octobre 2026).
export const BAREMES_MUTATION = {
  quebec: { nom: 'Ville de Québec', tranches: [[62900, 0.005], [315000, 0.01], [500000, 0.015], [750000, 0.025], [Infinity, 0.03]] },
  levis: { nom: 'Lévis', tranches: [[62900, 0.005], [315000, 0.01], [500000, 0.015], [Infinity, 0.03]] },
  base: { nom: 'Autre municipalité (barème de base)', tranches: [[62900, 0.005], [315000, 0.01], [Infinity, 0.015]] },
};

export function droitsMutation(base, cle) {
  const detail = [];
  let bas = 0, total = 0;
  for (const [haut, taux] of BAREMES_MUTATION[cle].tranches) {
    if (base <= bas) break;
    const portion = Math.min(base, haut) - bas;
    const montant = portion * taux;
    detail.push({ de: bas, a: Math.min(base, haut), taux, montant });
    total += montant;
    bas = haut;
  }
  return { total, detail };
}

// Mise de fonds minimale (règles fédérales depuis le 15 décembre 2024) :
// 5 % des premiers 500 000 $, 10 % de la portion entre 500 000 $ et 1 500 000 $, 20 % à partir de 1 500 000 $.
export function miseDeFondsMin(prix) {
  if (prix >= 1500000) return prix * 0.2;
  if (prix <= 500000) return prix * 0.05;
  return 25000 + (prix - 500000) * 0.1;
}

// Prime d'assurance prêt (SCHL, propriétaire-occupant), selon le ratio prêt-valeur.
export function tauxPrime(ratio) {
  ratio -= 1e-9; // arrondis
  if (ratio <= 0.8) return 0;
  if (ratio <= 0.85) return 0.028;
  if (ratio <= 0.9) return 0.031;
  if (ratio <= 0.95) return 0.04;
  return null; // mise de fonds insuffisante
}
export const TVQ_PRIME = 0.09; // taxe du Québec sur la prime, payée chez le notaire (pas ajoutée au prêt)

// Paiement d'un prêt à taux fixe canadien (intérêt composé semestriellement).
export function paiementMensuel(pret, tauxAnnuel, ans) {
  const n = ans * 12;
  if (!pret || !n) return 0;
  if (!tauxAnnuel) return pret / n;
  const r = Math.pow(1 + tauxAnnuel / 2, 1 / 6) - 1;
  return pret * r / (1 - Math.pow(1 + r, -n));
}

// Solde restant après m mois.
export function soldeApres(pret, tauxAnnuel, ans, m) {
  const p = paiementMensuel(pret, tauxAnnuel, ans);
  const r = Math.pow(1 + tauxAnnuel / 2, 1 / 6) - 1;
  if (!tauxAnnuel) return Math.max(0, pret - p * m);
  return pret * Math.pow(1 + r, m) - p * (Math.pow(1 + r, m) - 1) / r;
}

export const TPS = 0.05, TVQ = 0.09975;

// ---------- Affichage ----------
const nf = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const $ = (x) => nf.format(Math.round(x || 0));
const $c = (x) => nf2.format(x || 0);
const pct = (x, d = 2) => (x * 100).toLocaleString('fr-CA', { minimumFractionDigits: 0, maximumFractionDigits: d }) + ' %';
const nombre = (v) => { const x = parseFloat(String(v).replace(/\s| |\$/g, '').replace(',', '.')); return Number.isFinite(x) ? x : 0; };

// Un champ « montant » : on tape 450000 ou 450 000, il se reformate à la sortie.
function champ(el, { libelle, valeur, suffixe = '$', aide, pas, onchange }) {
  const input = el('input', { type: 'text', inputmode: 'decimal', value: valeur, 'aria-label': libelle });
  const fmt = () => { if (suffixe === '$' && input.value.trim()) input.value = Math.round(nombre(input.value)).toLocaleString('fr-CA'); };
  fmt();
  input.addEventListener('input', onchange);
  input.addEventListener('blur', () => { fmt(); onchange(); });
  input.lire = () => nombre(input.value);
  const bloc = el('label', { class: 'o-champ' },
    el('span', { class: 'o-lib' }, libelle),
    el('span', { class: 'o-saisie' }, input, el('span', { class: 'o-suf' }, suffixe)),
    aide ? el('small', {}, aide) : null);
  bloc.input = input;
  return bloc;
}
function choix(el, { libelle, options, valeur, onchange }) {
  const s = el('select', { 'aria-label': libelle, onchange }, options.map(([v, t]) => el('option', { value: v, selected: v === valeur }, t)));
  const bloc = el('label', { class: 'o-champ' }, el('span', { class: 'o-lib' }, libelle), el('span', { class: 'o-saisie' }, s));
  bloc.input = s;
  return bloc;
}
const ligne = (el, t, v, cls) => el('div', { class: 'o-ligne' + (cls ? ' ' + cls : '') }, el('span', {}, t), el('b', {}, v));
function gabarit(el, champs, resultat, note) {
  return el('div', { class: 'o-outil' },
    el('div', { class: 'o-form' }, champs),
    el('div', { class: 'o-res', 'aria-live': 'polite' }, resultat),
    note ? el('p', { class: 'o-note' }, note) : null);
}

// ---------- Les outils ----------
export const OUTILS = [
  {
    id: 'paiement',
    titre: 'Paiement hypothécaire',
    sous: 'Le paiement selon le prix, la mise de fonds, le taux et la fréquence.',
    picto: 'marque/maison-toffee-fonce.png',
    monter(el) {
      const res = el('div');
      const maj = () => {
        const prix = f.prix.input.lire(), mise = f.mise.input.lire(), taux = f.taux.input.lire() / 100, ans = +f.ans.input.value;
        const base = Math.max(0, prix - mise), ratio = prix ? base / prix : 0;
        const tp = tauxPrime(ratio);
        const min = miseDeFondsMin(prix);
        res.replaceChildren();
        if (!prix) { res.append(el('p', { class: 'o-vide' }, 'Entrez un prix pour voir le paiement.')); return; }
        if (mise < min - 0.5 || tp === null) {
          res.append(el('p', { class: 'o-alerte' }, `Mise de fonds insuffisante : il faut au moins ${$(min)} pour ce prix.`));
          return;
        }
        if (prix >= 1500000 && ratio > 0.8) { res.append(el('p', { class: 'o-alerte' }, 'À 1 500 000 $ et plus, il faut 20 % de mise de fonds.')); return; }
        const surprime = tp && ans > 25 ? 0.002 : 0;
        const prime = base * (tp + (tp ? surprime : 0));
        const pret = base + prime;
        const m = paiementMensuel(pret, taux, ans);
        const freq = f.freq.input.value;
        const paie = { mensuel: [m, 'par mois'], deux: [m * 12 / 26, 'aux 2 semaines'], deuxacc: [m / 2, 'aux 2 semaines (accéléré)'], hebdo: [m * 12 / 52, 'par semaine'], hebdoacc: [m / 4, 'par semaine (accéléré)'] }[freq];
        const solde5 = soldeApres(pret, taux, ans, 60);
        const interets5 = m * 60 - (pret - solde5);
        res.append(
          el('div', { class: 'o-gros' }, el('span', {}, $c(paie[0])), el('small', {}, paie[1])),
          ligne(el, 'Mise de fonds', `${$(mise)} (${pct(prix ? mise / prix : 0, 1)})`),
          prime ? ligne(el, `Prime SCHL ajoutée au prêt (${pct(tp + surprime)})`, $(prime)) : null,
          prime ? ligne(el, 'Taxe sur la prime, payée chez le notaire (9 %)', $(prime * TVQ_PRIME)) : null,
          ligne(el, 'Montant du prêt', $(pret), 'fort'),
          ligne(el, 'Intérêts payés les 5 premières années', $(interets5)),
          ligne(el, 'Solde après 5 ans', $(solde5)));
      };
      const f = {
        prix: champ(el, { libelle: 'Prix d\'achat', valeur: '450000', onchange: () => maj() }),
        mise: champ(el, { libelle: 'Mise de fonds', valeur: '45000', onchange: () => maj() }),
        taux: champ(el, { libelle: 'Taux d\'intérêt', valeur: '4,5', suffixe: '%', onchange: () => maj() }),
        ans: choix(el, { libelle: 'Amortissement', valeur: '25', options: [['20', '20 ans'], ['25', '25 ans'], ['30', '30 ans']], onchange: () => maj() }),
        freq: choix(el, { libelle: 'Fréquence', valeur: 'mensuel', options: [['mensuel', 'Mensuel'], ['deux', 'Aux 2 semaines'], ['deuxacc', 'Aux 2 semaines accéléré'], ['hebdo', 'Hebdomadaire'], ['hebdoacc', 'Hebdomadaire accéléré']], onchange: () => maj() }),
      };
      const out = gabarit(el, Object.values(f), res, 'Taux fixe, intérêt composé deux fois par année (méthode des prêteurs canadiens). Avec moins de 20 % de mise de fonds, la prime SCHL est ajoutée au prêt (+0,20 % au-delà de 25 ans; 30 ans permis seulement pour un premier achat ou une construction neuve). Estimation : le prêteur confirme.');
      maj();
      return out;
    },
  },
  {
    id: 'mise',
    titre: 'Mise de fonds et SCHL',
    sous: 'La mise de fonds minimale et la prime d\'assurance prêt selon le prix.',
    picto: 'marque/fleche-sauge-fonce.png',
    monter(el) {
      const res = el('div');
      const maj = () => {
        const prix = f.prix.input.lire();
        res.replaceChildren();
        if (!prix) { res.append(el('p', { class: 'o-vide' }, 'Entrez un prix.')); return; }
        const min = miseDeFondsMin(prix);
        res.append(el('div', { class: 'o-gros' }, el('span', {}, $(min)), el('small', {}, `mise de fonds minimale (${pct(min / prix, 1)})`)));
        const mises = [...new Set([min, prix * 0.1, prix * 0.15, prix * 0.2].map(Math.round))].filter((m) => m >= Math.round(min)).sort((a, b) => a - b);
        const tbl = el('table', { class: 'o-table' },
          el('tr', {}, el('th', {}, 'Mise de fonds'), el('th', {}, 'Prime SCHL'), el('th', {}, 'Taxe 9 % (notaire)'), el('th', {}, 'Prêt total')));
        for (const mise of mises) {
          const base = prix - mise, tp = prix >= 1500000 && mise < prix * 0.2 ? null : tauxPrime(base / prix);
          if (tp === null) continue;
          const prime = base * tp;
          tbl.append(el('tr', {}, el('td', {}, `${$(mise)} · ${pct(mise / prix, 1)}`), el('td', {}, tp ? `${$(prime)} (${pct(tp)})` : 'Aucune'), el('td', {}, tp ? $(prime * TVQ_PRIME) : '—'), el('td', {}, $(base + prime))));
        }
        res.append(el('div', { class: 'r-table' }, tbl));
      };
      const f = { prix: champ(el, { libelle: 'Prix d\'achat', valeur: '650000', onchange: () => maj() }) };
      const out = gabarit(el, Object.values(f), res, 'Règles en vigueur depuis le 15 décembre 2024 : 5 % des premiers 500 000 $, 10 % de la portion entre 500 000 $ et 1 500 000 $, 20 % à 1 500 000 $ et plus (pas d\'assurance SCHL). Primes SCHL pour propriétaire-occupant, amortissement de 25 ans ou moins.');
      maj();
      return out;
    },
  },
  {
    id: 'mutation',
    titre: 'Taxe de bienvenue',
    sous: 'Les droits de mutation 2026 à Québec, à Lévis ou ailleurs.',
    picto: 'marque/maison-sauge-fonce.png',
    monter(el) {
      const res = el('div');
      const maj = () => {
        const base = Math.max(f.prix.input.lire(), f.eval.input.lire());
        const cle = f.ville.input.value;
        res.replaceChildren();
        if (!base) { res.append(el('p', { class: 'o-vide' }, 'Entrez un prix.')); return; }
        const { total, detail } = droitsMutation(base, cle);
        res.append(el('div', { class: 'o-gros' }, el('span', {}, $c(total)), el('small', {}, `à payer, ${BAREMES_MUTATION[cle].nom}`)));
        res.append(ligne(el, 'Base d\'imposition', $(base), 'fort'));
        for (const d of detail) res.append(ligne(el, `${pct(d.taux, 1)} de ${$(d.de)} à ${$(d.a)}`, $c(d.montant)));
      };
      const f = {
        ville: choix(el, { libelle: 'Municipalité', valeur: 'quebec', options: Object.entries(BAREMES_MUTATION).map(([k, v]) => [k, v.nom]), onchange: () => maj() }),
        prix: champ(el, { libelle: 'Prix d\'achat', valeur: '450000', onchange: () => maj() }),
        eval: champ(el, { libelle: 'Valeur uniformisée (facultatif)', valeur: '', aide: 'Évaluation municipale × facteur comparatif. Le plus élevé des deux sert de base.', onchange: () => maj() }),
      };
      const out = gabarit(el, Object.values(f), res, 'Tranches 2026 publiées par la Ville de Québec et la Ville de Lévis. « Autre municipalité » : barème de base seulement; plusieurs villes ajoutent un taux au-delà de 500 000 $, à vérifier. Certains acheteurs peuvent être exemptés (ex. transfert entre conjoints).');
      maj();
      return out;
    },
  },
  {
    id: 'net',
    titre: 'Net au vendeur',
    sous: 'Ce qu\'il reste au vendeur après la commission, les taxes et l\'hypothèque.',
    picto: 'marque/maison-pastel-rose-fonce.png',
    monter(el) {
      const res = el('div');
      const maj = () => {
        const prix = f.prix.input.lire();
        const comm = prix * f.comm.input.lire() / 100;
        const tps = comm * TPS, tvq = comm * TVQ;
        const solde = f.solde.input.lire(), penal = f.penal.input.lire(), frais = f.frais.input.lire();
        const net = prix - comm - tps - tvq - solde - penal - frais;
        res.replaceChildren(...[
          el('div', { class: 'o-gros' + (net < 0 ? ' neg' : '') }, el('span', {}, $(net)), el('small', {}, 'net estimé au vendeur')),
          ligne(el, 'Prix de vente', $(prix), 'fort'),
          ligne(el, `Rétribution (${pct(f.comm.input.lire() / 100)})`, '− ' + $c(comm)),
          ligne(el, 'TPS 5 %', '− ' + $c(tps)),
          ligne(el, 'TVQ 9,975 %', '− ' + $c(tvq)),
          solde ? ligne(el, 'Solde hypothécaire', '− ' + $(solde)) : null,
          penal ? ligne(el, 'Pénalité de remboursement', '− ' + $(penal)) : null,
          frais ? ligne(el, 'Autres frais', '− ' + $(frais)) : null].filter(Boolean));
      };
      const f = {
        prix: champ(el, { libelle: 'Prix de vente', valeur: '500000', onchange: () => maj() }),
        comm: champ(el, { libelle: 'Rétribution', valeur: '5', suffixe: '%', aide: 'Selon le contrat de courtage.', onchange: () => maj() }),
        solde: champ(el, { libelle: 'Solde hypothécaire', valeur: '0', onchange: () => maj() }),
        penal: champ(el, { libelle: 'Pénalité de remboursement', valeur: '0', aide: 'Demander le montant exact au prêteur.', onchange: () => maj() }),
        frais: champ(el, { libelle: 'Autres frais', valeur: '0', aide: 'Quittance chez le notaire, certificat de localisation, déménagement…', onchange: () => maj() }),
      };
      const out = gabarit(el, Object.values(f), res, 'Estimation à titre indicatif. La TPS et la TVQ s\'appliquent à la rétribution. Les ajustements (taxes municipales et scolaires, etc.) se font chez le notaire.');
      maj();
      return out;
    },
  },
];
