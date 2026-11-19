/* ==========================================================================
   I18N — English / French
   Markup:  data-i18n="key"              → element innerHTML
            data-i18n-attr="attr:key,…"  → attributes (aria-label, content…)
            data-wa                      → WhatsApp link, message in the active language
            data-views + data-date       → "169K views • Jan 11, 2026" (portfolio)
   Load before script.js so the page is already in the right language when
   animations (SplitText) measure the titles.
   ========================================================================== */
(() => {
  const WA_NUMBER = '250791207108';

  const STRINGS = {
    en: {
      'meta.title': 'Ocompos — Recording, Mixing & Mastering Engineer',
      'meta.desc': 'Ocompos records, mixes and masters rap and urban music for independent artists. Hear the before and after, then book your session on WhatsApp.',
      'skip': 'skip to content',
      'lang.label': 'Passer le site en français',

      'nav.work': 'Work',
      'nav.ab': 'Before/After',
      'nav.youtube': 'YouTube',
      'nav.services': 'Services',
      'nav.about': 'About',
      'nav.book': 'Book a session',
      'nav.bookShort': 'Book',
      'dock.book': 'Book a session',
      'menu.open': 'menu',
      'menu.close': 'close menu',

      'hero.title': 'Turning emotion <span class="highlight">into sound</span>',
      'hero.sub': 'Recording • Mix • Mastering',
      'hero.book': 'Book a session',
      'hero.listen': 'Hear my work',

      'sounds.title': 'selected work',
      'player.track': 'track',
      'sounds.youtube': 'Full playlist on YouTube',
      'player.by': 'Mixed & mastered by Ocompos',
      'player.prev': 'previous track',
      'player.next': 'next track',
      'player.play': 'play',
      'player.pause': 'pause',
      'player.seek': 'seek',
      'player.tracks': 'tracks',
      'player.choose': 'choose a track',
      'player.playing': 'playing',
      'player.paused': 'paused',
      'player.soon': 'coming soon',
      'player.empty': 'tracks coming soon',
      'player.emptyMeta': 'new releases are being added',

      'ab.title': 'hear the difference',
      'ab.before': 'Before',
      'ab.after': 'After',
      'ab.raw': 'RAW / ORIGINAL',
      'ab.final': 'MIXED / MASTERED',
      'ab.loading': 'loading…',
      'ab.unavailable': 'this comparison is not available yet',
      'ab.soon': 'soon',
      'ab.tracks': 'comparison tracks',
      'ab.version': 'version',



      'chain.title': 'from the booth to the release',
      'chain.rec.h': 'Rec',
      'chain.rec.p': 'In the studio, or send your stems',
      'chain.mix.h': 'Mix',
      'chain.mix.p': 'Every sound in its place',
      'chain.master.h': 'Master',
      'chain.master.p': 'Loud on any speaker',
      'chain.release.h': 'Release',
      'chain.release.p': 'Spotify, Apple Music, YouTube',

      'collab.title': 'they <span class="purple-italic">trusted me.</span>',

      'about.title': 'about me',
      'about.body': 'I’m Ocompos, a sound engineer working with rap and urban artists. My job is simple: make your record sound like the version you hear in your head. Clear vocals, weight in the low end, and a master that holds up next to anything on your playlist. Every session starts with listening to you: your references, your energy, your story.',

      'contact.title': 'ready to sound finished?',
      'contact.lead': 'Tell me about your project. Recording, mixing or mastering, it all starts with one message.',
      'contact.book': 'Book on WhatsApp',
      'contact.social': 'Social links',
      'newtab': '(opens in new tab)',

      'footer.copy': '© 2026 BYOCOMPOS. ALL RIGHTS RESERVED.',
      'wa.msg': 'Hi Ocompos, I’d like to book a session.\n\nProject (recording / mix / master):\nArtist name:\nPreferred date:',

      'video.player': 'video player',
      'close': 'close',
      'cover.art': 'cover art',
      'card.video': 'play video: ',
      'card.cover': 'view cover: ',

      'pf.filters.all': 'all',
      'pf.filters.videos': 'videos',
      'pf.filters.cover': 'cover art',
      'pf.tag.video': 'music video',
      'pf.tag.cover': 'cover art',
      'pf.views': 'views'
    },

    fr: {
      'meta.title': 'Ocompos — Ingénieur du son : enregistrement, mix & mastering',
      'meta.desc': 'Ocompos enregistre, mixe et masterise le rap et les musiques urbaines des artistes indépendants. Écoute l’avant/après, puis réserve ta session sur WhatsApp.',
      'skip': 'aller au contenu',
      'lang.label': 'Switch the site to English',

      'nav.work': 'Sons',
      'nav.ab': 'Avant/Après',
      'nav.youtube': 'YouTube',
      'nav.services': 'Services',
      'nav.about': 'À propos',
      'nav.book': 'Réserver une session',
      'nav.bookShort': 'Réserver',
      'dock.book': 'Réserver une session',
      'menu.open': 'menu',
      'menu.close': 'fermer le menu',

      'hero.title': 'Transformer l’émotion <span class="highlight">en son</span>',
      'hero.sub': 'Enregistrement • Mix • Mastering',
      'hero.book': 'Réserver une session',
      'hero.listen': 'Écouter mes sons',

      'sounds.title': 'sélection',
      'player.track': 'titre',
      'sounds.youtube': 'La playlist sur YouTube',
      'player.by': 'Mixé & masterisé par Ocompos',
      'player.prev': 'titre précédent',
      'player.next': 'titre suivant',
      'player.play': 'lecture',
      'player.pause': 'pause',
      'player.seek': 'position',
      'player.tracks': 'titres',
      'player.choose': 'choisir un titre',
      'player.playing': 'lecture de',
      'player.paused': 'en pause',
      'player.soon': 'bientôt disponible',
      'player.empty': 'titres bientôt disponibles',
      'player.emptyMeta': 'de nouvelles sorties arrivent',

      'ab.title': 'entends la différence',
      'ab.before': 'Avant',
      'ab.after': 'Après',
      'ab.raw': 'BRUT / ORIGINAL',
      'ab.final': 'MIXÉ / MASTERISÉ',
      'ab.loading': 'chargement…',
      'ab.unavailable': 'cette comparaison arrive bientôt',
      'ab.soon': 'bientôt',
      'ab.tracks': 'titres à comparer',
      'ab.version': 'version',



      'chain.title': 'de la cabine à la sortie',
      'chain.rec.h': 'Rec',
      'chain.rec.p': 'En studio, ou envoie tes pistes',
      'chain.mix.h': 'Mix',
      'chain.mix.p': 'Chaque son à sa place',
      'chain.master.h': 'Master',
      'chain.master.p': 'Puissant sur toutes les enceintes',
      'chain.release.h': 'Sortie',
      'chain.release.p': 'Spotify, Apple Music, YouTube',

      'collab.title': 'ils m’ont fait <span class="purple-italic">confiance.</span>',

      'about.title': 'qui suis-je ?',
      'about.body': 'Je suis Ocompos, ingénieur du son au service des artistes rap et urbains. Mon rôle est simple : faire sonner ton morceau comme la version que tu entends dans ta tête. Une voix claire, du poids dans les basses, et un master qui tient face à n’importe quel titre de ta playlist. Chaque session commence par l’écoute : tes références, ton énergie, ton histoire.',

      'contact.title': 'prêt à finaliser ton son ?',
      'contact.lead': 'Parle-moi de ton projet. Enregistrement, mix ou mastering : tout commence par un message.',
      'contact.book': 'Réserver sur WhatsApp',
      'contact.social': 'Réseaux sociaux',
      'newtab': '(nouvel onglet)',

      'footer.copy': '© 2026 BYOCOMPOS. TOUS DROITS RÉSERVÉS.',
      'wa.msg': 'Salut Ocompos, je souhaite réserver une session.\n\nProjet (enregistrement / mix / master) :\nNom d’artiste :\nDate souhaitée :',

      'video.player': 'lecteur vidéo',
      'close': 'fermer',
      'cover.art': 'pochette',
      'card.video': 'lire la vidéo : ',
      'card.cover': 'voir la pochette : ',

      'pf.filters.all': 'tout',
      'pf.filters.videos': 'clips',
      'pf.filters.cover': 'pochettes',
      'pf.tag.video': 'clip',
      'pf.tag.cover': 'pochette',
      'pf.views': 'vues'
    }
  };

  const KEY = 'ocompos-lang';
  const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const save = (v) => { try { localStorage.setItem(KEY, v); } catch (e) { /* private mode */ } };

  const initial = () => {
    // ?lang=fr / ?lang=en wins: it is what the hreflang links and shared URLs point at.
    try {
      const q = new URLSearchParams(location.search).get('lang');
      if (q && STRINGS[q]) return q;
    } catch (e) { /* old browser */ }
    const saved = read();
    if (saved && STRINGS[saved]) return saved;
    const nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
    return nav.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  };

  let lang = initial();
  const t = (key, fallback) => (STRINGS[lang] && STRINGS[lang][key]) ?? STRINGS.en[key] ?? fallback ?? key;

  const fmtDate = (iso) => {
    const d = new Date(iso + 'T12:00:00');
    if (isNaN(d)) return iso;
    return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-US',
      { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  };

  // Titles split into words by GSAP SplitText must be reverted before their
  // text changes, then split again (script.js exposes window.__splitTitle).
  const setHTML = (el, html) => {
    if (el.innerHTML === html) return;
    const split = el.__split;
    if (split) { split.revert(); el.__split = null; }
    el.innerHTML = html;
    if (split && window.__splitTitle) window.__splitTitle(el);
  };

  const apply = () => {
    const root = document.documentElement;
    root.lang = lang;
    root.dataset.lang = lang;

    const page = 'meta.';
    document.title = t(page + 'title');
    document.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]')
      .forEach(m => m.setAttribute('content', t(page + 'desc')));

    document.querySelectorAll('[data-i18n]').forEach(el => setHTML(el, t(el.dataset.i18n)));

    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(',').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });

    document.querySelectorAll('[data-wa]').forEach(a => {
      a.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(t('wa.msg'));
    });

    document.querySelectorAll('[data-views][data-date]').forEach(el => {
      el.textContent = el.dataset.views + ' ' + t('pf.views') + ' • ' + fmtDate(el.dataset.date);
    });

    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.setAttribute('aria-label', t('lang.label'));
      btn.querySelectorAll('[data-lang]').forEach(s =>
        s.classList.toggle('is-active', s.dataset.lang === lang));
    });

    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  };

  const setLang = (next) => {
    if (!STRINGS[next] || next === lang) return;
    lang = next;
    save(lang);
    apply();
  };

  window.i18n = { t, apply, setLang, get lang() { return lang; } };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-toggle');
    if (btn) setLang(lang === 'fr' ? 'en' : 'fr');
  });

  apply();
})();
