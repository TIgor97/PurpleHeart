const state = {
  notes: [],
  wishes: [],
  dreams: [],
  loveMessages: [],
  loveImages: [],
  loveLevel: 1,
  vaultNotes: [...APP_CONFIG.vaultNotes],
  floatingMessages: [...APP_CONFIG.floatingMessages],
  dailyNotes: [...APP_CONFIG.dailyNotes],
  memoryImages: [...APP_CONFIG.memoryImages],
  audioNotes: [...APP_CONFIG.audioNotes],
  openWhenNotes: [...APP_CONFIG.openWhenNotes],
  collages: [...APP_CONFIG.collages],
  slideshows: [...APP_CONFIG.slideshows],
  musicTracks: [...APP_CONFIG.musicTracks],
  activeUser: null,
  userBubbles: [],
  visitedCountries: [...APP_CONFIG.visitedCountries]
};

const storageKey = "purple-heart-state";

const getStoredState = () => {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (error) {
    return null;
  }
};

const saveState = () => {
  const { activeUser, userBubbles, ...persisted } = state;
  localStorage.setItem(storageKey, JSON.stringify(persisted));
};

const applyStoredState = () => {
  const stored = getStoredState();
  if (!stored) return;
  Object.assign(state, stored);
};

const getUserStorageKey = (email) => `purple-heart-${email}`;

const loadUserState = (email) => {
  if (!email) return;
  const stored = localStorage.getItem(getUserStorageKey(email));
  if (stored) {
    try {
      const data = JSON.parse(stored);
      state.userBubbles = data.userBubbles || [];
      state.vaultNotes = data.vaultNotes || state.vaultNotes;
      state.notes = data.notes || state.notes;
      state.wishes = data.wishes || state.wishes;
      state.dreams = data.dreams || state.dreams;
      state.loveMessages = data.loveMessages || state.loveMessages;
    } catch (error) {
      state.userBubbles = [];
    }
  }
};

const saveUserState = () => {
  if (!state.activeUser) return;
  const payload = {
    userBubbles: state.userBubbles,
    vaultNotes: state.vaultNotes,
    notes: state.notes,
    wishes: state.wishes,
    dreams: state.dreams,
    loveMessages: state.loveMessages
  };
  localStorage.setItem(getUserStorageKey(state.activeUser), JSON.stringify(payload));
};

const renderCollages = () => {
  const gallery = document.getElementById("collage-gallery");
  if (!gallery) return;
  gallery.innerHTML = "";
  state.collages.forEach((collage) => {
    const card = document.createElement("div");
    card.className = "collage-card";
    const images = collage.urls.slice(0, 4)
      .map((url) => `<img src="${url}" alt="${collage.title}" />`)
      .join("");
    card.innerHTML = `
      <strong>${collage.title}</strong>
      <div class="collage-grid">${images}</div>
    `;
    gallery.appendChild(card);
  });
};

const renderSlideshows = () => {
  const gallery = document.getElementById("slideshow-gallery");
  if (!gallery) return;
  gallery.innerHTML = "";
  state.slideshows.forEach((show, index) => {
    const card = document.createElement("div");
    card.className = "slideshow-card";
    card.dataset.index = index;
    card.innerHTML = `
      <strong>${show.title}</strong>
      <img src="${show.urls[0]}" alt="${show.title}" />
    `;
    gallery.appendChild(card);
  });
};

const renderAudioNotes = () => {
  const list = document.getElementById("audio-notes");
  if (!list) return;
  list.innerHTML = "";
  state.audioNotes.forEach((note) => {
    const card = document.createElement("div");
    card.className = "audio-card";
    card.innerHTML = `
      <strong>${note.title}</strong>
      <p>${note.note || ""}</p>
      ${note.url ? `<audio controls src="${note.url}"></audio>` : ""}
    `;
    list.appendChild(card);
  });
};

const renderOpenWhen = () => {
  const list = document.getElementById("open-when");
  if (!list) return;
  list.innerHTML = "";
  const today = new Date();
  state.openWhenNotes.forEach((note) => {
    const openDate = new Date(note.openDate);
    const isUnlocked = today >= openDate;
    const card = document.createElement("div");
    card.className = "note-card";
    card.innerHTML = `
      <strong>${note.title}</strong>
      <p>${isUnlocked ? note.body : "Unlocks on " + note.openDate}</p>
    `;
    list.appendChild(card);
  });
};

const startLoveCounter = () => {
  const startDate = new Date("2024-08-02T00:00:00");
  const yearsEl = document.getElementById("love-years");
  const daysEl = document.getElementById("love-days");
  const hoursEl = document.getElementById("love-hours");
  const minsEl = document.getElementById("love-mins");
  const secsEl = document.getElementById("love-secs");
  if (!yearsEl) return;

  const update = () => {
    const now = new Date();
    let diff = Math.max(0, now - startDate);
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    diff -= years * 1000 * 60 * 60 * 24 * 365;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * 1000 * 60 * 60 * 24;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * 1000 * 60 * 60;
    const mins = Math.floor(diff / (1000 * 60));
    diff -= mins * 1000 * 60;
    const secs = Math.floor(diff / 1000);
    yearsEl.textContent = years;
    daysEl.textContent = days;
    hoursEl.textContent = hours;
    minsEl.textContent = mins;
    secsEl.textContent = secs;
  };

  update();
  setInterval(update, 1000);
};

const renderNotes = (listId, items) => {
  const list = document.getElementById(listId);
  if (!list) return;
  list.innerHTML = "";
  items.slice().reverse().forEach((note) => {
    const card = document.createElement("div");
    card.className = "note-card";
    card.innerHTML = `<strong>${note.title || "Note"}</strong><p>${note.body}</p>`;
    list.appendChild(card);
  });
};

const renderMemoryGallery = (galleryId, items) => {
  const gallery = document.getElementById(galleryId);
  if (!gallery) return;
  gallery.innerHTML = "";
  items.slice().reverse().forEach((item) => {
    const card = document.createElement("div");
    card.className = "memory-item";
    card.innerHTML = `<img src="${item.url}" alt="${item.caption || "memory"}" /><p>${item.caption || ""}</p>`;
    gallery.appendChild(card);
  });
};

const renderBubbles = () => {
  const container = document.getElementById("bubble-container");
  if (!container) return;
  container.innerHTML = "";
  const bubbleData = state.activeUser
    ? state.userBubbles
    : state.floatingMessages.map((msg) => ({ type: "text", content: msg }));
  bubbleData.slice(0, 6).forEach((bubbleItem) => {
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    if (bubbleItem.type === "image") {
      bubble.innerHTML = `<img src="${bubbleItem.content}" alt="bubble" />`;
    } else {
      bubble.textContent = bubbleItem.content;
    }
    container.appendChild(bubble);
  });
};

const renderDailyNote = () => {
  const note = document.getElementById("daily-note");
  if (!note) return;
  if (state.dailyNotes.length === 0) {
    note.textContent = "Add a daily note in Config.";
    return;
  }
  const index = Math.floor(Math.random() * state.dailyNotes.length);
  note.textContent = state.dailyNotes[index];
};

const renderMemoryPreview = () => {
  const preview = document.getElementById("memory-preview");
  if (!preview) return;
  preview.innerHTML = "";
  const pick = state.memoryImages.slice(0, 3);
  pick.forEach((item) => {
    const card = document.createElement("div");
    card.className = "memory-item";
    card.innerHTML = `<img src="${item.url}" alt="${item.caption || "memory"}" /><p>${item.caption || ""}</p>`;
    preview.appendChild(card);
  });
};

const showFloatingMessage = () => {
  const bubble = document.getElementById("floating-message");
  if (!bubble) return;
  const pool = state.activeUser
    ? state.userBubbles
    : state.floatingMessages.map((msg) => ({ type: "text", content: msg }));
  if (!pool.length) return;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  bubble.innerHTML = "";
  bubble.classList.remove("pop");
  if (pick.type === "image") {
    const img = document.createElement("img");
    img.src = pick.content;
    img.alt = "bubble";
    bubble.appendChild(img);
  } else {
    bubble.textContent = pick.content;
  }
  bubble.classList.add("show");
  setTimeout(() => {
    bubble.classList.add("pop");
    bubble.classList.remove("show");
  }, 3500);
};

const scheduleFloatingMessages = () => {
  setInterval(showFloatingMessage, 12000);
};

const renderLove = () => {
  const loveLevel = document.getElementById("love-level");
  if (loveLevel) {
    loveLevel.textContent = `Love level: ${state.loveLevel}`;
  }
  renderNotes("love-messages", state.loveMessages);
  renderMemoryGallery("love-images", state.loveImages);
};

const bindForm = (formId, handler) => {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    handler(new FormData(form));
    form.reset();
  });
};

const initTabs = () => {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.dataset.auth === "true" && !state.activeUser) {
        alert("Please sign in to access this tab.");
        return;
      }
      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((panel) => panel.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });
};

const updateAuthUI = () => {
  const status = document.getElementById("auth-status");
  const signOut = document.getElementById("sign-out");
  const adminPanel = document.getElementById("admin-panel");
  const adminLocked = document.getElementById("admin-locked");
  if (status) {
    status.textContent = state.activeUser ? `Signed in as ${state.activeUser}` : "Not signed in";
  }
  if (signOut) {
    signOut.style.display = state.activeUser ? "inline-flex" : "none";
  }
  if (adminPanel && adminLocked) {
    if (state.activeUser) {
      adminPanel.classList.remove("hidden");
      adminLocked.classList.add("hidden");
    } else {
      adminPanel.classList.add("hidden");
      adminLocked.classList.remove("hidden");
    }
  }
};

const initAudioRecorder = () => {
  const recordButton = document.getElementById("record-audio");
  const stopButton = document.getElementById("stop-audio");
  const status = document.getElementById("record-status");
  if (!recordButton || !stopButton || !status) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    status.textContent = "Audio recording not supported.";
    recordButton.disabled = true;
    return;
  }

  let recorder;
  let chunks = [];

  recordButton.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          state.audioNotes.unshift({
            title: "Voice note",
            url: reader.result,
            note: "Recorded on this device"
          });
          saveState();
          renderAudioNotes();
        };
        reader.readAsDataURL(blob);
        chunks = [];
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      recordButton.disabled = true;
      stopButton.disabled = false;
      status.textContent = "Recording...";
    } catch (error) {
      status.textContent = "Microphone permission denied.";
    }
  });

  stopButton.addEventListener("click", () => {
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    recordButton.disabled = false;
    stopButton.disabled = true;
    status.textContent = "Saved to audio notes.";
  });
};

const initSlideshows = () => {
  setInterval(() => {
    document.querySelectorAll(".slideshow-card").forEach((card) => {
      const index = Number(card.dataset.index || 0);
      const show = state.slideshows[index];
      if (!show || !show.urls.length) return;
      const img = card.querySelector("img");
      const current = Number(img.dataset.step || 0);
      const next = (current + 1) % show.urls.length;
      img.src = show.urls[next];
      img.dataset.step = String(next);
    });
  }, 3500);
};

const initMusicPlayer = () => {
  const player = document.getElementById("audio-player");
  const title = document.getElementById("music-title");
  const playBtn = document.getElementById("play-track");
  const prevBtn = document.getElementById("prev-track");
  const nextBtn = document.getElementById("next-track");
  if (!player || !title || !playBtn || !prevBtn || !nextBtn) return;
  if (!state.musicTracks.length || !state.musicTracks[0].url) {
    title.textContent = "Add MP3 links in config.js";
    return;
  }

  let current = 0;
  const setTrack = (index) => {
    current = (index + state.musicTracks.length) % state.musicTracks.length;
    const track = state.musicTracks[current];
    player.src = track.url;
    title.textContent = track.title || "Untitled";
  };

  setTrack(current);

  playBtn.addEventListener("click", () => {
    if (player.paused) {
      player.play().catch(() => null);
      playBtn.textContent = "Pause";
    } else {
      player.pause();
      playBtn.textContent = "Play";
    }
  });

  nextBtn.addEventListener("click", () => {
    setTrack(current + 1);
    player.play().catch(() => null);
  });

  prevBtn.addEventListener("click", () => {
    setTrack(current - 1);
    player.play().catch(() => null);
  });

  player.addEventListener("ended", () => {
    setTrack(current + 1);
    player.play().catch(() => null);
  });
};

const setupConfigAdmin = () => {
  const locked = document.getElementById("admin-locked");
  const signOut = document.getElementById("sign-out");
  if (!APP_CONFIG.googleClientId || APP_CONFIG.googleClientId.includes("PASTE")) {
    if (locked) {
      locked.innerHTML =
        "<p>Add your Google Client ID in config.js to enable login.</p>";
    }
    return;
  }

  google.accounts.id.initialize({
    client_id: APP_CONFIG.googleClientId,
    callback: (response) => {
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      if (APP_CONFIG.allowedEmails.includes(payload.email)) {
        state.activeUser = payload.email;
        const userConfig = APP_CONFIG.userData?.[payload.email];
        state.userBubbles = userConfig?.floatingBubbles || [];
        loadUserState(payload.email);
        renderBubbles();
        renderNotes("vault-list", state.vaultNotes);
        renderNotes("notes-list", state.notes);
        renderNotes("wishes-list", state.wishes);
        renderNotes("dreams-list", state.dreams);
        renderNotes("love-messages", state.loveMessages);
        updateAuthUI();
      } else if (locked) {
        locked.innerHTML = "<p>Access denied.</p>";
      }
    }
  });

  google.accounts.id.renderButton(document.getElementById("gsi-button"), {
    theme: "filled_black",
    size: "large",
    shape: "pill"
  });

  if (signOut) {
    signOut.addEventListener("click", () => {
      state.activeUser = null;
      state.userBubbles = [];
      updateAuthUI();
      renderBubbles();
      document.querySelectorAll(".tab").forEach((tab) => {
        tab.classList.remove("active");
      });
      document.querySelector(".tab[data-tab='home']").classList.add("active");
      document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.remove("active");
      });
      document.getElementById("home").classList.add("active");
    });
  }
  updateAuthUI();
};

const initSpotify = () => {
  const pill = document.getElementById("spotify-pill");
  const player = document.getElementById("spotify-player");
  const toggle = document.getElementById("toggle-player");
  const volume = document.getElementById("volume-slider");

  toggle.addEventListener("click", () => {
    const isOpen = player.style.display === "block";
    player.style.display = isOpen ? "none" : "block";
    toggle.textContent = isOpen ? "Open player" : "Hide player";
  });

  volume.addEventListener("input", () => {
    const value = volume.value;
    pill.style.boxShadow = `0 0 16px rgba(157, 78, 221, ${value / 200})`;
  });
};

const initLoveNote = () => {
  const button = document.getElementById("show-love-note");
  if (!button) return;
  button.addEventListener("click", () => {
    const note = state.dailyNotes[Math.floor(Math.random() * state.dailyNotes.length)];
    if (note) {
      alert(note);
    }
  });
};

const initAddEvent = () => {
  const button = document.getElementById("add-event");
  if (!button) return;
  button.addEventListener("click", () => {
    const title = prompt("Event title?");
    const date = prompt("Event date (YYYY-MM-DD)?");
    if (title && date) {
      APP_CONFIG.events.push({ title, date, color: "var(--accent-soft)" });
    }
  });
};

const initAddFloatingMessage = () => {
  const button = document.getElementById("add-floating-message");
  if (!button) return;
  button.addEventListener("click", () => {
    const message = prompt("Add a bubble message");
    if (message) {
      state.floatingMessages.push(message);
      saveState();
      renderBubbles();
    }
  });
};

const initForms = () => {
  bindForm("notes-form", (data) => {
    if (!state.activeUser) return;
    state.notes.push({
      title: data.get("title"),
      body: data.get("body")
    });
    saveUserState();
    renderNotes("notes-list", state.notes);
  });

  bindForm("wishes-form", (data) => {
    if (!state.activeUser) return;
    state.wishes.push({
      title: data.get("title"),
      body: data.get("body")
    });
    saveUserState();
    renderNotes("wishes-list", state.wishes);
  });

  bindForm("dreams-form", (data) => {
    if (!state.activeUser) return;
    state.dreams.push({
      title: data.get("title"),
      body: data.get("body")
    });
    saveUserState();
    renderNotes("dreams-list", state.dreams);
  });

  bindForm("memories-form", (data) => {
    state.memoryImages.push({
      url: data.get("url"),
      caption: data.get("caption")
    });
    saveState();
    renderMemoryGallery("memories-gallery", state.memoryImages);
    renderMemoryPreview();
  });

  bindForm("collage-form", (data) => {
    const urls = data.get("urls").split("\n").map((url) => url.trim()).filter(Boolean);
    state.collages.unshift({ title: data.get("title"), urls });
    saveState();
    renderCollages();
  });

  bindForm("slideshow-form", (data) => {
    const urls = data.get("urls").split("\n").map((url) => url.trim()).filter(Boolean);
    state.slideshows.unshift({ title: data.get("title"), urls });
    saveState();
    renderSlideshows();
  });

  bindForm("love-form", (data) => {
    if (!state.activeUser) return;
    state.loveMessages.push({ title: "Love", body: data.get("body") });
    saveUserState();
    renderLove();
  });

  bindForm("love-image-form", (data) => {
    state.loveImages.push({
      url: data.get("url"),
      caption: data.get("caption")
    });
    saveState();
    renderLove();
  });

  bindForm("vault-form", (data) => {
    if (!state.activeUser) return;
    state.vaultNotes.push({
      title: data.get("title"),
      body: data.get("body")
    });
    saveUserState();
    renderNotes("vault-list", state.vaultNotes);
  });

  bindForm("floating-form", (data) => {
    if (!state.activeUser) return;
    const image = data.get("image");
    const message = data.get("message");
    if (image) {
      state.userBubbles.unshift({ type: "image", content: image });
    } else {
      state.userBubbles.unshift({ type: "text", content: message });
    }
    saveUserState();
    renderBubbles();
    renderAdminLists();
  });

  bindForm("daily-form", (data) => {
    state.dailyNotes.push(data.get("note"));
    saveState();
    renderDailyNote();
    renderAdminLists();
  });

  bindForm("memory-form", (data) => {
    state.memoryImages.push({
      url: data.get("url"),
      caption: data.get("caption")
    });
    saveState();
    renderMemoryGallery("admin-memories", state.memoryImages);
    renderMemoryPreview();
  });
};

const renderAdminLists = () => {
  renderNotes("floating-list", state.floatingMessages.map((msg) => ({ title: "", body: msg })));
  renderNotes("daily-list", state.dailyNotes.map((note) => ({ title: "", body: note })));
  renderMemoryGallery("admin-memories", state.memoryImages);
};

const initLoveHeart = () => {
  const button = document.getElementById("grow-love");
  if (!button) return;
  button.addEventListener("click", () => {
    state.loveLevel += 1;
    saveState();
    renderLove();
  });
};

const initConfetti = () => {
  const makeHeart = () => {
    const heart = document.createElement("div");
    heart.className = "heart-confetti";
    heart.textContent = "💜";
    document.body.appendChild(heart);
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.animationDuration = `${3 + Math.random() * 3}s`;
    setTimeout(() => heart.remove(), 6000);
  };

  setInterval(makeHeart, 800);
};

const initApp = () => {
  applyStoredState();
  initTabs();
  startLoveCounter();
  renderDailyNote();
  renderBubbles();
  renderMemoryPreview();
  renderAudioNotes();
  renderOpenWhen();
  renderCollages();
  renderSlideshows();
  renderMemoryGallery("memories-gallery", state.memoryImages);
  renderNotes("notes-list", state.notes);
  renderNotes("wishes-list", state.wishes);
  renderNotes("dreams-list", state.dreams);
  renderNotes("vault-list", state.vaultNotes);
  renderLove();
  renderAdminLists();
  scheduleFloatingMessages();
  initForms();
  initAddEvent();
  initAddFloatingMessage();
  initLoveHeart();
  initConfetti();
  initLoveNote();
  initAudioRecorder();
  initSlideshows();
  initMusicPlayer();
  setupConfigAdmin();
loadWorldMap();
};

document.addEventListener("DOMContentLoaded", initApp);




// Funkcija za pretvaranje ISO koda u Emoji zastavu
const getFlagEmoji = (countryCode) => {
    return countryCode.toUpperCase().replace(/./g, char => 
        String.fromCodePoint(char.charCodeAt(0) + 127397)
    );
};

const renderTravels = () => {
    const list = document.getElementById("countries-list");
    if (!list) return;

    list.innerHTML = "";
    
    // Sortiramo države po imenu
    const sortedKeys = Object.keys(APP_CONFIG.allCountries).sort((a, b) => 
        APP_CONFIG.allCountries[a].localeCompare(APP_CONFIG.allCountries[b])
    );

    sortedKeys.forEach(code => {
        const name = APP_CONFIG.allCountries[code];
        const isVisited = state.visitedCountries.some(v => v.id === code);
        
        const div = document.createElement("div");
        div.className = `country-item ${isVisited ? 'visited' : ''}`;
        div.innerHTML = `
            <span class="flag-icon">${getFlagEmoji(code)}</span>
            <span>${name}</span>
            <span style="margin-left:auto">${isVisited ? '💜' : ''}</span>
        `;
        
        div.onclick = () => toggleCountry(code);
        list.appendChild(div);

        // Bojenje mape (ako path sa tim ID-om postoji)
        const path = document.getElementById(code);
        if (path) {
            isVisited ? path.classList.add("visited") : path.classList.remove("visited");
        }
    });

    updateTravelStats();
};

const toggleCountry = (code) => {
    const index = state.visitedCountries.findIndex(v => v.id === code);
    if (index > -1) {
        state.visitedCountries.splice(index, 1);
    } else {
        state.visitedCountries.push({ id: code, date: new Date().toISOString() });
    }
    saveState();
    renderTravels();
};

const updateTravelStats = () => {
    const total = Object.keys(APP_CONFIG.allCountries).length;
    const visited = state.visitedCountries.length;
    const percent = ((visited / total) * 100).toFixed(1);
    const text = document.getElementById("travel-stats-text");
    if (text) text.textContent = `We have explored ${visited} countries (${percent}%) of the world together!`;
};

// Pretraga
const filterCountries = () => {
    const query = document.getElementById("country-search").value.toLowerCase();
    document.querySelectorAll(".country-item").forEach(item => {
        const name = item.innerText.toLowerCase();
        item.style.display = name.includes(query) ? "flex" : "none";
    });
};


const loadWorldMap = async () => {
    try {
        // Putanja do tvog novog fajla
        const response = await fetch('assets/worldMap.svg');
        const svgText = await response.text();
        
        const mapContainer = document.getElementById('world-map-svg');
        if (mapContainer) {
            mapContainer.innerHTML = svgText;
            
            // VAŽNO: Tek kad se mapa učita, pozivamo renderTravels
            // da bi JS mogao da pronađe države i oboji ih
            renderTravels();
        }
    } catch (error) {
        console.error("Greška pri učitavanju mape:", error);
    }
};

// Pozovi ovu funkciju tamo gde inicijalizuješ aplikaciju
// npr. unutar DOMContentLoaded ili na kraju app.js