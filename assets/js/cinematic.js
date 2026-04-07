// ════════════════════════════════════════════════════════════════
//                    MOTEUR DE CINEMATIQUES
// ════════════════════════════════════════════════════════════════
//
// Usage :
//   Cinematic.play(canvas, steps, onComplete)
//
// Format d'un step :
//   {
//     background: '#0e0e1a',           // couleur ou chemin image (optionnel, garde le précédent)
//     actions: [                        // animations AVANT le dialogue (optionnel)
//       { type:'spawn',  id:'hero', x:.3, y:.7, w:88, h:64, color:'#b4cde8', ... },
//       { type:'move',   id:'hero', x:.5, duration:1200 },
//       { type:'remove', id:'hero' },
//       { type:'wait',   duration:500 },
//       { type:'flip',   id:'hero' },
//       { type:'label',  id:'hero', label:'SEB' },
//     ],
//     speaker: 'hero',                 // id de l'entité qui parle → bulle au-dessus de sa tête
//     text: "Salut !",                 // texte typewriter
//   }
//
// Coords x/y : 0-1 relatifs au canvas entier. x=0 gauche, x=1 droite, y=0 haut, y=1 bas.
//   Négatif ou >1 = hors écran. On positionne le CENTRE du perso.

const Cinematic = (() => {

    // ── CONFIG ───────────────────────────────────────────────
    const TYPEWRITER_SPEED  = 35;   // ms par lettre
    const BUBBLE_PADDING    = 10;
    const BUBBLE_MAX_WIDTH  = 220;  // largeur max de la bulle en px
    const FONT_SIZE         = 14;
    const FONT_FAMILY       = '"Retro", monospace';
    const INDICATOR_BLINK   = 500;
    const LINE_HEIGHT       = 1.45;
    const BUBBLE_GAP        = 10;   // espace entre la tête du perso et la bulle
    const TAIL_SIZE         = 8;    // taille du petit triangle

    // ── ETAT ─────────────────────────────────────────────────
    let _ctx, _canvas, _steps, _onComplete;
    let _stepIdx, _charIdx, _revealed;
    let _typing, _typeTimer;
    let _active = false;
    let _animId = null;
    let _background = '#0e0e1a';
    let _bgImage = null;
    let _bgCache = {};

    // Personnages vivants (persistent entre les steps)
    let _entities = {};

    // Animation en cours
    let _animQueue = [];
    let _currentAnim = null;
    let _animStart = 0;
    let _waitingForActions = false;

    // ── UTILITAIRES ──────────────────────────────────────────

    /** Convertit coords relatives (0-1) en pixels sur le canvas entier. */
    function toPixel(rx, ry, ew, eh) {
        return {
            px: rx * _canvas.width - ew / 2,
            py: ry * _canvas.height - eh / 2
        };
    }

    /** Découpe un texte en lignes qui tiennent dans maxW pixels. */
    function wrapText(text, maxW) {
        const words = text.split(' ');
        const lines = [];
        let line = '';
        for (const word of words) {
            const test = line ? line + ' ' + word : word;
            if (_ctx.measureText(test).width > maxW && line) {
                lines.push(line);
                line = word;
            } else {
                line = test;
            }
        }
        if (line) lines.push(line);
        return lines;
    }

    // ── ACTIONS / ANIMATIONS ─────────────────────────────────

    function processActions() {
        if (!_active) return;

        if (_currentAnim) {
            const elapsed = Date.now() - _animStart;
            const t = Math.min(1, elapsed / _currentAnim.duration);
            const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

            const e = _entities[_currentAnim.id];
            if (e) {
                e.x = _currentAnim.fromX + (_currentAnim.toX - _currentAnim.fromX) * ease;
                e.y = _currentAnim.fromY + (_currentAnim.toY - _currentAnim.fromY) * ease;
            }
            if (t >= 1) _currentAnim = null;
            return;
        }

        if (_animQueue.length === 0) {
            _waitingForActions = false;
            startTyping();
            return;
        }

        const action = _animQueue.shift();

        switch (action.type) {
            case 'spawn': {
                _entities[action.id] = {
                    x: action.x ?? 0.5,
                    y: action.y ?? 0.5,
                    w: action.w || 44,
                    h: action.h || 64,
                    color: action.color || '#b4cde8',
                    highlight: action.highlight || null,
                    outline: action.outline || '#6a94be',
                    label: action.label || null,
                    flip: action.flip || false,
                };
                break;
            }
            case 'move': {
                const e = _entities[action.id];
                if (!e) break;
                _currentAnim = {
                    id: action.id,
                    fromX: e.x, fromY: e.y,
                    toX: action.x ?? e.x,
                    toY: action.y ?? e.y,
                    duration: action.duration || 1000,
                };
                _animStart = Date.now();
                return;
            }
            case 'remove': {
                delete _entities[action.id];
                break;
            }
            case 'flip': {
                const e = _entities[action.id];
                if (e) e.flip = action.flip ?? !e.flip;
                break;
            }
            case 'wait': {
                _currentAnim = { id: '__wait', duration: action.duration || 500 };
                _animStart = Date.now();
                return;
            }
            case 'label': {
                const e = _entities[action.id];
                if (e) e.label = action.label;
                break;
            }
        }

        processActions();
    }

    // ── RENDU ────────────────────────────────────────────────

    function render() {
        if (!_active) return;
        const w = _canvas.width;
        const h = _canvas.height;
        const step = _steps[_stepIdx];

        // ── Fond
        if (_bgImage && _bgImage.complete) {
            _ctx.drawImage(_bgImage, 0, 0, w, h);
        } else {
            _ctx.fillStyle = _background;
            _ctx.fillRect(0, 0, w, h);
        }

        // ── Entités
        if (_waitingForActions) processActions();

        for (const id in _entities) {
            const e = _entities[id];
            const pos = toPixel(e.x, e.y, e.w, e.h);

            _ctx.save();
            if (e.flip) {
                _ctx.translate(pos.px + e.w, pos.py);
                _ctx.scale(-1, 1);
            } else {
                _ctx.translate(pos.px, pos.py);
            }

            _ctx.fillStyle = e.color;
            _ctx.fillRect(0, 0, e.w, e.h);

            if (e.highlight) {
                _ctx.fillStyle = e.highlight;
                _ctx.fillRect(4, 4, e.w - 8, Math.max(6, e.h * 0.2));
            }

            _ctx.strokeStyle = e.outline;
            _ctx.lineWidth = 2;
            _ctx.strokeRect(0, 0, e.w, e.h);

            if (e.label) {
                _ctx.fillStyle = '#fff';
                _ctx.font = 'bold 9px monospace';
                _ctx.textAlign = 'center';
                _ctx.textBaseline = 'middle';
                _ctx.fillText(e.label, e.w / 2, e.h / 2);
            }

            _ctx.restore();
        }

        // ── Bulle de dialogue au-dessus du speaker
        if (!_waitingForActions && step.text && step.speaker) {
            const speakerEntity = _entities[step.speaker];
            if (speakerEntity) {
                const pos = toPixel(speakerEntity.x, speakerEntity.y, speakerEntity.w, speakerEntity.h);
                const centerX = pos.px + speakerEntity.w / 2;
                const topY = pos.py;

                _ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
                const textMaxW = BUBBLE_MAX_WIDTH - BUBBLE_PADDING * 2;
                const fullLines = wrapText(step.text, textMaxW);
                const visLines = wrapText(_revealed, textMaxW);

                const lineH = FONT_SIZE * LINE_HEIGHT;
                const textH = fullLines.length * lineH;
                const bubbleH = textH + BUBBLE_PADDING * 2;

                // Largeur = la plus large ligne du texte complet (pour pas que ca bouge)
                let maxLineW = 0;
                for (const l of fullLines) {
                    const lw = _ctx.measureText(l).width;
                    if (lw > maxLineW) maxLineW = lw;
                }
                const bubbleW = maxLineW + BUBBLE_PADDING * 2;

                // Position de la bulle : centrée au-dessus du perso
                let bubbleX = centerX - bubbleW / 2;
                const bubbleY = topY - BUBBLE_GAP - TAIL_SIZE - bubbleH;

                // Clamp pour pas sortir de l'écran
                if (bubbleX < 6) bubbleX = 6;
                if (bubbleX + bubbleW > w - 6) bubbleX = w - 6 - bubbleW;

                // Bulle blanche pixel art
                _ctx.fillStyle = '#fff';
                _ctx.fillRect(bubbleX, bubbleY, bubbleW, bubbleH);
                _ctx.strokeStyle = '#222';
                _ctx.lineWidth = 2;
                _ctx.strokeRect(bubbleX, bubbleY, bubbleW, bubbleH);

                // Petit triangle vers le perso
                const tailX = Math.max(bubbleX + 12, Math.min(centerX, bubbleX + bubbleW - 12));
                _ctx.fillStyle = '#fff';
                _ctx.beginPath();
                _ctx.moveTo(tailX - TAIL_SIZE, bubbleY + bubbleH);
                _ctx.lineTo(tailX, bubbleY + bubbleH + TAIL_SIZE);
                _ctx.lineTo(tailX + TAIL_SIZE, bubbleY + bubbleH);
                _ctx.closePath();
                _ctx.fill();
                // Bords du triangle
                _ctx.strokeStyle = '#222';
                _ctx.lineWidth = 2;
                _ctx.beginPath();
                _ctx.moveTo(tailX - TAIL_SIZE, bubbleY + bubbleH);
                _ctx.lineTo(tailX, bubbleY + bubbleH + TAIL_SIZE);
                _ctx.lineTo(tailX + TAIL_SIZE, bubbleY + bubbleH);
                _ctx.stroke();
                // Cacher la ligne du haut du triangle (overlap avec la bulle)
                _ctx.fillStyle = '#fff';
                _ctx.fillRect(tailX - TAIL_SIZE, bubbleY + bubbleH - 2, TAIL_SIZE * 2, 4);

                // Texte
                _ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
                _ctx.fillStyle = '#1a1a1a';
                _ctx.textAlign = 'left';
                _ctx.textBaseline = 'top';
                for (let i = 0; i < visLines.length; i++) {
                    _ctx.fillText(visLines[i], bubbleX + BUBBLE_PADDING, bubbleY + BUBBLE_PADDING + i * lineH);
                }

                // ▼ clignotant
                if (!_typing) {
                    const blink = Math.floor(Date.now() / INDICATOR_BLINK) % 2 === 0;
                    if (blink) {
                        _ctx.fillStyle = '#888';
                        _ctx.font = `bold 12px ${FONT_FAMILY}`;
                        _ctx.textAlign = 'right';
                        _ctx.textBaseline = 'bottom';
                        _ctx.fillText('\u25BC', bubbleX + bubbleW - 6, bubbleY + bubbleH - 4);
                    }
                }
            }
        }

        _animId = requestAnimationFrame(render);
    }

    // ── TYPEWRITER ───────────────────────────────────────────

    function startTyping() {
        const step = _steps[_stepIdx];
        if (!step || !step.text) {
            _typing = false;
            _revealed = '';
            if (!_waitingForActions) {
                setTimeout(() => { if (_active) advanceStep(); }, 100);
            }
            return;
        }
        _charIdx = 0;
        _revealed = '';
        _typing = true;
        clearInterval(_typeTimer);
        _typeTimer = setInterval(() => {
            if (_charIdx < step.text.length) {
                _revealed += step.text[_charIdx];
                _charIdx++;
            } else {
                _typing = false;
                clearInterval(_typeTimer);
            }
        }, TYPEWRITER_SPEED);
    }

    function skipTyping() {
        const step = _steps[_stepIdx];
        if (!step || !step.text) return;
        clearInterval(_typeTimer);
        _revealed = step.text;
        _typing = false;
    }

    // ── NAVIGATION ───────────────────────────────────────────

    function beginStep() {
        const step = _steps[_stepIdx];
        if (!step) return;

        if (step.background) {
            _background = step.background;
            if (/\.(png|jpe?g|gif|webp|svg)$/i.test(step.background)) {
                if (_bgCache[step.background]) {
                    _bgImage = _bgCache[step.background];
                } else {
                    const img = new Image();
                    img.src = step.background;
                    _bgCache[step.background] = img;
                    _bgImage = img;
                }
            } else {
                _bgImage = null;
            }
        }

        if (step.actions && step.actions.length > 0) {
            _animQueue = [...step.actions];
            _waitingForActions = true;
            _currentAnim = null;
        } else {
            _waitingForActions = false;
            startTyping();
        }
    }

    function advanceStep() {
        if (_stepIdx < _steps.length - 1) {
            _stepIdx++;
            beginStep();
        } else {
            stop();
            if (_onComplete) _onComplete();
        }
    }

    function advance() {
        if (!_active) return;
        if (_waitingForActions) return;

        if (_typing) {
            skipTyping();
            return;
        }

        advanceStep();
    }

    // ── EVENTS ───────────────────────────────────────────────

    function onTap(e) {
        if (e.type === 'touchstart') e.preventDefault();
        advance();
    }

    function onKey(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            advance();
        }
    }

    function bindEvents() {
        _canvas.addEventListener('click', onTap);
        _canvas.addEventListener('touchstart', onTap, { passive: false });
        window.addEventListener('keydown', onKey);
    }

    function unbindEvents() {
        _canvas.removeEventListener('click', onTap);
        _canvas.removeEventListener('touchstart', onTap);
        window.removeEventListener('keydown', onKey);
    }

    // ── API PUBLIQUE ─────────────────────────────────────────

    function play(canvas, steps, onComplete) {
        _canvas = canvas;
        _ctx = canvas.getContext('2d');
        _steps = steps;
        _onComplete = onComplete;
        _stepIdx = 0;
        _charIdx = 0;
        _revealed = '';
        _typing = false;
        _active = true;
        _entities = {};
        _animQueue = [];
        _currentAnim = null;
        _waitingForActions = false;
        _background = '#0e0e1a';
        _bgImage = null;

        clearInterval(_typeTimer);
        if (_animId) cancelAnimationFrame(_animId);

        bindEvents();
        beginStep();
        render();
    }

    function stop() {
        _active = false;
        clearInterval(_typeTimer);
        if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
        unbindEvents();
    }

    function isPlaying() {
        return _active;
    }

    return { play, stop, isPlaying };

})();
