// ══════════════════════════════════════════════════════════════════
//  TRADUCTIONS DES CINÉMATIQUES DE BRIEFING
//  Textes injectés via applyCineTexts() au moment du play.
//  L'ordre correspond aux steps non-vides du briefing de chaque niveau.
// ══════════════════════════════════════════════════════════════════
const BRIEFING_TEXTS = [
    // Niveau 0 — Jardin des Senteurs
    {
        fr: [
            "Mulhouse. Ville calme, bonne réputation. Exactement ce qu'il me fallait.",
            "Je me suis blessé l'orteil. Franchement, ça fait mal.",
            "Le médecin a dit : 'Reposez-vous.' Mais bon, je me faisait chier.",
            "Alors j'ai cherché un endroit tranquille. Pas trop de bruit. Pas trop de marche. Un peu de verdure.",
            "Le Jardin des Senteurs. Ça m'a intrigué.",
            "Quelques minutes à pied depuis l'Université Populaire. L'orteil va survivre.",
            "Allez. En route. Doucement.",
        ],
        en: [
            "Mulhouse. Quiet town, good reputation. Exactly what I needed.",
            "I hurt my toe. Seriously, it hurts. More than a prod bug on a Friday night.",
            "The doctor said: 'Get some rest.' But I was going insane just lying around.",
            "So I found somewhere calm. Not too noisy. Not too much walking. A bit of greenery.",
            "The Jardin des Senteurs. It intrigued me.",
            "A few minutes on foot from the Université Populaire. The toe will survive.",
            "Alright. Let's go. Slowly.",
        ],
    },
    // Niveau 1 — placeholder
    {
        fr: [ "Excellent travail ! L'aventure continue...", "Prochaine destination." ],
        en: [ "Excellent work! The adventure continues...", "Next destination." ],
    },
];

// =======
//  NIVEAUX
// =======
const LEVELS = [
    {
        destination: {
            lat: 47.729522781882245,
            lng: 7.301288857836423,
            name: "Jardin des Senteurs",
        },
        game: 'jeu1.html',
        briefing: [
            {
                background: '../assets/img/backgrounds/intro.jpg',
                music: ['../assets/sound/music/discussion.mp3', 0.2],
                actions: [
                    {
                        type: 'spawn', id: 'lehmann', x: -0.1, y: 0.84, scale: 3,
                        sprite: '../assets/img/characters/lehmann.svg',
                        anims: {
                            idle: { srcY: 4,  frames: 8, fps: 8,  frameW: 24, frameH: 44 },
                            walk: { srcY: 52, frames: 7, fps: 14, frameW: 24, frameH: 44 }
                        },
                        anim: 'walk'
                    },
                    { type: 'move', id: 'lehmann', x: 0.25, duration: 1800 },
                    { type: 'anim', id: 'lehmann', anim: 'idle' },
                ],
                speaker: 'lehmann',
                text: "Mulhouse. Ville calme, bonne réputation. Exactement ce qu'il me fallait.",
            },
            {
                speaker: 'lehmann',
                text: "Je me suis blessé l'orteil. Franchement, ça fait mal.",
            },
            {
                speaker: 'lehmann',
                text: "Le médecin a dit : 'Reposez-vous.' Mais bon, je me faisait chier.",
            },
            {
                speaker: 'lehmann',
                text: "Alors j'ai cherché un endroit tranquille. Pas trop de bruit. Pas trop de marche. Un peu de verdure.",
            },
            {
                speaker: 'lehmann',
                text: "Le Jardin des Senteurs. Ça m'a intrigué.",
            },
            {
                speaker: 'lehmann',
                text: "Quelques minutes à pied depuis l'Université Populaire. L'orteil va survivre.",
            },
            {
                speaker: 'lehmann',
                text: "Allez. En route. Doucement.",
            },
            {
                actions: [
                    { type: 'anim', id: 'lehmann', anim: 'walk' },
                    { type: 'flip', id: 'lehmann' },
                    { type: 'move', id: 'lehmann', x: 1.2, duration: 1200 },
                ],
                text: "",
            },
        ],
    },
    {
        destination: {
            lat: 48.5850,
            lng: 7.7480,
            name: "Prochaine Destination",
        },
        game: 'jeu2.html',
        briefing: [
            {
                background: '../assets/img/backgrounds/intro.jpg',
                music: ['../assets/sound/music/discussion.mp3', 0.2],
                actions: [
                    {
                        type: 'spawn', id: 'lehmann', x: -0.1, y: 0.84, scale: 3,
                        sprite: '../assets/img/characters/lehmann.svg',
                        anims: {
                            idle: { srcY: 4,  frames: 8, fps: 8,  frameW: 24, frameH: 44 },
                            walk: { srcY: 52, frames: 7, fps: 14, frameW: 24, frameH: 44 },
                        },
                        anim: 'walk'
                    },
                    { type: 'move', id: 'lehmann', x: 0.22, duration: 1400 },
                    { type: 'anim', id: 'lehmann', anim: 'idle' },
                ],
                speaker: 'lehmann',
                text: "Excellent travail ! L'aventure continue...",
            },
            {
                speaker: 'lehmann',
                text: "Direction la prochaine étape. Suis la carte !",
            },
            {
                actions: [
                    { type: 'anim', id: 'lehmann', anim: 'walk' },
                    { type: 'flip', id: 'lehmann' },
                    { type: 'move', id: 'lehmann', x: 1.2, duration: 1000 },
                ],
                text: "",
            },
        ],
    },
];

const ARRIVAL_RADIUS = 30; 

// ==========
//  PROGRESSION
// ==========
function getLevel() {
    return parseInt(localStorage.getItem('sebquest_level') || '0', 10);
}

// ===========
//  INITIALISATION
// ===========
window.addEventListener('load', () => {
    const level = getLevel();

    // Tous les niveaux terminés
    if (level >= LEVELS.length) {
        showFinished();
        return;
    }

    const canvas = document.getElementById('cinematicCanvas');

    function resizeCanvas() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const currentLevel = LEVELS[level];

    document.getElementById('map-destination-name').textContent = currentLevel.destination.name;

    Cinematic.play(canvas, applyCineTexts(currentLevel.briefing, BRIEFING_TEXTS[level][getLang()]), () => {
        canvas.style.display = 'none';
        document.getElementById('map-container').style.display = 'block';
        document.getElementById('carte-pause-btn').style.display = 'flex';
        initMap(currentLevel);
    });
});

// =====
//  CARTE
// =====
let map, userMarker, routeControl, watchId;
let arrived = false;

function initMap(level) {
    const dest = level.destination;

    map = L.map('map', { zoomControl: false, attributionControl: false })
            .setView([dest.lat, dest.lng], 15);

    L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 19 }
    ).addTo(map);

    const destIcon = L.divIcon({
        className: '',
        html: '<div class="dest-marker">🎯</div>',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
    });
    L.marker([dest.lat, dest.lng], { icon: destIcon })
     .addTo(map)
     .bindPopup(`<b>${dest.name}</b>`)
     .openPopup();

    if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
            pos => onPosition(pos, level),
            () => { document.getElementById('map-distance').textContent = t('carte.gps-unavail'); },
            { enableHighAccuracy: true, maximumAge: 4000, timeout: 15000 }
        );
    } else {
        document.getElementById('map-distance').textContent = t('carte.gps-unsupported');
    }
}

function onPosition(pos, level) {
    if (arrived) return;

    const { latitude: lat, longitude: lng } = pos.coords;
    const dest = level.destination;

    if (!userMarker) {
        const userIcon = L.divIcon({
            className: '',
            html: '<div class="user-marker"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9],
        });
        userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);

        map.fitBounds([[lat, lng], [dest.lat, dest.lng]], { padding: [60, 60] });
        fetchRoute(lat, lng, dest);
    } else {
        userMarker.setLatLng([lat, lng]);
        fetchRoute(lat, lng, dest);
    }

    const dist = haversine(lat, lng, dest.lat, dest.lng);
    const distStr = dist < 1000
        ? `${Math.round(dist)} m`
        : `${(dist / 1000).toFixed(2)} km`;
    document.getElementById('map-distance').textContent = t('carte.dist', { d: distStr });

    if (dist <= ARRIVAL_RADIUS) {
        triggerArrival(level);
    }
}

function triggerArrival(level) {
    arrived = true;
    navigator.geolocation.clearWatch(watchId);

    const overlay = document.getElementById('arrival-overlay');
    overlay.style.display = 'flex';

    setTimeout(() => {
        window.location.href = level.game;
    }, 2500);
}

// ==============
//  FIN DE L'AVENTURE
// ==============
function showFinished() {
    const overlay = document.getElementById('arrival-overlay');
    document.getElementById('arrival-title').textContent = t('carte.finished-title');
    document.getElementById('arrival-sub').textContent = t('carte.finished-sub');
    overlay.style.display = 'flex';
}

// =========
//  ROUTING PIÉTON
// =========
function fetchRoute(lat, lng, dest) {
    const url = `https://router.project-osrm.org/route/v1/foot/${lng},${lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;

    fetch(url)
        .then(r => r.json())
        .then(data => {
            if (!data.routes || data.routes.length === 0) return;
            const coords = data.routes[0].geometry.coordinates.map(([lo, la]) => [la, lo]);
            if (routeControl) map.removeLayer(routeControl);
            routeControl = L.polyline(coords, {
                color: '#FFAA2A',
                weight: 4,
                opacity: 0.85,
            }).addTo(map);
        })
        .catch(() => {
            // Fallback ligne droite si OSRM indisponible
            if (routeControl) map.removeLayer(routeControl);
            routeControl = L.polyline([[lat, lng], [dest.lat, dest.lng]], {
                color: '#FFAA2A',
                weight: 4,
                dashArray: '12, 8',
                opacity: 0.85,
            }).addTo(map);
        });
}

// =========
//  MENU PAUSE
// =========
document.getElementById('carte-pause-btn').addEventListener('click', () => {
    document.getElementById('carte-pause-menu').classList.add('open');
});

document.getElementById('carte-resume-btn').addEventListener('click', () => {
    document.getElementById('carte-pause-menu').classList.remove('open');
});

document.getElementById('carte-menu-btn').addEventListener('click', () => {
    window.location.href = '../index.html';
});

// ══════════════════════════════════════════════════════════════════
//  TRADUCTION — initialisation et réaction au changement de langue
// ══════════════════════════════════════════════════════════════════
applyLang();

window.addEventListener('langchange', () => {
    // applyLang() a déjà mis à jour les data-i18n.
    // La distance s'auto-mettra à jour au prochain callback GPS.
    // On rafraîchit le texte "GPS en attente" si la carte est visible et la distance statique.
    const distEl = document.getElementById('map-distance');
    if (distEl && distEl.getAttribute('data-i18n') === 'carte.searching') {
        distEl.textContent = t('carte.searching');
    }
});

// =========
//  UTILITAIRES
// =========
function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
            + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
            * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
