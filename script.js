document.addEventListener("DOMContentLoaded", () => {
    // DOM
    const title = document.getElementById("title");
    const artist = document.getElementById("artist");
    const cover = document.getElementById("cover");
    const backBtn = document.getElementById("backBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const nextBtn = document.getElementById("nextBtn");
    const playlist = document.getElementById("playlist");
    const clearBtn = document.getElementById("clearBtn");
    const player = document.getElementById("player");
    const albums = document.getElementById("albums");
    const progress = document.getElementById("progress");
    const currentTimeLabel = document.getElementById("currentTime");
    const durationLabel = document.getElementById("duration");
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");

    // Songs (the library)
    const songs = [
        {
            title: "MEGALOVANIA",
            artist: "Toby Fox",
            cover: "covers/undertale.webp",
            file: "songs/MEGALOVANIA.ogg",
            album: "UNDERTALE"
        },
        {
            title: "Savior of the Waking World",
            artist: "Toby Fox",
            cover: "covers/homestuck.webp",
            file: "songs/Savior Of The Waking World.mp3",
            album: "Homestuck"
        },
        {
            title: "Penumbra Phantasm",
            artist: "Toby Fox",
            cover: "covers/homestuck.webp",
            file: "songs/Penumbra Phantasm.mp3",
            album: "Homestuck"
        },
        {
            title: "Doctor",
            artist: "George Buzinkai",
            cover: "covers/homestuck.webp",
            file: "songs/Doctor.mp3",
            album: "Homestuck"
        },
        {
            title: "Umbral Ultimatum",
            artist: "Toby Fox",
            cover: "covers/homestuck.webp",
            file: "songs/Umbral Ultimatum.mp3",
            album: "Homestuck"
        },
        {
            title: "MeGaLoVania",
            artist: "Toby Fox",
            cover: "covers/homestuck.webp",
            file: "songs/MeGaLoVania.mp3",
            album: "Homestuck"
        },
        {
            title: "Descend",
            artist: "Toby Fox",
            cover: "covers/homestuck.webp",
            file: "songs/Descend.mp3",
            album: "Homestuck"
        },
        {
            title: "Moonsetter",
            artist: "Toby Fox",
            cover: "covers/homestuck.webp",
            file: "songs/Moonsetter.mp3",
            album: "Homestuck"
        },
        {
            title: "Savior of the Dreaming Dead",
            artist: "Toby Fox",
            cover: "covers/homestuck.webp",
            file: "songs/Umbral Ultimatum.mp3",
            album: "Homestuck"
        },
    ];

    // Init
    const albumsHTML = albums.innerHTML; // remembered so the back button can restore it

    // queue = the songs currently in the playlist (saved by title)
    const savedTitles = JSON.parse(localStorage.getItem("playlist")) || [];
    const queue = savedTitles
        .map(t => songs.find(s => s.title === t))
        .filter(Boolean);

    let songIndex = parseInt(localStorage.getItem("song"), 10) || 0;
    renderPlaylist();
    loadSong(songIndex);

    // Functions
    function save() {
        localStorage.setItem("song", songIndex);
        localStorage.setItem("playlist", JSON.stringify(queue.map(s => s.title)));
    }

    function loadSong(index) {
        progress.value = 0;
        currentTimeLabel.textContent = "0:00";
        durationLabel.textContent = "0:00";

        // Empty playlist: clear the player
        if (queue.length === 0) {
            songIndex = 0;
            player.pause();
            player.removeAttribute("src");
            player.load();
            title.textContent = "No song selected";
            artist.textContent = "";
            cover.src = "covers/empty.webp";
            if ("mediaSession" in navigator) navigator.mediaSession.metadata = null;
            save();
            return;
        }

        songIndex = (index + queue.length) % queue.length; // Ensure index wraps around safely

        // Dedicated player elements remain separate
        title.textContent = queue[songIndex].title;
        artist.textContent = "By " + queue[songIndex].artist;
        cover.src = queue[songIndex].cover;
        player.src = queue[songIndex].file;

        // Lock screen / headphone info
        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: queue[songIndex].title,
                artist: queue[songIndex].artist,
                artwork: [{ src: queue[songIndex].cover }]
            });
        }

        highlightCurrent();
        save();
    }

    function nextSong() {
        if (queue.length === 0) return;
        loadSong(songIndex + 1);
        player.play();
    }

    function prevSong() {
        if (queue.length === 0) return;
        loadSong(songIndex - 1);
        player.play();
    }

    function renderPlaylist() {
        playlist.innerHTML = "";
        queue.forEach((song, i) => {
            const li = document.createElement("li");

            const play = document.createElement("a");
            play.href = "#";
            // Updated to include the artist
            play.textContent = `${song.title} - ${song.artist}`;
            play.addEventListener("click", (e) => {
                e.preventDefault();
                loadSong(i);
                player.play();
            });

            const remove = document.createElement("button");
            remove.textContent = "❌";
            remove.addEventListener("click", () => removeSong(i));

            li.append(play, " ", remove);
            playlist.appendChild(li);
        });

        highlightCurrent();
        clearBtn.hidden = queue.length === 0;
    }

    // Mark the playing song in the playlist
    function highlightCurrent() {
        [...playlist.children].forEach((li, i) => {
            li.classList.toggle("current", i === songIndex);
        });
    }

    function addSong(song) {
        queue.push(song);
        if (queue.length === 1) loadSong(0); // first song: show it in the player
        renderPlaylist();
        save();
    }

    function removeSong(i) {
        queue.splice(i, 1);

        if (i < songIndex) {
            songIndex--; // current song shifted down one slot
        } else if (i === songIndex) {
            // Removed the current song: load whatever slid into its place
            const wasPlaying = !player.paused;
            loadSong(songIndex);
            if (wasPlaying && queue.length > 0) player.play();
        }

        renderPlaylist();
        save();
    }

    // 75 seconds -> "1:15"
    function formatTime(seconds) {
        if (!isFinite(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return m + ":" + String(s).padStart(2, "0");
    }

    // A clickable song that adds it to the playlist (used by albums and search)
    function songItem(song) {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = "#";
        // Updated to include the artist
        link.textContent = `${song.title} - ${song.artist}`;
        link.addEventListener("click", (e) => {
            e.preventDefault();
            addSong(song);
        });
        li.appendChild(link);
        return li;
    }

    function search(query) {
        const q = query.trim().toLowerCase();
        searchResults.innerHTML = "";
        if (!q) return;

        const matches = songs.filter(s =>
            [s.title, s.artist, s.album].some(field => field.toLowerCase().includes(q))
        );

        if (matches.length === 0) {
            const li = document.createElement("li");
            li.textContent = "No songs found";
            searchResults.appendChild(li);
            return;
        }
        matches.forEach(song => searchResults.appendChild(songItem(song)));
    }

    window.showAlbum = function showAlbum(album) {
        albums.innerHTML = "";

        const back = document.createElement("button");
        back.textContent = "⬅️ Back";
        back.addEventListener("click", () => {
            albums.innerHTML = albumsHTML;
        });

        const heading = document.createElement("h2");
        heading.textContent = album;

        const list = document.createElement("ul");
        songs.filter(s => s.album === album).forEach(song => list.appendChild(songItem(song)));

        albums.append(back, heading, list);
    };

    // Event Listeners
    pauseBtn.addEventListener("click", () => {
        if (queue.length === 0) return;
        if (player.paused) {
            player.play();
        } else {
            player.pause();
        }
    });

    // Keep the button icon in sync however playback starts or stops
    player.addEventListener("play", () => { pauseBtn.textContent = "⏸️"; });
    player.addEventListener("pause", () => { pauseBtn.textContent = "▶️"; });

    backBtn.addEventListener("click", prevSong);
    nextBtn.addEventListener("click", nextSong);
    player.addEventListener("ended", nextSong);

    // Skip songs that fail to load, but stop if every song in the playlist is broken
    let failures = 0;
    player.addEventListener("error", () => {
        if (!player.getAttribute("src")) return; // nothing was loaded
        failures++;
        if (failures >= queue.length) {
            failures = 0;
            return;
        }
        nextSong();
    });
    player.addEventListener("playing", () => { failures = 0; });

    // Lock screen and headphone controls
    if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", () => { if (queue.length) player.play(); });
        navigator.mediaSession.setActionHandler("pause", () => player.pause());
        navigator.mediaSession.setActionHandler("previoustrack", prevSong);
        navigator.mediaSession.setActionHandler("nexttrack", nextSong);
    }

    clearBtn.addEventListener("click", () => {
        queue.length = 0;
        loadSong(0); // empty playlist: clears the player and saves
        renderPlaylist();
    });

    // Progress bar: follows the song, and can be dragged to seek
    player.addEventListener("timeupdate", () => {
        progress.value = player.duration ? (player.currentTime / player.duration) * 100 : 0;
        currentTimeLabel.textContent = formatTime(player.currentTime);
    });
    player.addEventListener("durationchange", () => {
        durationLabel.textContent = formatTime(player.duration);
    });
    progress.addEventListener("input", () => {
        if (player.duration) player.currentTime = (progress.value / 100) * player.duration;
    });

    // Search: results update as you type
    searchInput.addEventListener("input", () => search(searchInput.value));

    // Swipe left/right to change tabs on mobile (same order as the bottom bar)
    const tabOrder = ["albums", "playlist", "search"];
    let touchStartX = 0;
    let touchStartY = 0;
    let swipeIgnored = false;

    document.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        // Ignore pinch gestures, and don't fight the progress bar or search box
        swipeIgnored = e.touches.length > 1 || e.target.closest("input") !== null;
    }, { passive: true });

    document.addEventListener("touchend", (e) => {
        if (swipeIgnored || !window.matchMedia("(max-width: 700px)").matches) return;

        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return; // too short, or mostly vertical

        const next = tabOrder.indexOf(document.body.dataset.tab) + (dx < 0 ? 1 : -1);
        if (next >= 0 && next < tabOrder.length) {
            document.body.dataset.tab = tabOrder[next];
        }
    }, { passive: true });
});