// =======================
// STATE (app data)
// =======================

let songs = [];
let currentSongIndex = 0;

// =======================
// DOM ELEMENTS
// =======================

const songTitle = document.getElementById("songTitle");
const songArtist = document.getElementById("songArtist");
const songImage = document.getElementById("songImage");

const player = document.getElementById("player");
const playlistElement = document.getElementById("playlist");

const toggleBtn = document.getElementById("playToggle");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

const progress = document.getElementById("progress");

// =======================
// LOAD SONGS FROM JSON
// =======================

async function loadSongs() {
  const response = await fetch("songs.json");
  const data = await response.json();
  return data;
}

// =======================
// PLAYER LOGIC
// =======================

function loadSong(song) {
  // Update UI
  songTitle.textContent = song.title;
  songArtist.textContent = "By " + song.artist;
  songImage.src = song.image;

  // Update audio source
  player.src = song.file;

  // update playlist highlight
  renderPlaylist();
}

function playSong() {
  player.play();
}

function pauseSong() {
  player.pause();
}

function togglePlay() {
  if (player.paused) {
    playSong();
  } else {
    pauseSong();
  }
}

// NEXT SONG
function nextSong() {
  currentSongIndex++;

  if (currentSongIndex >= songs.length) {
    currentSongIndex = 0;
  }

  loadSong(songs[currentSongIndex]);
  playSong();
}

// PREVIOUS SONG
function prevSong() {
  currentSongIndex--;

  if (currentSongIndex < 0) {
    currentSongIndex = songs.length - 1;
  }

  loadSong(songs[currentSongIndex]);
  playSong();
}

// =======================
// PLAYLIST UI
// =======================

function renderPlaylist() {
  playlistElement.innerHTML = "";

  songs.forEach((song, index) => {
    const li = document.createElement("li");

    li.textContent = `${song.title} - ${song.artist}`;

    // highlight current song
    if (index === currentSongIndex) {
      li.classList.add("active");
    }

    li.onclick = () => {
      currentSongIndex = index;
      loadSong(songs[currentSongIndex]);
      playSong();
    };

    playlistElement.appendChild(li);
  });
}

// =======================
// AUDIO EVENTS (SUPER IMPORTANT)
// =======================

// toggle button text based on REAL audio state
player.addEventListener("play", () => {
  toggleBtn.textContent = "⏸️";
});

player.addEventListener("pause", () => {
  toggleBtn.textContent = "▶️";
});

// autoplay next song
player.addEventListener("ended", nextSong);

// progress bar update
player.addEventListener("timeupdate", () => {
  if (!player.duration) return;

  const percentage = (player.currentTime / player.duration) * 100;
  progress.value = percentage;
});

// seek when user moves slider
progress.addEventListener("input", () => {
  if (!player.duration) return;

  player.currentTime = (progress.value / 100) * player.duration;
});

// =======================
// BUTTON EVENTS
// =======================

toggleBtn.onclick = togglePlay;
nextBtn.onclick = nextSong;
prevBtn.onclick = prevSong;

// =======================
// INIT APP
// =======================

async function init() {
  songs = await loadSongs();

  currentSongIndex = 0;

  loadSong(songs[currentSongIndex]);
}

init();
