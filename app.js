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
  timelineItems: [...APP_CONFIG.timelineItems],
  audioNotes: [...APP_CONFIG.audioNotes],
  openWhenNotes: [...APP_CONFIG.openWhenNotes],
  collages: [...APP_CONFIG.collages],
  slideshows: [...APP_CONFIG.slideshows]
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
  localStorage.setItem(storageKey, JSON.stringify(state));
};

const applyStoredState = () => {
  const stored = getStoredState();
  if (!stored) return;
  Object.assign(state, stored);
};

const formatDuration = (startDate) => {
  const now = new Date();
  const diff = now - startDate;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  return `${days}d ${hours}h ${mins}m`;
};

const renderCounters = () => {
  const counters = document.getElementById("counters");
  counters.innerHTML = "";
  APP_CONFIG.events.forEach((event) => {
    const row = document.createElement("div");
    row.className = "counter";
    row.innerHTML = `
      <div>
        <strong>${event.title}</strong>
        <p>${event.date}</p>
      </div>
      <span style="color:${event.color}">${formatDuration(new Date(event.date))}</span>
    `;
    counters.appendChild(row);
  });
};

const renderCollages = () => {
  const gallery = document.getElementById("collage-gallery");
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

const renderTimeline = () => {
  const track = document.getElementById("timeline-track");
  track.innerHTML = "";
  state.timelineItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "timeline-card";
    card.innerHTML = `
      <span>${item.date}</span>
      <h4>${item.title}</h4>
      <p>${item.description}</p>
    `;
    track.appendChild(card);
  });
};

const renderAudioNotes = () => {
  const list = document.getElementById("audio-notes");
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

const startCounterTimer = () => {
  renderCounters();
  setInterval(renderCounters, 60000);
};

const renderNotes = (listId, items) => {
  const list = document.getElementById(listId);
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
  container.innerHTML = "";
  state.floatingMessages.slice(0, 6).forEach((message) => {
    const bubble = document.createElement("span");
    bubble.className = "bubble";
    bubble.textContent = message;
    container.appendChild(bubble);
  });
};

const renderDailyNote = () => {
  const note = document.getElementById("daily-note");
  if (state.dailyNotes.length === 0) {
    note.textContent = "Add a daily note in Config.";
    return;
  }
  const index = Math.floor(Math.random() * state.dailyNotes.length);
  note.textContent = state.dailyNotes[index];
};

const renderMemoryPreview = () => {
  const preview = document.getElementById("memory-preview");
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
  if (!state.floatingMessages.length) return;
  const message =
    state.floatingMessages[Math.floor(Math.random() * state.floatingMessages.length)];
  bubble.textContent = message;
  bubble.classList.add("show");
  setTimeout(() => bubble.classList.remove("show"), 4000);
};

const scheduleFloatingMessages = () => {
  setInterval(showFloatingMessage, 12000);
};

const renderLove = () => {
  document.getElementById("love-level").textContent = `Love level: ${state.loveLevel}`;
  renderNotes("love-messages", state.loveMessages);
  renderMemoryGallery("love-images", state.loveImages);
};

const bindForm = (formId, handler) => {
  const form = document.getElementById(formId);
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
      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((panel) => panel.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });
};

const initTimelineControls = () => {
  const track = document.getElementById("timeline-track");
  document.getElementById("timeline-prev").addEventListener("click", () => {
    track.scrollBy({ left: -260, behavior: "smooth" });
  });
  document.getElementById("timeline-next").addEventListener("click", () => {
    track.scrollBy({ left: 260, behavior: "smooth" });
  });
};

const initAudioRecorder = () => {
  const recordButton = document.getElementById("record-audio");
  const stopButton = document.getElementById("stop-audio");
  const status = document.getElementById("record-status");
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

const setupConfigAdmin = () => {
  const adminPanel = document.getElementById("admin-panel");
  const locked = document.getElementById("admin-locked");
  if (!APP_CONFIG.googleClientId || APP_CONFIG.googleClientId.includes("PASTE")) {
    locked.innerHTML =
      "<p>Add your Google Client ID in config.js to enable login.</p>";
    return;
  }

  google.accounts.id.initialize({
    client_id: APP_CONFIG.googleClientId,
    callback: (response) => {
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      if (APP_CONFIG.allowedEmails.includes(payload.email)) {
        locked.classList.add("hidden");
        adminPanel.classList.remove("hidden");
      } else {
        locked.innerHTML = "<p>Access denied.</p>";
      }
    }
  });

  google.accounts.id.renderButton(document.getElementById("gsi-button"), {
    theme: "filled_black",
    size: "large",
    shape: "pill"
  });
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
  document.getElementById("show-love-note").addEventListener("click", () => {
    const note = state.dailyNotes[Math.floor(Math.random() * state.dailyNotes.length)];
    if (note) {
      alert(note);
    }
  });
};

const initAddEvent = () => {
  document.getElementById("add-event").addEventListener("click", () => {
    const title = prompt("Event title?");
    const date = prompt("Event date (YYYY-MM-DD)?");
    if (title && date) {
      APP_CONFIG.events.push({ title, date, color: "var(--accent-soft)" });
      renderCounters();
    }
  });
};

const initAddFloatingMessage = () => {
  document.getElementById("add-floating-message").addEventListener("click", () => {
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
    state.notes.push({
      title: data.get("title"),
      body: data.get("body")
    });
    saveState();
    renderNotes("notes-list", state.notes);
  });

  bindForm("wishes-form", (data) => {
    state.wishes.push({
      title: data.get("title"),
      body: data.get("body")
    });
    saveState();
    renderNotes("wishes-list", state.wishes);
  });

  bindForm("dreams-form", (data) => {
    state.dreams.push({
      title: data.get("title"),
      body: data.get("body")
    });
    saveState();
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
    state.loveMessages.push({ title: "Love", body: data.get("body") });
    saveState();
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
    state.vaultNotes.push({
      title: data.get("title"),
      body: data.get("body")
    });
    saveState();
    renderNotes("vault-list", state.vaultNotes);
  });

  bindForm("floating-form", (data) => {
    state.floatingMessages.push(data.get("message"));
    saveState();
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
  document.getElementById("grow-love").addEventListener("click", () => {
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
  startCounterTimer();
  renderDailyNote();
  renderBubbles();
  renderMemoryPreview();
  renderTimeline();
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
  initTimelineControls();
  initAddEvent();
  initAddFloatingMessage();
  initLoveHeart();
  initSpotify();
  initConfetti();
  initLoveNote();
  initAudioRecorder();
  initSlideshows();
  setupConfigAdmin();
};

document.addEventListener("DOMContentLoaded", initApp);
