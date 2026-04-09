const TRANSLATIONS = {
    fr: {
        // ── Menu principal ─────────────────────────────────────────
        'menu.enter':   'Commencer',
        'menu.start':   'Demarrer',
        'menu.reset':   'Recommencer depuis le début',
        'reset.text':   'Ta progression sera effacée.<br>Es-tu sûr ?',
        'reset.yes':    'Oui',
        'reset.no':     'Non',

        // ── Jeu commun ─────────────────────────────────────────────
        'game.launch':      'Commencer',
        'game.play':        'JOUER',
        'game.resume':      'Reprendre',
        'game.back-menu':   'Retour au menu',
        'game.skip-radar':  'Passer au radar',
        'game.skip-target': 'La cible est impossible<br>à atteindre ? Clique ici',
        'game.win':         'Gagner la partie',
        'game.restart':     'Recommencer',

        // ── Partie pigeon ──────────────────────────────────────────
        'pigeon.hint-mobile': "Incline ton téléphone pour viser.<br>Tape l'écran pour lâcher une bombe.",
        'pigeon.hint-pc':     '← → ou A D pour viser.<br>Espace ou clic pour lâcher une bombe.',
        'pigeon.tap-replay':  'Tape pour rejouer',

        // ── Partie radar ───────────────────────────────────────────
        'radar.title':       'RADAR ODORANT',
        'radar.hint-mobile': 'Utilise le GPS et la boussole<br>pour trouver les 3 cibles.',
        'radar.hint-pc':     'Déplace-toi pour trouver les 3 cibles<br>affichées sur le radar.',

        // ── Carte ──────────────────────────────────────────────────
        'carte.mission':         'MISSION',
        'carte.searching':       'Recherche GPS...',
        'carte.resume':          'Reprendre',
        'carte.back-menu':       'Retour au menu',
        'carte.arrival-title':   'Zone atteinte !',
        'carte.arrival-sub':     'Le jeu démarre...',
        'carte.arrived':         'Arrivé !',
        'carte.gps-wait':        'GPS en attente...',
        'carte.gps-unavail':     'GPS indisponible',
        'carte.gps-unsupported': 'GPS non supporté',
        'carte.finished-title':  'Aventure terminée !',
        'carte.finished-sub':    'Tu as complété toutes les étapes. Bravo !',
        'carte.dist':            'Distance : {d}',
    },
    en: {
        // ── Main menu ──────────────────────────────────────────────
        'menu.enter':   'Start',
        'menu.start':   'Start',
        'menu.reset':   'Restart from the beginning',
        'reset.text':   'Your progress will be deleted.<br>Are you sure?',
        'reset.yes':    'Yes',
        'reset.no':     'No',

        // ── Game common ────────────────────────────────────────────
        'game.launch':      'Start',
        'game.play':        'PLAY',
        'game.resume':      'Resume',
        'game.back-menu':   'Back to menu',
        'game.skip-radar':  'Skip to radar',
        'game.skip-target': 'Target unreachable?<br>Tap here',
        'game.win':         'Win the game',
        'game.restart':     'Restart',

        // ── Pigeon phase ───────────────────────────────────────────
        'pigeon.hint-mobile': 'Tilt your phone to aim.<br>Tap the screen to drop a bomb.',
        'pigeon.hint-pc':     '← → or A D to aim.<br>Space or click to drop a bomb.',
        'pigeon.tap-replay':  'Tap to replay',

        // ── Radar phase ────────────────────────────────────────────
        'radar.title':       'SCENT RADAR',
        'radar.hint-mobile': 'Use GPS and compass<br>to find the 3 targets.',
        'radar.hint-pc':     'Move around to find<br>the 3 targets on the radar.',

        // ── Map ────────────────────────────────────────────────────
        'carte.mission':         'MISSION',
        'carte.searching':       'Looking for GPS...',
        'carte.resume':          'Resume',
        'carte.back-menu':       'Back to menu',
        'carte.arrival-title':   'Area reached!',
        'carte.arrival-sub':     'Launching game...',
        'carte.arrived':         'Arrived!',
        'carte.gps-wait':        'Waiting for GPS...',
        'carte.gps-unavail':     'GPS unavailable',
        'carte.gps-unsupported': 'GPS not supported',
        'carte.finished-title':  'Adventure complete!',
        'carte.finished-sub':    'You completed every step. Well done!',
        'carte.dist':            '{d} away',
    }
};

// ── Helpers ────────────────────────────────────────────────────

function getLang() {
    return localStorage.getItem('gamelang') || 'fr';
}

function setLang(lang) {
    localStorage.setItem('gamelang', lang);
}

/**
 * Retourne la chaîne traduite pour la clé donnée.
 * Supporte les variables : t('carte.dist', { d: '200 m' })
 */
function t(key, vars) {
    const lang = getLang();
    let str = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key])
           || TRANSLATIONS.fr[key]
           || key;
    if (vars) {
        Object.keys(vars).forEach(k => {
            str = str.replace('{' + k + '}', vars[k]);
        });
    }
    return str;
}

/**
 * Met à jour tous les éléments [data-i18n] / [data-i18n-html]
 * et rafraîchit le texte des boutons .lang-toggle-btn.
 */
function applyLang() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
        btn.innerHTML = getLang() === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR';
    });
}

/**
 * Bascule entre FR et EN, applique les traductions
 * et dispatche l'événement 'langchange' pour que les JS réagissent.
 */
function toggleLang() {
    setLang(getLang() === 'fr' ? 'en' : 'fr');
    applyLang();
    window.dispatchEvent(new Event('langchange'));
}

/**
 * Injecte un tableau de textes traduits dans les steps d'une cinématique.
 * Seuls les steps avec text non-vide consomment un index dans le tableau.
 * @param {Array} cine   - Array de steps cinématiques (original, non modifié)
 * @param {string[]} texts - Textes traduits dans l'ordre des steps non-vides
 * @returns {Array} Nouveau array avec les textes remplacés
 */
function applyCineTexts(cine, texts) {
    let i = 0;
    return cine.map(step => {
        if (step.text !== undefined && step.text !== '') {
            return Object.assign({}, step, { text: texts[i++] });
        }
        return step;
    });
}
