applyLang();

const blur_overlay = document.querySelector("#start_overlay");
const start_main_menu = document.querySelector("#start_overlay>button");
const hamburger_btn = document.querySelector("#hamburger_menu");
const nav = document.querySelector("#nav");

function playMusic(sound) {
    const music = new Audio(sound);
    music.loop = true;
    music.play();
}

function launch_start_menu() {
    blur_overlay.remove();
    playMusic('assets/sound/music/intro.mp3');
}

function open_menu() {
    nav.classList.toggle("nav_show");
}

start_main_menu.addEventListener("click", launch_start_menu);
hamburger_btn.addEventListener("click", open_menu);

// Lancement normal → pas de dev mode
document.querySelector('.start_game_btn').addEventListener('click', () => {
    localStorage.setItem('devMode', 'false');
});

// Lancement depuis le menu hamburger → dev mode
document.querySelectorAll('#nav a[href]').forEach(link => {
    if (!link.getAttribute('href')) return;
    link.addEventListener('click', () => {
        localStorage.setItem('devMode', 'true');
    });
});

const resetBtn = document.getElementById('reset-btn');
const resetOverlay = document.getElementById('reset-confirm-overlay');
const resetYes = document.getElementById('reset-confirm-yes');
const resetNo = document.getElementById('reset-confirm-no');

resetBtn.addEventListener('click', () => {
    resetOverlay.classList.add('open');
});

resetNo.addEventListener('click', () => {
    resetOverlay.classList.remove('open');
});

resetYes.addEventListener('click', () => {
    localStorage.removeItem('sebquest_level');
    resetOverlay.classList.remove('open');
});