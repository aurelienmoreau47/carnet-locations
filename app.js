/* Appartements Valence
 * Application de gestion des réservations des trois appartements.
 * JavaScript sans dépendance de build : se sert tel quel par GitHub Pages.
 * Données : Supabase (en ligne) ou navigateur (mode démo, si config.js est vide).
 */
(function () {
  'use strict';

  /* ================================================================
   * Constantes
   * ================================================================ */

  const CFG = window.CARNET_CONFIG || {};
  const CLOUD = Boolean(CFG.supabaseUrl && CFG.supabaseKey);

  const NOM = 'Appartements Valence';
  const APTS = [1, 2, 3];
  const CANAUX = { airbnb: 'Airbnb', leboncoin: 'Le Bon Coin', contact: 'Contact direct' };
  const CANAL_COURT = { airbnb: 'Airbnb', leboncoin: 'Bon Coin', contact: 'Contact' };
  const PAIEMENTS = { airbnb: 'Airbnb', virement: 'Virement', especes: 'Espèces', cheque: 'Chèque', leboncoin: 'Le Bon Coin' };
  // Ordre d'affichage dans le formulaire : du plus utilisé au moins utilisé (historique 2021-2026)
  const PAY_ORDRE = ['especes', 'airbnb', 'virement', 'cheque', 'leboncoin'];
  const DRAPS_PAY = ['especes', 'virement', 'cheque'];
  const PAY_VAR = { virement: '--pay-virement', especes: '--pay-especes', cheque: '--pay-cheque', airbnb: '--pay-airbnb', leboncoin: '--pay-leboncoin' };
  const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const MOIS_COURT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const JOURS_COURT = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
  const JOUR_LETTRE = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  const NAV = [
    { r: 'accueil', t: 'Accueil', i: 'home' },
    { r: 'calendrier', t: 'Calendrier', i: 'cal' },
    { r: 'reservations', t: 'Réservations', i: 'list' },
    { r: 'recap', t: 'Récap', i: 'chart' },
    { r: 'reglages', t: 'Réglages', i: 'sliders' }
  ];

  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    list: '<path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    chart: '<path d="M5 20V11M12 20V5M19 20v-6M3 20h18"/>',
    sliders: '<path d="M4 6h9M19 6h1M4 12h3M13 12h7M4 18h11M21 18h-1"/><circle cx="16" cy="6" r="2.5"/><circle cx="10" cy="12" r="2.5"/><circle cx="18" cy="18" r="2.5"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    in: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    user: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    print: '<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'
  };

  /* ================================================================
   * Outils
   * ================================================================ */

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ic = (k, s) => `<svg width="${s || 22}" height="${s || 22}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const sum = (arr) => arr.reduce((a, b) => a + b, 0);
  const round2 = (x) => Math.round(x * 100) / 100;
  const plural = (n, one, many) => `${n} ${n > 1 ? (many || one + 's') : one}`;

  // Les dates sont manipulées en « numéro de jour » (jours depuis 1970, en UTC)
  // pour éviter tout décalage d'heure d'été.
  const DAY = 86400000;
  const pad = (n) => String(n).padStart(2, '0');
  const toN = (s) => { const [y, m, d] = String(s).split('-').map(Number); return Date.UTC(y, m - 1, d) / DAY; };
  const fromN = (n) => new Date(n * DAY).toISOString().slice(0, 10);
  const partsN = (n) => { const d = new Date(n * DAY); return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), w: d.getUTCDay() }; };
  const ymN = (y, m) => Date.UTC(y, m, 1) / DAY;
  const today = () => { const d = new Date(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY; };
  const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''));

  const dCourt = (n) => { const p = partsN(n); return `${p.d} ${MOIS_COURT[p.m]}`; };
  const dSlash = (n) => { const p = partsN(n); return `${pad(p.d)}/${pad(p.m + 1)}`; };
  const dJour = (n) => { const p = partsN(n); return `${JOURS_COURT[p.w]} ${p.d} ${MOIS_COURT[p.m]}`; };
  const dLong = (n) => { const p = partsN(n); return `${cap(JOURS[p.w])} ${p.d} ${MOIS[p.m]}`; };
  const dFr = (s) => s.split('-').reverse().join('/');

  const EUR = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
  const EUR0 = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const eur = (x) => EUR.format(round2(Number(x) || 0));
  const eur0 = (x) => EUR0.format(Math.round(Number(x) || 0));
  const pct = (x) => `${Math.round((x || 0) * 100)} %`;
  const montantInput = (x) => (x === '' || x == null ? '' : round2(Number(x)).toFixed(2).replace('.', ','));
  const parseMontant = (s) => {
    const t = String(s == null ? '' : s).replace(/[\s  €]/g, '').replace(',', '.');
    return t === '' ? NaN : Number(t);
  };

  // Réservations
  const nights = (r) => toN(r.depart) - toN(r.arrivee);
  // Nombre de nuits d'une réservation comprises dans [a, b[
  const inter = (r, a, b) => Math.max(0, Math.min(toN(r.depart), b) - Math.max(toN(r.arrivee), a));
  // Part du montant correspondant à ces nuits (répartition au prorata des nuits)
  const part = (r, a, b) => { const n = nights(r); return n > 0 ? Number(r.tarif_reel) * inter(r, a, b) / n : 0; };
  // Supplément draps : compté en entier à la date d'arrivée
  const draps = (r) => Number(r.draps_montant) || 0;
  const drapsDans = (r, a, b) => { const x = toN(r.arrivee); return x >= a && x < b ? draps(r) : 0; };
  // Revenu d'une réservation sur [a, b[ : location répartie selon les nuits, plus les draps
  const rev = (r, a, b) => part(r, a, b) + drapsDans(r, a, b);
  const totalResa = (r) => Number(r.tarif_reel) + draps(r);
  const byArr = (x, y) => toN(x.arrivee) - toN(y.arrivee) || toN(x.depart) - toN(y.depart);

  const canEdit = () => S.role === 'gestion';
  const apt = (id) => S.apts.find((a) => Number(a.id) === Number(id)) || { id, nom: `Appartement ${id}` };

  function range(r) {
    const a = toN(r.arrivee), d = toN(r.depart);
    const pa = partsN(a), pd = partsN(d);
    if (pa.y === pd.y && pa.m === pd.m) return `${pa.d} → ${pd.d} ${MOIS_COURT[pd.m]}`;
    return `${dCourt(a)} → ${dCourt(d)}`;
  }

  // « du 7 au 12 sept. 2025 », « du 25 nov. au 2 déc. 2025 », « du 29 déc. 2025 au 5 janv. 2026 »
  function periodeAnnee(r) {
    const pa = partsN(toN(r.arrivee)), pd = partsN(toN(r.depart));
    if (pa.y !== pd.y) return `du ${pa.d} ${MOIS_COURT[pa.m]} ${pa.y} au ${pd.d} ${MOIS_COURT[pd.m]} ${pd.y}`;
    if (pa.m !== pd.m) return `du ${pa.d} ${MOIS_COURT[pa.m]} au ${pd.d} ${MOIS_COURT[pd.m]} ${pd.y}`;
    return `du ${pa.d} au ${pd.d} ${MOIS_COURT[pd.m]} ${pd.y}`;
  }

  function jourRelatif(n, t) {
    if (n === t) return "Aujourd'hui";
    if (n === t + 1) return 'Demain';
    return cap(dJour(n));
  }

  function conflit(aptId, arrivee, depart, excludeId) {
    if (!isDate(arrivee) || !isDate(depart)) return null;
    const a = toN(arrivee), d = toN(depart);
    return S.resas.find((r) => r.id !== excludeId && Number(r.appartement) === Number(aptId) && toN(r.arrivee) < d && a < toN(r.depart)) || null;
  }

  /* ================================================================
   * Stockage : Supabase (en ligne) ou navigateur (démo)
   * ================================================================ */

  function traduireErreur(err) {
    const msg = String((err && (err.message || err.error_description)) || err || '');
    if (err && err.code === '23P01') return 'Cet appartement est déjà réservé sur ces dates.';
    if (/Invalid login credentials/i.test(msg)) return 'E-mail ou mot de passe incorrect.';
    if (/Email not confirmed/i.test(msg)) return "Ce compte n'est pas encore confirmé.";
    if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) return 'Pas de connexion internet. Réessayez dans un instant.';
    if (/row-level security|permission denied/i.test(msg)) return "Ce compte n'a pas le droit de modifier les données.";
    return "Une erreur est survenue. Réessayez, et si ça continue, prévenez Aurélien.";
  }

  const CloudStore = {
    init() {
      if (this.sb) return;
      if (!window.supabase || !window.supabase.createClient) throw new Error('Supabase non chargé');
      this.sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, {
        auth: { persistSession: true, autoRefreshToken: true }
      });
    },
    async session() {
      const { data } = await this.sb.auth.getSession();
      const session = data && data.session;
      if (!session) return null;
      const res = await this.sb.rpc('mon_role');
      if (res.error) throw res.error;
      return { email: session.user.email, role: res.data || null };
    },
    async signIn(email, password) {
      const { error } = await this.sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    async signOut() { await this.sb.auth.signOut(); },
    async fetchAll() {
      const [a, r] = await Promise.all([
        this.sb.from('appartements').select('*').order('id'),
        this.sb.from('reservations').select('*').order('arrivee')
      ]);
      if (a.error) throw a.error;
      if (r.error) throw r.error;
      return { apts: a.data, resas: r.data };
    },
    async insert(row) {
      const { error } = await this.sb.from('reservations').insert(row);
      if (error) throw error;
    },
    async update(id, row) {
      const { error } = await this.sb.from('reservations').update(row).eq('id', id);
      if (error) throw error;
    },
    async remove(id) {
      const { error } = await this.sb.from('reservations').delete().eq('id', id);
      if (error) throw error;
    },
    async updateApt(id, patch) {
      const { error } = await this.sb.from('appartements').update(patch).eq('id', id);
      if (error) throw error;
    }
  };

  const LocalStore = {
    key: 'carnet-locations-demo-v1',
    init() {
      let db = null;
      try { db = JSON.parse(localStorage.getItem(this.key)); } catch (e) { db = null; }
      this.db = db && Array.isArray(db.resas) ? db : demoData();
      this.save();
    },
    save() { try { localStorage.setItem(this.key, JSON.stringify(this.db)); } catch (e) { /* stockage indisponible : la démo reste en mémoire */ } },
    reset() { this.db = demoData(); this.save(); },
    async session() { return { email: 'Mode démo', role: 'gestion' }; },
    async signIn() {},
    async signOut() {},
    async fetchAll() { return JSON.parse(JSON.stringify({ apts: this.db.apts, resas: this.db.resas })); },
    async insert(row) {
      if (conflit(row.appartement, row.arrivee, row.depart, null)) throw { code: '23P01' };
      this.db.resas.push(Object.assign({ id: uid() }, row));
      this.save();
    },
    async update(id, row) {
      if (conflit(row.appartement, row.arrivee, row.depart, id)) throw { code: '23P01' };
      const i = this.db.resas.findIndex((r) => r.id === id);
      if (i >= 0) this.db.resas[i] = Object.assign({}, this.db.resas[i], row);
      this.save();
    },
    async remove(id) { this.db.resas = this.db.resas.filter((r) => r.id !== id); this.save(); },
    async updateApt(id, patch) {
      const a = this.db.apts.find((x) => Number(x.id) === Number(id));
      if (a) Object.assign(a, patch);
      this.save();
    }
  };

  function uid() {
    if (window.crypto && crypto.randomUUID) { try { return crypto.randomUUID(); } catch (e) { /* contexte non sécurisé */ } }
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  // Données fictives de démonstration, placées autour de la date du jour.
  function demoData() {
    const t = today();
    const r = (client, appartement, a, d, personnes, canal, paiement, tarif, paye, notes) => ({
      id: uid(), client, appartement, arrivee: fromN(t + a), depart: fromN(t + d), personnes, canal,
      tarif_reel: tarif, paiement, paye, notes: notes || null
    });
    return {
      apts: [
        { id: 1, nom: 'Appartement 1' },
        { id: 2, nom: 'Appartement 2' },
        { id: 3, nom: 'Appartement 3' }
      ],
      resas: [
        r('Christophe', 1, -62, -48, 1, 'contact', 'virement', 400, true),
        r('Grégory', 1, -26, -24, 2, 'airbnb', 'airbnb', 92.4, true),
        Object.assign(r('Stéphane', 1, -20, -15, 1, 'leboncoin', 'especes', 225, true), { draps_montant: 20, draps_paiement: 'especes' }),
        r('Élodie R.', 1, -13, -8, 2, 'airbnb', 'airbnb', 231, true),
        r('Karim', 1, -6, 0, 2, 'airbnb', 'airbnb', 265.8, true),
        r('Sophie L.', 1, 5, 8, 2, 'airbnb', 'airbnb', 138, false),
        r('Fernandez', 2, -58, -30, 1, 'contact', 'virement', 680, true),
        r('Nadia', 2, -26, -21, 2, 'airbnb', 'airbnb', 219, true),
        r('Fernandez', 2, -12, 20, 1, 'contact', 'virement', 800, false),
        r('Baptiste', 3, -57, -30, 1, 'contact', 'especes', 560, true),
        r('Hamwa', 3, -26, -14, 1, 'contact', 'especes', 480, true),
        r('Baptiste + collègues', 3, -13, 34, 3, 'contact', 'especes', 1400, true, 'Équipe de chantier, paiement au mois')
      ]
    };
  }

  /* ================================================================
   * État et démarrage
   * ================================================================ */

  const S = {
    store: null,
    email: '',
    role: null,
    apts: [],
    resas: [],
    lastRoute: 'accueil',
    cal: null,
    calAnim: null,
    recap: null,
    list: { q: '', apt: 0, due: false },
    started: false
  };

  function app() { return document.getElementById('app'); }

  async function boot() {
    registerSW();
    S.store = CLOUD ? CloudStore : LocalStore;
    try {
      S.store.init();
    } catch (e) {
      renderMessage('Impossible de démarrer', "Le module de connexion n'a pas pu se charger. Vérifiez la connexion internet puis rechargez la page.");
      return;
    }
    let sess;
    try {
      sess = await S.store.session();
    } catch (e) {
      renderMessage('Connexion impossible', traduireErreur(e), true);
      return;
    }
    if (!sess) { renderLogin(); return; }
    if (!sess.role) { renderNoAccess(sess.email); return; }
    S.email = sess.email;
    S.role = sess.role;
    await reload();
    start();
  }

  async function reload() {
    try {
      const d = await S.store.fetchAll();
      S.apts = d.apts || [];
      S.resas = (d.resas || []).map((r) => Object.assign({}, r, {
        appartement: Number(r.appartement),
        personnes: Number(r.personnes) || 1,
        tarif_reel: Number(r.tarif_reel) || 0
      }));
      return true;
    } catch (e) {
      toast(traduireErreur(e), true);
      return false;
    }
  }

  function start() {
    renderShell();
    if (!S.started) {
      S.started = true;
      window.addEventListener('hashchange', route);
      document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState !== 'visible' || document.body.classList.contains('is-form')) return;
        if (await reload()) render();
      });
    }
    route();
  }

  function registerSW() {
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  /* ================================================================
   * Écrans hors application : connexion, erreurs
   * ================================================================ */

  const brandMark = '<img class="brand-mark" src="icons/logo.svg" alt="" width="72" height="72">';

  function renderLogin() {
    app().innerHTML = `
      <main class="login">
        <div class="login-card">
          ${brandMark}
          <h1 class="h1">${NOM}</h1>
          <p class="muted">Connectez-vous pour accéder aux réservations.</p>
          <form id="login-form" novalidate>
            <div class="field">
              <label for="l-email">Adresse e-mail</label>
              <input id="l-email" type="email" autocomplete="username" inputmode="email" required>
            </div>
            <div class="field">
              <label for="l-pw">Mot de passe</label>
              <input id="l-pw" type="password" autocomplete="current-password" required>
            </div>
            <p id="l-err" class="form-error" role="alert" hidden></p>
            <button class="btn btn-primary btn-lg" type="submit">Se connecter</button>
          </form>
          <p class="muted small">Mot de passe oublié : voir avec Aurélien.</p>
        </div>
      </main>`;
    const form = $('#login-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = $('#l-err');
      const btn = form.querySelector('button[type=submit]');
      const email = $('#l-email').value.trim();
      const pw = $('#l-pw').value;
      if (!email || !pw) { err.textContent = "Renseignez l'e-mail et le mot de passe."; err.hidden = false; return; }
      btn.disabled = true; btn.textContent = 'Connexion…'; err.hidden = true;
      try {
        await S.store.signIn(email, pw);
        await boot();
      } catch (ex) {
        err.textContent = traduireErreur(ex); err.hidden = false;
        btn.disabled = false; btn.textContent = 'Se connecter';
      }
    });
  }

  function renderNoAccess(email) {
    app().innerHTML = `
      <main class="login"><div class="login-card">
        ${brandMark}
        <h1 class="h1">Accès en attente</h1>
        <p class="muted">Le compte <strong>${esc(email)}</strong> n'a pas encore accès aux réservations. Demandez à Aurélien de l'ajouter.</p>
        <button class="btn btn-ghost" id="na-out" type="button">Se déconnecter</button>
      </div></main>`;
    $('#na-out').addEventListener('click', async () => { await S.store.signOut(); location.reload(); });
  }

  function renderMessage(title, text, retry) {
    app().innerHTML = `
      <main class="login"><div class="login-card">
        ${brandMark}
        <h1 class="h1">${esc(title)}</h1>
        <p class="muted">${esc(text)}</p>
        ${retry ? '<button class="btn btn-primary" type="button" onclick="location.reload()">Réessayer</button>' : ''}
      </div></main>`;
  }

  /* ================================================================
   * Squelette : navigation latérale (ordinateur) et barre d'onglets (téléphone)
   * ================================================================ */

  function renderShell() {
    const tab = (n) => `<a class="tab" href="#/${n.r}" data-nav="${n.r}">${ic(n.i, 24)}<span>${n.t}</span></a>`;
    app().innerHTML = `
      ${CLOUD ? '' : '<div class="demo-banner">Mode démo : les données restent sur cet appareil et ne sont pas partagées.</div>'}
      <div class="shell">
        <aside class="sidebar">
          <div class="brand"><img src="icons/logo.svg" alt="" width="40" height="40">${NOM}</div>
          ${canEdit() ? `<a class="btn btn-primary btn-block" href="#/nouvelle">${ic('plus', 20)}Nouvelle réservation</a>` : ''}
          <nav class="side-nav" aria-label="Navigation principale">
            ${NAV.map((n) => `<a href="#/${n.r}" data-nav="${n.r}">${ic(n.i, 20)}<span>${n.t}</span></a>`).join('')}
          </nav>
          <p class="side-foot">${S.role === 'lecture' ? 'Consultation seule' : ''}</p>
        </aside>
        <main id="view" class="view" tabindex="-1"></main>
      </div>
      <nav class="tabbar" aria-label="Navigation principale">
        ${tab(NAV[0])}${tab(NAV[1])}
        ${canEdit() ? `<a class="tab-add" href="#/nouvelle" aria-label="Nouvelle réservation">${ic('plus', 28)}</a>` : ''}
        ${tab(NAV[2])}${tab(NAV[3])}
      </nav>
      <div id="toast" class="toast" role="status" aria-live="polite"></div>`;
    const view = $('#view');
    view.addEventListener('click', onClick);
    view.addEventListener('submit', onSubmit);
    view.addEventListener('input', onInput);
    view.addEventListener('change', onChange);
    view.addEventListener('touchstart', onTouchStart, { passive: true });
    view.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  let toastTimer;
  function toast(msg, isErr) {
    const el = $('#toast');
    if (!el) { if (isErr) alert(msg); return; }
    el.textContent = msg;
    el.classList.toggle('err', Boolean(isErr));
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), isErr ? 5000 : 2600);
  }

  /* ================================================================
   * Routage
   * ================================================================ */

  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '') || 'accueil';
    const [path, qs] = h.split('?');
    return { seg: path.split('/'), params: new URLSearchParams(qs || '') };
  }

  function route() {
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    if (!$('#view')) return;
    const { seg, params } = parseHash();
    const key = seg[0];
    const isForm = key === 'nouvelle' || key === 'reservation';
    document.body.classList.toggle('is-form', isForm);
    $$('[data-nav]').forEach((a) => {
      if (a.dataset.nav === key) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    if (isForm) {
      if (key === 'nouvelle' && !canEdit()) { location.replace('#/accueil'); return; }
      viewForm(key === 'reservation' ? decodeURIComponent(seg[1] || '') : null, params);
      return;
    }
    S.lastRoute = NAV.some((n) => n.r === key) ? key : 'accueil';
    const views = { calendrier: viewCalendrier, reservations: viewListe, recap: viewRecap, reglages: viewReglages };
    $('#view').innerHTML = (views[key] || viewAccueil)();
  }

  function go(hash) { location.hash = hash; }
  function goBack() { location.replace('#/' + S.lastRoute); }

  /* ================================================================
   * Accueil
   * ================================================================ */

  function viewAccueil() {
    const t = today();
    const p = partsN(t);
    const ma = ymN(p.y, p.m), mb = ymN(p.y, p.m + 1);
    const revenu = sum(S.resas.map((r) => rev(r, ma, mb)));
    const nts = sum(S.resas.map((r) => inter(r, ma, mb)));
    const occ = nts / ((mb - ma) * APTS.length);
    const due = S.resas.filter((r) => !r.paye);
    const dueTotal = sum(due.map(totalResa));
    const dueSub = due.length === 0 ? 'Tout est encaissé'
      : due.length === 1 ? `${esc(due[0].client)} · ${(PAIEMENTS[due[0].paiement] || '').toLowerCase()}`
      : plural(due.length, 'réservation');

    return `
      <header class="page-head">
        <div>
          <p class="eyebrow">${dLong(t)}</p>
          <h1 class="h1">Bonjour</h1>
        </div>
        <a class="icon-btn only-mobile" href="#/reglages" aria-label="Réglages">${ic('sliders')}</a>
      </header>
      <div class="home-grid">
        <div class="stack" style="gap:24px">
          <section class="stack">
            <h2 class="h2">Aujourd'hui</h2>
            ${APTS.map((id) => aptStatus(id, t)).join('')}
          </section>
          <section class="stack">
            <h2 class="h2">${cap(MOIS[p.m])}</h2>
            <div class="tiles">
              <button type="button" class="card tile" data-act="recap-mois">
                <span class="k">Revenus du mois</span>
                <span class="v">${eur(revenu)}</span>
                <span class="s">${pct(occ)} d'occupation</span>
              </button>
              <button type="button" class="card tile tile-warn" data-act="goto-due">
                <span class="k">À encaisser</span>
                <span class="v">${eur(dueTotal)}</span>
                <span class="s">${dueSub}</span>
              </button>
            </div>
          </section>
        </div>
        <section class="stack">
          <h2 class="h2">Cette semaine</h2>
          <div class="card list-card">${semaine(t)}</div>
        </section>
      </div>`;
  }

  function aptStatus(id, t) {
    const rs = S.resas.filter((r) => r.appartement === id);
    const cur = rs.find((r) => toN(r.arrivee) <= t && t < toN(r.depart));
    const leaving = rs.find((r) => toN(r.depart) === t);
    const next = rs.filter((r) => toN(r.arrivee) > t).sort(byArr)[0];
    let title, sub, pill, target;
    if (cur) {
      const d = toN(cur.depart);
      title = esc(cur.client);
      sub = d === t + 1 ? 'Départ demain' : `Jusqu'au ${dJour(d)}`;
      if (toN(cur.arrivee) === t) sub = "Arrivée aujourd'hui · " + sub;
      pill = '<span class="pill pill-lg pill-busy">Occupé</span>';
      target = cur.id;
    } else if (leaving) {
      title = esc(leaving.client);
      sub = "Départ aujourd'hui" + (next ? ` · prochaine arrivée ${dJour(toN(next.arrivee))}` : '');
      pill = '<span class="pill pill-lg pill-warn">Se libère</span>';
      target = leaving.id;
    } else {
      title = 'Libre';
      sub = next ? `Prochaine arrivée : ${esc(next.client)}, ${dJour(toN(next.arrivee))}` : 'Aucune réservation à venir';
      pill = '<span class="pill pill-lg pill-ok">Libre</span>';
    }
    const inner = `<span class="badge a${id}">${id}</span>
      <span class="main"><span class="title">${title}</span><span class="sub">${sub}</span></span>${pill}`;
    if (target) return `<button type="button" class="card apt-card a${id}" data-act="open" data-id="${esc(target)}">${inner}</button>`;
    if (canEdit()) return `<a class="card apt-card a${id}" href="#/nouvelle?apt=${id}&date=${fromN(t)}">${inner}</a>`;
    return `<div class="card apt-card a${id}">${inner}</div>`;
  }

  function semaine(t) {
    const end = t + 7;
    const ev = [];
    S.resas.forEach((r) => {
      const a = toN(r.arrivee), d = toN(r.depart);
      if (d >= t && d <= end) ev.push({ n: d, o: 0, k: 'out', r });
      if (a >= t && a <= end) ev.push({ n: a, o: 2, k: 'in', r });
    });
    // Périodes libres qui commencent dans les 7 jours
    APTS.forEach((id) => {
      const rs = S.resas.filter((r) => r.appartement === id && toN(r.depart) > t).sort(byArr);
      let cur = t;
      for (const r of rs) {
        const a = toN(r.arrivee);
        if (cur > end) break;
        if (a > cur) ev.push({ n: cur, o: 1, k: 'gap', apt: id, from: cur, to: a });
        cur = Math.max(cur, toN(r.depart));
      }
      if (cur <= end) ev.push({ n: cur, o: 1, k: 'gap', apt: id, from: cur, to: null });
    });
    ev.sort((x, y) => x.n - y.n || x.o - y.o || (x.apt || 0) - (y.apt || 0));
    if (!ev.length) return '<p class="empty">Rien de prévu cette semaine.</p>';

    return ev.map((e) => {
      if (e.k === 'gap') {
        const t1 = e.to ? `Appart ${e.apt} libre ${plural(e.to - e.from, 'nuit')}` : `Appart ${e.apt} libre`;
        const t2 = e.to ? `Du ${dJour(e.from)} au ${dJour(e.to)}` : `À partir du ${dJour(e.from)}, rien de prévu`;
        const body = `<span class="ev-ic gap">${ic('cal', 20)}</span><span class="ev-txt"><span class="ev-t">${t1}</span><span class="ev-s">${t2}</span></span>`;
        return canEdit()
          ? `<a class="ev" href="#/nouvelle?apt=${e.apt}&date=${fromN(e.from)}">${body}</a>`
          : `<div class="ev">${body}</div>`;
      }
      const r = e.r;
      const isIn = e.k === 'in';
      const t1 = `${isIn ? 'Arrivée' : 'Départ'} · ${esc(r.client)}`;
      const t2 = `${jourRelatif(e.n, t)} · appart ${r.appartement}` + (isIn ? ` · ${r.personnes} pers.` : '');
      return `<button type="button" class="ev" data-act="open" data-id="${esc(r.id)}">
        <span class="ev-ic ${e.k}">${ic(e.k, 20)}</span>
        <span class="ev-txt"><span class="ev-t">${t1}</span><span class="ev-s">${t2}</span></span></button>`;
    }).join('');
  }

  /* ================================================================
   * Calendrier
   * ================================================================ */

  function viewCalendrier() {
    if (!S.cal) { const p = partsN(today()); S.cal = { y: p.y, m: p.m }; }
    const { y, m } = S.cal;
    const anim = S.calAnim; S.calAnim = null;
    const a = ymN(y, m), b = ymN(y, m + 1), nd = b - a, t = today();
    const rs = S.resas.filter((r) => toN(r.arrivee) < b && toN(r.depart) > a);
    const days = [];
    for (let i = 0; i < nd; i++) days.push(Object.assign({ i, n: a + i }, partsN(a + i)));

    const barInfo = (r) => {
      const ra = toN(r.arrivee), rd = toN(r.depart);
      const s = Math.max(ra, a) - a, e = Math.min(rd, b) - a;
      const cls = (ra < a ? ' cont-start' : '') + (rd > b ? ' cont-end' : '');
      let sub;
      if (rd > b) sub = `jusqu'au ${dSlash(rd)}`;
      else if (ra < a) sub = `depuis le ${dSlash(ra)}`;
      else sub = `${CANAL_COURT[r.canal] || 'Contact'} · ${nights(r)} n.`;
      const label = `${r.client}, appart ${r.appartement}, du ${dCourt(ra)} au ${dCourt(rd)}`;
      return { s, e, cls, sub, label };
    };

    const addCell = (id, d, col, row) => canEdit()
      ? `<button type="button" class="cell" data-act="cal-add" data-apt="${id}" data-date="${fromN(d.n)}" style="grid-column:${col};grid-row:${row}" aria-label="Ajouter une réservation : appart ${id}, le ${d.d} ${MOIS[d.m]}"></button>`
      : '';

    // Vue téléphone : jours en lignes, un appartement par colonne (comme le calendrier papier)
    const vertical = `
      <div class="calv">
        <div class="calv-head"><span></span>${APTS.map((id) => `<div class="apt-chip a${id}">Appart ${id}</div>`).join('')}</div>
        <div class="calv-grid" style="grid-template-rows:repeat(${nd}, var(--row))">
          ${APTS.map((id) => `<div class="lane" style="grid-column:${id + 1}"></div>`).join('')}
          ${days.filter((d) => d.w === 0 || d.w === 6).map((d) => `<div class="we" style="grid-row:${d.i + 1}"></div>`).join('')}
          ${days.map((d) => `<span class="dl${d.n === t ? ' is-today' : ''}" style="grid-row:${d.i + 1}"><span>${JOUR_LETTRE[d.w]} ${d.d}</span></span>`).join('')}
          ${APTS.map((id) => days.map((d) => addCell(id, d, id + 1, d.i + 1)).join('')).join('')}
          ${rs.map((r) => {
            const k = barInfo(r);
            return `<button type="button" class="bar a${r.appartement}${k.cls}" data-act="open" data-id="${esc(r.id)}" style="grid-column:${r.appartement + 1};grid-row:${k.s + 1} / ${k.e + 1}" aria-label="${esc(k.label)}"><span class="bar-name">${esc(r.client)}</span><span class="bar-sub">${k.sub}</span></button>`;
          }).join('')}
        </div>
      </div>`;

    // Vue ordinateur : planning horizontal
    const horizontal = `
      <div class="card calh">
        <div class="calh-grid" style="grid-template-columns:120px repeat(${nd}, minmax(0, 1fr))">
          ${days.filter((d) => d.w === 0 || d.w === 6).map((d) => `<div class="we-col" style="grid-column:${d.i + 2}"></div>`).join('')}
          ${t >= a && t < b ? `<div class="today-line" style="grid-column:${t - a + 2}"></div>` : ''}
          ${days.map((d) => `<div class="dh${d.n === t ? ' is-today' : ''}" style="grid-column:${d.i + 2}"><span>${JOUR_LETTRE[d.w]}</span><b>${d.d}</b></div>`).join('')}
          ${APTS.map((id) => `<div class="rl" style="grid-row:${id + 1}"><span class="badge sm a${id}">${id}</span>Appart ${id}</div>`).join('')}
          ${APTS.map((id) => days.map((d) => addCell(id, d, d.i + 2, id + 1)).join('')).join('')}
          ${rs.map((r) => {
            const k = barInfo(r);
            const sub2 = k.cls ? k.sub : `${CANAL_COURT[r.canal] || 'Contact'} · ${eur(totalResa(r))}`;
            return `<button type="button" class="bar a${r.appartement}${k.cls}" data-act="open" data-id="${esc(r.id)}" style="grid-row:${r.appartement + 1};grid-column:${k.s + 2} / ${k.e + 2}" aria-label="${esc(k.label)}" title="${esc(k.label)}"><span class="bar-name">${esc(r.client)}</span><span class="bar-sub">${sub2}</span></button>`;
          }).join('')}
        </div>
      </div>`;

    return `
      <header class="page-head">
        <h1 class="h1">Calendrier</h1>
        <button type="button" class="btn btn-ghost btn-sm" data-act="cal-today">Aujourd'hui</button>
      </header>
      <div class="month-nav">
        <button type="button" class="icon-btn" data-act="cal-prev" aria-label="Mois précédent">${ic('left', 20)}</button>
        <span class="month-label">${cap(MOIS[m])} ${y}</span>
        <button type="button" class="icon-btn" data-act="cal-next" aria-label="Mois suivant">${ic('right', 20)}</button>
      </div>
      <div class="cal-swipe${anim ? ' anim-' + anim : ''}">
      ${vertical}
      ${horizontal}
      </div>
      <p class="hint only-mobile">Faites glisser le calendrier vers la gauche ou la droite pour changer de mois.</p>
      ${canEdit() ? '<p class="hint">Touchez une case vide pour ajouter une réservation, ou une réservation pour la modifier.</p>' : ''}`;
  }

  // Mois suivant (+1) ou précédent (-1), avec un léger glissement dans le sens du geste
  function changerMois(dir) {
    const d = new Date(Date.UTC(S.cal.y, S.cal.m + dir, 1));
    S.cal = { y: d.getUTCFullYear(), m: d.getUTCMonth() };
    S.calAnim = dir > 0 ? 'next' : 'prev';
    render();
  }

  // Glisser le doigt horizontalement sur le calendrier pour changer de mois
  let swipe = null;
  function onTouchStart(e) {
    if (e.touches.length !== 1 || !e.target.closest('.cal-swipe')) { swipe = null; return; }
    swipe = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function onTouchEnd(e) {
    if (!swipe || !e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - swipe.x;
    const dy = e.changedTouches[0].clientY - swipe.y;
    swipe = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) changerMois(dx < 0 ? 1 : -1);
  }

  /* ================================================================
   * Formulaire de réservation (création, modification, consultation)
   * ================================================================ */

  function viewForm(id, params) {
    const view = $('#view');
    const existing = id ? S.resas.find((r) => String(r.id) === id) : null;
    if (id && !existing) {
      view.innerHTML = `<div class="form"><div class="form-head"><button type="button" class="back" data-act="form-cancel">${ic('left', 20)}Retour</button>
        <h1 class="h1">Réservation introuvable</h1></div><p class="muted">Elle a peut-être été supprimée.</p></div>`;
      return;
    }
    const ro = !canEdit();
    const dateParam = params.get('date');
    const aptParam = Number(params.get('apt'));
    const F = existing ? Object.assign({}, existing, { notes: existing.notes || '', drapsOn: existing.draps_montant != null }) : {
      client: '',
      appartement: APTS.includes(aptParam) ? aptParam : 1,
      arrivee: isDate(dateParam) ? dateParam : fromN(today()),
      depart: '',
      personnes: 1,
      canal: 'contact',
      tarif_reel: '',
      paiement: '',
      paye: false,
      notes: '',
      drapsOn: false,
      draps_montant: '',
      draps_paiement: ''
    };
    const clients = Array.from(new Set(S.resas.map((r) => r.client.trim()))).sort((x, y) => x.localeCompare(y, 'fr'));
    const radio = (attr, val, cur, label, cls) => `<button type="button" role="radio" ${attr}="${val}" aria-checked="${String(val) === String(cur)}"${cls ? ` class="${cls}"` : ''}>${label}</button>`;
    const title = existing ? (ro ? 'Réservation' : 'Modifier la réservation') : 'Nouvelle réservation';

    view.innerHTML = `
      <form id="resa-form" class="form" novalidate>
        <div class="form-head">
          <button type="button" class="back" data-act="form-cancel">${ic('left', 20)}${ro ? 'Retour' : 'Annuler'}</button>
          <h1 class="h1">${title}</h1>
        </div>
        ${ro ? '<p class="ro-note">Consultation seule : ce compte ne peut pas modifier les réservations.</p>' : ''}
        <fieldset class="form-body"${ro ? ' disabled' : ''}>
          <section class="card fsec">
            <div class="field">
              <label for="f-client">Nom du client</label>
              <input id="f-client" list="f-clients" autocomplete="off" autocapitalize="words" value="${esc(F.client)}">
              <datalist id="f-clients">${clients.map((c) => `<option value="${esc(c)}"></option>`).join('')}</datalist>
              <div id="f-client-hint" class="hint-box" hidden></div>
            </div>
            <div class="field-row">
              <span class="label" id="lbl-pers">Nombre de personnes</span>
              <div class="stepper" role="group" aria-labelledby="lbl-pers">
                <button type="button" class="step" data-step="-1" aria-label="Retirer une personne">−</button>
                <output id="f-pers" aria-live="polite">${F.personnes}</output>
                <button type="button" class="step" data-step="1" aria-label="Ajouter une personne">+</button>
              </div>
            </div>
          </section>

          <section class="card fsec">
            <span class="label" id="lbl-apt">Appartement</span>
            <div class="apt-pick" role="radiogroup" aria-labelledby="lbl-apt">
              ${APTS.map((i) => `<button type="button" role="radio" class="apt-opt a${i}" data-apt="${i}" aria-label="Appartement ${i}" aria-checked="${F.appartement === i}">${i}<small>Appart</small></button>`).join('')}
            </div>
            <div class="two">
              <div class="field"><label for="f-arr">Arrivée</label><input type="date" id="f-arr" value="${esc(F.arrivee)}"></div>
              <div class="field"><label for="f-dep">Départ</label><input type="date" id="f-dep" value="${esc(F.depart)}"></div>
            </div>
            <div id="f-dispo" class="dispo" aria-live="polite"></div>
          </section>

          <section class="card fsec">
            <span class="label" id="lbl-canal">Canal de réservation</span>
            <div class="seg seg-3" role="radiogroup" aria-labelledby="lbl-canal">
              ${Object.keys(CANAUX).map((k) => radio('data-canal', k, F.canal, CANAUX[k])).join('')}
            </div>
            <div class="field">
              <label for="f-reel" id="lbl-reel">Tarif</label>
              <div class="money"><input id="f-reel" inputmode="decimal" autocomplete="off" placeholder="0,00" value="${esc(montantInput(F.tarif_reel))}"><span aria-hidden="true">€</span></div>
              <p id="f-ecart" class="ecart" aria-live="polite"></p>
            </div>
          </section>

          <section class="card fsec">
            <span class="label" id="lbl-pay">Mode de paiement</span>
            <div class="pay-pick pay-5" role="radiogroup" aria-labelledby="lbl-pay">
              ${PAY_ORDRE.map((k) => radio('data-pay', k, F.paiement, PAIEMENTS[k])).join('')}
            </div>
            <span class="label" id="lbl-statut">Statut</span>
            <div class="seg" role="radiogroup" aria-labelledby="lbl-statut">
              ${radio('data-paye', '1', F.paye ? '1' : '0', 'Payé')}${radio('data-paye', '0', F.paye ? '1' : '0', 'À encaisser', 'warn')}
            </div>
          </section>

          <section class="card fsec">
            <button type="button" class="toggle" id="f-draps-toggle" aria-pressed="${F.drapsOn}">
              <span class="toggle-box" aria-hidden="true">${ic('check', 16)}</span>Supplément draps
            </button>
            <div id="f-draps" class="stack"${F.drapsOn ? '' : ' hidden'}>
              <div class="field">
                <label for="f-draps-mt">Montant des draps</label>
                <div class="money"><input id="f-draps-mt" inputmode="decimal" autocomplete="off" placeholder="0,00" value="${esc(montantInput(F.draps_montant))}"><span aria-hidden="true">€</span></div>
              </div>
              <span class="label" id="lbl-draps-pay">Paiement des draps</span>
              <div class="pay-pick pay-3" role="radiogroup" aria-labelledby="lbl-draps-pay">
                ${DRAPS_PAY.map((k) => radio('data-dpay', k, F.draps_paiement, PAIEMENTS[k])).join('')}
              </div>
            </div>
          </section>

          <section class="card fsec">
            <div class="field">
              <label for="f-notes">Notes</label>
              <textarea id="f-notes" rows="3" placeholder="Ex. : arrivée tardive, clés chez la voisine">${esc(F.notes)}</textarea>
            </div>
          </section>
        </fieldset>
        <p id="f-error" class="form-error" role="alert" hidden></p>
        ${ro ? '' : `<div class="form-actions">
          <button type="submit" class="btn btn-primary btn-lg">${existing ? 'Enregistrer les modifications' : 'Enregistrer la réservation'}</button>
          ${existing ? `<button type="button" class="btn btn-danger" data-act="form-delete">${ic('trash', 18)}Supprimer la réservation</button>` : ''}
        </div>`}
      </form>`;

    const form = $('#resa-form');
    const reelInput = $('#f-reel');

    const n = () => (isDate(F.arrivee) && isDate(F.depart) ? toN(F.depart) - toN(F.arrivee) : 0);

    const setChecked = (attr, val) => $$(`[${attr}]`, form).forEach((b) => b.setAttribute('aria-checked', String(b.getAttribute(attr) === String(val))));

    function refresh() {
      const nb = n();
      // Disponibilité
      const dispo = $('#f-dispo');
      let c = null;
      if (!isDate(F.arrivee) || !isDate(F.depart)) {
        dispo.className = 'dispo';
        dispo.innerHTML = "<span>Choisissez les dates d'arrivée et de départ.</span>";
      } else if (nb <= 0) {
        dispo.className = 'dispo bad';
        dispo.innerHTML = `<span>${ic('alert', 18)}Le départ doit être après l'arrivée.</span>`;
      } else if ((c = conflit(F.appartement, F.arrivee, F.depart, existing && existing.id))) {
        dispo.className = 'dispo bad';
        dispo.innerHTML = `<span>${ic('alert', 18)}Déjà réservé : ${esc(c.client)}, du ${dSlash(toN(c.arrivee))} au ${dSlash(toN(c.depart))}</span>`;
      } else {
        dispo.className = 'dispo ok';
        dispo.innerHTML = `<span>${ic('check', 18)}Appart ${F.appartement} libre sur ces dates</span><strong>${plural(nb, 'nuit')}</strong>`;
      }
      // Libellé du tarif et prix par nuit
      $('#lbl-reel').textContent = F.canal === 'airbnb' ? "Montant net reçu d'Airbnb" : 'Tarif';
      const reel = parseMontant(reelInput.value);
      $('#f-ecart').textContent = !isNaN(reel) && nb > 0 ? `Soit ${eur(reel / nb)} la nuit` : '';
      // Client déjà venu
      const hint = $('#f-client-hint');
      const key = F.client.trim().toLowerCase();
      const past = key ? S.resas.filter((r) => r.client.trim().toLowerCase() === key && (!existing || r.id !== existing.id)).sort((x, y) => byArr(y, x)) : [];
      if (past.length) {
        const l = past[0];
        hint.innerHTML = `${ic('user', 18)}<span><strong>Client connu</strong> · ${plural(past.length, 'séjour')}, dernier ${periodeAnnee(l)} (appart ${l.appartement})</span>`;
        hint.hidden = false;
      } else {
        hint.hidden = true;
      }
    }

    form.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b || b.disabled || b.closest('fieldset[disabled]')) return;
      if (b.dataset.step) {
        F.personnes = Math.min(20, Math.max(1, F.personnes + Number(b.dataset.step)));
        $('#f-pers').textContent = F.personnes;
      } else if (b.dataset.apt) {
        F.appartement = Number(b.dataset.apt); setChecked('data-apt', F.appartement); refresh();
      } else if (b.dataset.canal) {
        F.canal = b.dataset.canal; setChecked('data-canal', F.canal);
        if (F.canal === 'airbnb') F.paiement = 'airbnb';
        else if (F.paiement === 'airbnb') F.paiement = '';
        setChecked('data-pay', F.paiement); refresh();
      } else if (b.dataset.pay) {
        F.paiement = b.dataset.pay; setChecked('data-pay', F.paiement);
      } else if (b.dataset.paye) {
        F.paye = b.dataset.paye === '1'; setChecked('data-paye', b.dataset.paye);
      } else if (b.id === 'f-draps-toggle') {
        F.drapsOn = !F.drapsOn;
        b.setAttribute('aria-pressed', String(F.drapsOn));
        $('#f-draps').hidden = !F.drapsOn;
        if (F.drapsOn && !F.draps_paiement && DRAPS_PAY.includes(F.paiement)) { F.draps_paiement = F.paiement; setChecked('data-dpay', F.draps_paiement); }
        if (F.drapsOn) $('#f-draps-mt').focus({ preventScroll: true });
      } else if (b.dataset.dpay) {
        F.draps_paiement = b.dataset.dpay; setChecked('data-dpay', F.draps_paiement);
      }
    });

    $('#f-client').addEventListener('input', (e) => { F.client = e.target.value; refresh(); });
    $('#f-arr').addEventListener('change', (e) => {
      F.arrivee = e.target.value;
      if (isDate(F.arrivee) && isDate(F.depart) && toN(F.depart) <= toN(F.arrivee)) {
        F.depart = fromN(toN(F.arrivee) + 1); $('#f-dep').value = F.depart;
      }
      refresh();
    });
    $('#f-dep').addEventListener('change', (e) => { F.depart = e.target.value; refresh(); });
    reelInput.addEventListener('input', refresh);
    $('#f-notes').addEventListener('input', (e) => { F.notes = e.target.value; });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (ro) return;
      const err = $('#f-error');
      const nb = n();
      const reel = parseMontant(reelInput.value);
      const manque = [];
      if (!F.client.trim()) manque.push('le nom du client');
      if (!isDate(F.arrivee) || !isDate(F.depart)) manque.push('les dates');
      if (isNaN(reel) || reel < 0) manque.push('le tarif');
      if (!F.paiement) manque.push('le mode de paiement');
      const dm = parseMontant($('#f-draps-mt').value);
      if (F.drapsOn && (isNaN(dm) || dm < 0)) manque.push('le montant des draps');
      if (F.drapsOn && !DRAPS_PAY.includes(F.draps_paiement)) manque.push('le paiement des draps');
      let msg = manque.length ? `Il manque ${manque.join(', ')}.` : '';
      if (!msg && nb <= 0) msg = "La date de départ doit être après la date d'arrivée.";
      if (!msg && conflit(F.appartement, F.arrivee, F.depart, existing && existing.id)) msg = 'Cet appartement est déjà réservé sur ces dates.';
      if (msg) { err.textContent = msg; err.hidden = false; err.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
      err.hidden = true;

      const row = {
        client: F.client.trim(),
        appartement: F.appartement,
        arrivee: F.arrivee,
        depart: F.depart,
        personnes: F.personnes,
        canal: F.canal,
        tarif_reel: round2(reel),
        paiement: F.paiement,
        draps_montant: F.drapsOn ? round2(dm) : null,
        draps_paiement: F.drapsOn ? F.draps_paiement : null,
        paye: F.paye,
        notes: F.notes.trim() || null
      };
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true; btn.textContent = 'Enregistrement…';
      try {
        if (existing) await S.store.update(existing.id, row);
        else await S.store.insert(row);
        await reload();
        toast(existing ? 'Modifications enregistrées' : 'Réservation enregistrée');
        goBack();
      } catch (ex) {
        err.textContent = traduireErreur(ex); err.hidden = false;
        btn.disabled = false; btn.textContent = existing ? 'Enregistrer les modifications' : 'Enregistrer la réservation';
      }
    });

    refresh();
    if (!existing && !ro && !matchMedia('(pointer: coarse)').matches) setTimeout(() => $('#f-client').focus({ preventScroll: true }), 50);
  }

  /* ================================================================
   * Liste des réservations
   * ================================================================ */

  function viewListe() {
    const L = S.list;
    const all = L.apt === 0 && !L.due;
    return `
      <header class="page-head"><h1 class="h1">Réservations</h1></header>
      <div class="search">
        ${ic('search', 20)}
        <label for="q" class="sr-only">Rechercher un client</label>
        <input id="q" type="search" placeholder="Rechercher un client" value="${esc(L.q)}" autocomplete="off">
      </div>
      <div class="chips" role="group" aria-label="Filtres">
        <button type="button" class="chip" data-act="list-all" aria-pressed="${all}">Toutes</button>
        ${APTS.map((i) => `<button type="button" class="chip a${i}" data-act="list-apt" data-v="${i}" aria-pressed="${L.apt === i}"><i class="dot"></i>Appart ${i}</button>`).join('')}
        <button type="button" class="chip" data-act="list-due" aria-pressed="${L.due}">À encaisser</button>
      </div>
      <div id="list-results">${listResults()}</div>`;
  }

  function listResults() {
    const L = S.list;
    const q = L.q.trim().toLowerCase();
    const rs = S.resas
      .filter((r) => (!L.apt || r.appartement === L.apt) && (!L.due || !r.paye)
        && (!q || r.client.toLowerCase().includes(q) || String(r.notes || '').toLowerCase().includes(q)))
      .sort((x, y) => byArr(y, x));
    if (!rs.length) return `<p class="empty card">${S.resas.length ? 'Aucune réservation ne correspond.' : 'Aucune réservation pour le moment.'}</p>`;

    const summary = `<p class="summary">${plural(rs.length, 'réservation')} · ${eur(sum(rs.map(totalResa)))}${L.due ? ' à encaisser' : ''}</p>`;
    const groups = [];
    rs.forEach((r) => {
      const p = partsN(toN(r.arrivee));
      const k = `${p.y}-${p.m}`;
      if (!groups.length || groups[groups.length - 1].k !== k) groups.push({ k, label: `${cap(MOIS[p.m])} ${p.y}`, items: [] });
      groups[groups.length - 1].items.push(r);
    });
    return summary + groups.map((g) => `
      <section class="group">
        <h2 class="group-title">${g.label}</h2>
        <div class="card list-card">${g.items.map(rowHtml).join('')}</div>
      </section>`).join('');
  }

  function rowHtml(r) {
    const status = r.paye
      ? `<span class="pill">${PAIEMENTS[r.paiement] || ''}</span>`
      : '<span class="pill pill-warn">À encaisser</span>';
    return `<button type="button" class="row" data-act="open" data-id="${esc(r.id)}">
      <span class="badge sm a${r.appartement}">${r.appartement}</span>
      <span class="row-main"><span class="row-title">${esc(r.client)}</span>
        <span class="row-sub">${range(r)} · ${plural(nights(r), 'nuit')} · ${r.personnes} pers.${draps(r) > 0 ? ' · draps' : ''}</span></span>
      <span class="row-end"><span class="row-amount">${eur(totalResa(r))}</span>${status}</span>
    </button>`;
  }

  /* ================================================================
   * Récap
   * ================================================================ */

  function recapState() {
    if (!S.recap) {
      const p = partsN(today());
      S.recap = { type: 'semestre', y: p.y, m: p.m, s: p.m < 6 ? 0 : 1, from: fromN(ymN(p.y, 0)), to: fromN(today()) };
    }
    return S.recap;
  }

  function recapPeriod() {
    const R = recapState();
    if (R.type === 'mois') return { a: ymN(R.y, R.m), b: ymN(R.y, R.m + 1), label: `${cap(MOIS[R.m])} ${R.y}` };
    if (R.type === 'semestre') return { a: ymN(R.y, R.s * 6), b: ymN(R.y, R.s * 6 + 6), label: `${R.s ? '2e' : '1er'} semestre ${R.y}` };
    if (R.type === 'annee') return { a: ymN(R.y, 0), b: ymN(R.y + 1, 0), label: `Année ${R.y}` };
    let a = isDate(R.from) ? toN(R.from) : ymN(partsN(today()).y, 0);
    let b = isDate(R.to) ? toN(R.to) + 1 : today() + 1;
    if (b <= a) b = a + 1;
    return { a, b, label: `Du ${dCourt(a)} ${partsN(a).y} au ${dCourt(b - 1)} ${partsN(b - 1).y}` };
  }

  function viewRecap() {
    const R = recapState();
    const { a, b, label } = recapPeriod();
    const days = b - a;
    const rs = S.resas.filter((r) => inter(r, a, b) > 0);
    const total = sum(rs.map((r) => rev(r, a, b)));
    const location = sum(rs.map((r) => part(r, a, b)));
    const nts = sum(rs.map((r) => inter(r, a, b)));
    const dueP = sum(rs.filter((r) => !r.paye).map((r) => rev(r, a, b)));
    const avecDraps = rs.filter((r) => drapsDans(r, a, b) > 0);
    const totalDraps = sum(avecDraps.map((r) => drapsDans(r, a, b)));
    const occ = nts / (days * APTS.length);

    const types = [['mois', 'Mois'], ['semestre', 'Semestre'], ['annee', 'Année'], ['perso', 'Période']];
    const nav = R.type === 'perso'
      ? `<div class="perso no-print">
          <div class="field"><label for="p-from">Du</label><input type="date" id="p-from" data-recap="from" value="${esc(R.from)}"></div>
          <div class="field"><label for="p-to">Au (inclus)</label><input type="date" id="p-to" data-recap="to" value="${esc(R.to)}"></div>
        </div>`
      : `<div class="period-nav no-print">
          <button type="button" class="icon-btn" data-act="recap-prev" aria-label="Période précédente">${ic('left', 20)}</button>
          <span class="period-label">${label}</span>
          <button type="button" class="icon-btn" data-act="recap-next" aria-label="Période suivante">${ic('right', 20)}</button>
        </div>`;

    // Graphique par mois (empilé par appartement)
    const months = [];
    for (let p = partsN(a), y = p.y, m = p.m; ymN(y, m) < b; m++) {
      const ma = Math.max(ymN(y, m), a), mb = Math.min(ymN(y, m + 1), b);
      const q = partsN(ymN(y, m));
      months.push({ label: MOIS_COURT[q.m], full: `${cap(MOIS[q.m])} ${q.y}`, v: APTS.map((id) => sum(rs.filter((r) => r.appartement === id).map((r) => rev(r, ma, mb)))) });
    }
    const maxM = Math.max(1, ...months.map((mo) => sum(mo.v)));
    const legend = `<div class="legend">${APTS.map((id) => `<span class="a${id}"><i class="sw"></i>Appart ${id}</span>`).join('')}</div>`;
    const chart = months.length < 2 ? '' : `
      <section class="card rsec span2">
        <div class="rsec-head"><h2 class="h2">Par mois</h2>${legend}</div>
        <div class="chart${months.length > 6 ? ' many' : ''}" role="img" aria-label="${esc(months.map((mo) => `${mo.full} : ${eur(sum(mo.v))}`).join(', '))}">
          ${months.map((mo) => `<div class="chart-col" title="${esc(mo.full)} : ${eur(sum(mo.v))}">
            <span class="chart-val">${sum(mo.v) ? eur0(sum(mo.v)) : ''}</span>
            <div class="chart-stack">${mo.v.map((v, i) => (v > 0 ? `<i class="a${i + 1}" style="height:${Math.max(2, Math.round(v / maxM * 160))}px"></i>` : '')).join('')}</div>
          </div>`).join('')}
        </div>
        <div class="chart-x" aria-hidden="true">${months.map((mo) => `<span>${mo.label}</span>`).join('')}</div>
      </section>`;

    const parApt = APTS.map((id) => {
      const x = rs.filter((r) => r.appartement === id);
      const v = sum(x.map((r) => rev(r, a, b)));
      const n = sum(x.map((r) => inter(r, a, b)));
      const o = n / days;
      return `<div class="apt-line a${id}">
        <div class="top"><span class="badge sm">${id}</span>
          <span class="txt"><strong>${esc(apt(id).nom)}</strong><span class="small muted">${plural(n, 'nuit')} · ${pct(o)} d'occupation</span></span>
          <strong>${eur(v)}</strong></div>
        <div class="meter"><i style="width:${Math.min(100, o * 100).toFixed(1)}%"></i></div>
      </div>`;
    }).join('');

    // Chaque montant va dans son mode de paiement : la location dans celui de la réservation, les draps dans le leur
    const pay = Object.keys(PAIEMENTS).map((k) => ({ k, v:
      sum(rs.filter((r) => r.paiement === k).map((r) => part(r, a, b)))
      + sum(avecDraps.filter((r) => (r.draps_paiement || r.paiement) === k).map((r) => drapsDans(r, a, b))) }));
    const payBar = total > 0 ? pay.filter((x) => x.v > 0).map((x) => `<i style="width:${(x.v / total * 100).toFixed(2)}%;background:var(${PAY_VAR[x.k]})"></i>`).join('') : '';
    const payLines = pay.map((x) => `<div class="pay-line"><i class="sw" style="background:var(${PAY_VAR[x.k]})"></i><span class="l">${PAIEMENTS[x.k]}${x.k === 'airbnb' ? ' (net)' : ''}</span><strong>${eur(x.v)}</strong><span class="p">${total > 0 ? pct(x.v / total) : '0 %'}</span></div>`).join('');

    return `
      <header class="page-head"><h1 class="h1">Récap</h1></header>
      <p class="print-only"><strong>${NOM} · Récap · ${label}</strong></p>
      <div class="seg seg-4 no-print" role="group" aria-label="Type de période">
        ${types.map(([k, t]) => `<button type="button" data-act="recap-type" data-v="${k}" aria-pressed="${R.type === k}">${t}</button>`).join('')}
      </div>
      ${nav}
      <section class="hero">
        <div><div class="k">Revenus · ${label}</div><div class="v">${eur(total)}</div></div>
        <div class="hero-stats">
          <div><b>${nts}</b><span>nuits louées</span></div>
          <div><b>${pct(occ)}</b><span>d'occupation</span></div>
          <div><b>${nts ? eur(location / nts) : '–'}</b><span>par nuit en moyenne</span></div>
        </div>
        ${dueP > 0.005 ? `<div class="due">Dont ${eur(dueP)} encore à encaisser</div>` : ''}
      </section>
      <div class="recap-grid">
        ${chart}
        <section class="card rsec"><h2 class="h2">Par appartement</h2><div>${parApt}</div></section>
        <section class="card rsec"><h2 class="h2">Par mode de paiement</h2><div class="paybar">${payBar}</div><div class="stack">${payLines}</div></section>
        <section class="card rsec">
          <h2 class="h2">Supplément draps</h2>
          <div class="draps-sum">
            <div><b>${avecDraps.length}</b><span>${avecDraps.length > 1 ? 'draps loués' : 'drap loué'}</span></div>
            <div><b>${eur(totalDraps)}</b><span>au total</span></div>
          </div>
          ${avecDraps.length ? `<div class="stack">${APTS.map((id) => {
            const x = avecDraps.filter((r) => r.appartement === id);
            return x.length ? `<div class="pay-line a${id}"><i class="sw"></i><span class="l">${esc(apt(id).nom)} · ${x.length}</span><strong>${eur(sum(x.map((r) => drapsDans(r, a, b))))}</strong></div>` : '';
          }).join('')}</div>` : '<p class="small muted">Aucun supplément draps sur cette période.</p>'}
        </section>
      </div>
      <p class="small muted" style="margin-top:14px">Un séjour à cheval sur deux périodes est réparti selon le nombre de nuits passées dans chacune. Les draps sont comptés à la date d'arrivée, et inclus dans les revenus.</p>
      <div class="actions-row no-print">
        <button type="button" class="btn btn-outline" data-act="export-period">${ic('download', 18)}Excel</button>
        <button type="button" class="btn btn-outline" data-act="print">${ic('print', 18)}PDF / Imprimer</button>
      </div>`;
  }

  function shiftRecap(dir) {
    const R = recapState();
    if (R.type === 'mois') { const d = new Date(Date.UTC(R.y, R.m + dir, 1)); R.y = d.getUTCFullYear(); R.m = d.getUTCMonth(); }
    if (R.type === 'semestre') { const k = R.y * 2 + R.s + dir; R.y = Math.floor(k / 2); R.s = k % 2; }
    if (R.type === 'annee') R.y += dir;
  }

  /* ================================================================
   * Réglages
   * ================================================================ */

  function viewReglages() {
    const ro = !canEdit();
    return `
      <header class="page-head"><h1 class="h1">Réglages</h1></header>
      <h2 class="section-label" style="margin-top:0">Appartements</h2>
      ${S.apts.map((x) => `
        <form class="card apt-form a${x.id}" data-apt-form="${x.id}" novalidate>
          <fieldset${ro ? ' disabled' : ''}>
            <div class="apt-form-head">
              <span class="badge sm">${x.id}</span>
              <input class="name-input" name="nom" value="${esc(x.nom)}" aria-label="Nom de l'appartement ${x.id}" maxlength="40">
              ${ro ? '' : '<button type="submit" class="btn btn-ghost btn-sm">Enregistrer</button>'}
            </div>
          </fieldset>
        </form>`).join('')}

      <h2 class="section-label">Accès</h2>
      <div class="card list-card">
        <div class="row-static">
          <span class="who"><span class="avatar">${ic(ro ? 'eye' : 'user', 20)}</span>
            <span>${esc(S.email)}<small>${ro ? 'Consultation seule' : 'Gestion complète'}</small></span></span>
        </div>
        <p class="small muted" style="padding:12px 16px">Pour ajouter ou retirer un accès, voir avec Aurélien.</p>
      </div>

      <h2 class="section-label">Données</h2>
      <div class="card list-card">
        <button type="button" class="row-static" data-act="export-all">Exporter toutes les réservations (Excel)${ic('download', 20)}</button>
        ${CLOUD
          ? '<div class="row-static">Sauvegarde en ligne<span class="pill pill-ok">Activée</span></div>'
          : '<div class="row-static">Mode démo, données sur cet appareil<button type="button" class="btn btn-ghost btn-sm" data-act="demo-reset">Réinitialiser</button></div>'}
      </div>
      ${CLOUD ? `<button type="button" class="btn btn-ghost btn-block" style="margin-top:24px" data-act="logout">Se déconnecter</button>` : ''}`;
  }

  /* ================================================================
   * Export Excel (CSV lisible par Excel)
   * ================================================================ */

  function exportCsv(rs, filename, a, b) {
    const withPeriod = a != null;
    const txt = (s) => {
      let v = String(s == null ? '' : s);
      if (/^[=+\-@]/.test(v)) v = "'" + v; // empêche Excel d'interpréter le texte comme une formule
      return v;
    };
    const cell = (v) => { const s = String(v == null ? '' : v); return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const num = (x) => (x == null || x === '' ? '' : round2(Number(x)).toFixed(2).replace('.', ','));
    const head = ['Client', 'Appartement', 'Arrivée', 'Départ', 'Nuits', 'Personnes', 'Canal', 'Paiement', 'Statut', 'Tarif', 'Draps', 'Paiement draps']
      .concat(withPeriod ? ['Nuits dans la période', 'Montant sur la période'] : [], ['Notes']);
    const lines = rs.slice().sort(byArr).map((r) => [
      txt(r.client), r.appartement, dFr(r.arrivee), dFr(r.depart), nights(r), r.personnes,
      CANAUX[r.canal] || r.canal, PAIEMENTS[r.paiement] || r.paiement, r.paye ? 'Payé' : 'À encaisser',
      num(r.tarif_reel), draps(r) ? num(draps(r)) : '', draps(r) ? (PAIEMENTS[r.draps_paiement] || '') : ''
    ].concat(withPeriod ? [inter(r, a, b), num(rev(r, a, b))] : [], [txt(r.notes)]).map(cell).join(';'));
    const csv = '﻿' + [head.map(cell).join(';')].concat(lines).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = filename;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  /* ================================================================
   * Événements
   * ================================================================ */

  async function onClick(e) {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const act = el.dataset.act;
    switch (act) {
      case 'open': go('#/reservation/' + encodeURIComponent(el.dataset.id)); break;
      case 'form-cancel': goBack(); break;
      case 'form-delete': {
        const id = decodeURIComponent(parseHash().seg[1] || '');
        const r = S.resas.find((x) => String(x.id) === id);
        if (!r || !confirm(`Supprimer la réservation de ${r.client} (${range(r)}) ?\nCette action est définitive.`)) return;
        el.disabled = true;
        try { await S.store.remove(r.id); await reload(); toast('Réservation supprimée'); goBack(); } catch (ex) { toast(traduireErreur(ex), true); el.disabled = false; }
        break;
      }
      case 'cal-prev': case 'cal-next': changerMois(act === 'cal-next' ? 1 : -1); break;
      case 'cal-today': S.cal = null; render(); break;
      case 'cal-add': go(`#/nouvelle?apt=${el.dataset.apt}&date=${el.dataset.date}`); break;
      case 'list-all': S.list.apt = 0; S.list.due = false; render(); break;
      case 'list-apt': { const v = Number(el.dataset.v); S.list.apt = S.list.apt === v ? 0 : v; render(); break; }
      case 'list-due': S.list.due = !S.list.due; render(); break;
      case 'goto-due': S.list = { q: '', apt: 0, due: true }; go('#/reservations'); break;
      case 'recap-mois': { const p = partsN(today()); recapState(); Object.assign(S.recap, { type: 'mois', y: p.y, m: p.m }); go('#/recap'); break; }
      case 'recap-type': recapState().type = el.dataset.v; render(); break;
      case 'recap-prev': shiftRecap(-1); render(); break;
      case 'recap-next': shiftRecap(1); render(); break;
      case 'export-period': {
        const { a, b, label } = recapPeriod();
        exportCsv(S.resas.filter((r) => inter(r, a, b) > 0), `locations-${label.toLowerCase().replace(/[^a-z0-9éèêàûôîç]+/gi, '-')}.csv`, a, b);
        break;
      }
      case 'print': window.print(); break;
      case 'export-all': exportCsv(S.resas, `locations-toutes-${fromN(today())}.csv`); break;
      case 'demo-reset':
        if (confirm('Remettre les données de démonstration de départ ?')) { LocalStore.reset(); await reload(); render(); toast('Démo réinitialisée'); }
        break;
      case 'logout': await S.store.signOut(); location.hash = ''; location.reload(); break;
    }
  }

  function onInput(e) {
    if (e.target.id === 'q') {
      S.list.q = e.target.value;
      const box = $('#list-results');
      if (box) box.innerHTML = listResults();
    }
  }

  function onChange(e) {
    const k = e.target.dataset.recap;
    if (k) { recapState()[k] = e.target.value; render(); }
  }

  async function onSubmit(e) {
    const form = e.target.closest('[data-apt-form]');
    if (!form) return;
    e.preventDefault();
    if (!canEdit()) return;
    const id = Number(form.dataset.aptForm);
    const nom = form.elements.nom.value.trim() || `Appartement ${id}`;
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      await S.store.updateApt(id, { nom });
      await reload();
      render();
      toast('Nom enregistré');
    } catch (ex) {
      toast(traduireErreur(ex), true);
      btn.disabled = false;
    }
  }

  boot();
})();
