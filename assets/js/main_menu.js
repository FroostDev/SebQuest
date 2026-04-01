const blur_overlay = document.querySelector("#start_overlay");
const start_main_menu = document.querySelector("#start_overlay>button");
const hamburger_btn = document.querySelector("#hamburger_menu");
const nav = document.querySelector("#nav");

function playMusic(sound) {
    const music = new Audio(sound);
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