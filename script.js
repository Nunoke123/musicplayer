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
}

function togglePlay() {
  if (player.paused) {
    player.play();
    toggleBtn.textContent = "Pause";
  } else {
    player.pause();
    toggleBtn.textContent = "Play";
  }
}

toggleBtn.onclick = togglePlay;

// =======================
// PLAYLIST UI
// =======================

function renderPlaylist() {
  playlistElement.innerHTML = "";

  songs.forEach((song, index) => {
    const li = document.createElement("li");

    li.textContent = `${song.title} - ${song.artist}`;

    li.onclick = () => {
      currentSongIndex = index;
      loadSong(songs[currentSongIndex]);
      playSong();
    };

    playlistElement.appendChild(li);
  });
}

// =======================
// INIT APP
// =======================

async function init() {
  songs = await loadSongs();

  renderPlaylist();

  // load first song
  currentSongIndex = 0;
  loadSong(songs[currentSongIndex]);
}

init();