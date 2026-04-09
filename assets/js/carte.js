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
                            walk: { srcY: 52, frames: 7, fps: 14, frameW: 24, frameH: 44 },
                        },
                        anim: 'walk'
                    },
                    { type: 'move', id: 'lehmann', x: 0.22, duration: 1400 },
                    { type: 'anim', id: 'lehmann', anim: 'idle' },
                ],
                speaker: 'lehmann',
                text: "Écoute bien, jeune aventurier !",
            },
            {
                speaker: 'lehmann',
                text: "Pour démarrer ta quête, tu dois d'abord rejoindre le Jardin des Senteurs !",
            },
            {
                speaker: 'lehmann',
                text: "Suis l'itinéraire sur la carte. Le jeu se lancera automatiquement une fois sur place !",
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

    Cinematic.play(canvas, currentLevel.briefing, () => {
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
            () => { document.getElementById('map-distance').textContent = 'GPS indisponible'; },
            { enableHighAccuracy: true, maximumAge: 4000, timeout: 15000 }
        );
    } else {
        document.getElementById('map-distance').textContent = 'GPS non supporté';
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

        routeControl = L.polyline([[lat, lng], [dest.lat, dest.lng]], {
            color: '#FFAA2A',
            weight: 4,
            dashArray: '12, 8',
            opacity: 0.85,
        }).addTo(map);

        map.fitBounds([[lat, lng], [dest.lat, dest.lng]], { padding: [60, 60] });
    } else {
        userMarker.setLatLng([lat, lng]);
        if (routeControl) {
            routeControl.setLatLngs([[lat, lng], [dest.lat, dest.lng]]);
        }
    }

    const dist = haversine(lat, lng, dest.lat, dest.lng);
    const distStr = dist < 1000
        ? `${Math.round(dist)} m`
        : `${(dist / 1000).toFixed(2)} km`;
    document.getElementById('map-distance').textContent = `Distance : ${distStr}`;

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
    document.getElementById('arrival-title').textContent = 'Aventure terminée !';
    document.getElementById('arrival-sub').textContent = 'Tu as complété toutes les étapes. Bravo !';
    overlay.style.display = 'flex';
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
