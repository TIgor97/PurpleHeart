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
  userBubbles: []
};

const storageKey = "purple-heart-state";
const authKey = "purple-heart-auth";
const EXPIRY_MS = 24 * 60 * 60 * 1000;
const notificationIcon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Ctext x='0' y='96' font-size='96'%3E%F0%9F%92%9C%3C/text%3E%3C/svg%3E";

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

const loadAuthState = () => {
  const stored = localStorage.getItem(authKey);
  if (!stored) return;
  try {
    const data = JSON.parse(stored);
    if (data?.email && APP_CONFIG.allowedEmails.includes(data.email)) {
      state.activeUser = data.email;
      loadUserState(data.email);
    }
  } catch (error) {
    localStorage.removeItem(authKey);
  }
};

const saveAuthState = (email) => {
  if (!email) {
    localStorage.removeItem(authKey);
    return;
  }
  localStorage.setItem(authKey, JSON.stringify({ email }));
};

const getUserStorageKey = (email) => `purple-heart-${email}`;

const normalizeExpiringList = (items) => {
  if (!Array.isArray(items)) return [];
  const now = Date.now();
  return items
    .map((item) => ({ ...item, createdAt: item.createdAt ?? now }))
    .filter((item) => now - item.createdAt < EXPIRY_MS);
};

const showToast = (message, type = "") => {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`.trim();
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
};

const getPartnerEmail = (email) => {
  if (!email) return null;
  const others = APP_CONFIG.allowedEmails.filter((entry) => entry !== email);
  return others[0] || null;
};

const initFirebase = () => {
  if (!APP_CONFIG.firebaseConfig || !window.firebase) return null;
  if (!firebase.apps.length) {
    firebase.initializeApp(APP_CONFIG.firebaseConfig);
  }
  return {
    db: firebase.firestore(),
    auth: firebase.auth()
  };
};

const initAnniversaryPopup = (db) => {
  const popup = document.getElementById("anniversary-popup");
  const title = document.getElementById("anniversary-title");
  const message = document.getElementById("anniversary-message");
  const image = document.getElementById("anniversary-image");
  const close = document.getElementById("anniversary-close");
  if (!popup || !title || !message || !image || !close || !db) return;

  let activeDoc = null;

  close.addEventListener("click", async () => {
    popup.classList.remove("show");
    if (activeDoc) {
      try {
        await db.collection("anniversaryPosts").doc(activeDoc).update({
          seen: true,
          seenAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (error) {
        showToast("Failed to mark as seen", "error");
      }
    }
    activeDoc = null;
  });

  const listenForPosts = (email) => {
    if (!email) return;
    db.collection("anniversaryPosts")
      .where("to", "==", email)
      .where("seen", "==", false)
      .orderBy("createdAt", "desc")
      .limit(1)
      .onSnapshot((snapshot) => {
        if (snapshot.empty) return;
        const doc = snapshot.docs[0];
        const data = doc.data();
        activeDoc = doc.id;
        title.textContent = data.title || "Anniversary";
        message.textContent = data.message || "";
        if (data.image) {
          image.src = data.image;
          image.style.display = "block";
        } else {
          image.style.display = "none";
        }
        popup.classList.add("show");
      });
  };

  return listenForPosts;
};

const loadUserState = (email) => {
  if (!email) return;
  const stored = localStorage.getItem(getUserStorageKey(email));
  if (stored) {
    try {
      const data = JSON.parse(stored);
      state.userBubbles = normalizeExpiringList(data.userBubbles);
      state.vaultNotes = data.vaultNotes || state.vaultNotes;
      state.notes = normalizeExpiringList(data.notes);
      state.wishes = normalizeExpiringList(data.wishes);
      state.dreams = normalizeExpiringList(data.dreams);
      state.loveMessages = normalizeExpiringList(data.loveMessages);
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
    const images = collage.urls
      .slice(0, 4)
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
  const primary = document.getElementById("love-primary");
  const secondary = document.getElementById("love-secondary");
  if (!primary || !secondary) return;

  const update = () => {
    const now = new Date();
    let diff = Math.max(0, now - startDate);
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    diff -= years * 1000 * 60 * 60 * 24 * 365.25;
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
    diff -= months * 1000 * 60 * 60 * 24 * 30.44;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * 1000 * 60 * 60 * 24;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * 1000 * 60 * 60;
    const mins = Math.floor(diff / (1000 * 60));
    diff -= mins * 1000 * 60;
    const secs = Math.floor(diff / 1000);
    primary.textContent = `${years}y : ${months}m : ${days}d`;
    secondary.textContent = `${String(hours).padStart(2, "0")}h : ${String(mins).padStart(
      2,
      "0"
    )}m : ${String(secs).padStart(2, "0")}s`;
  };

  update();
  setInterval(update, 1000);
};

const renderNotes = (listId, items) => {
  const list = document.getElementById(listId);
  if (!list) return;
  list.innerHTML = "";
  normalizeExpiringList(items)
    .slice()
    .reverse()
    .forEach((note) => {
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
  items
    .slice()
    .reverse()
    .forEach((item) => {
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
  normalizeExpiringList(state.userBubbles).slice(0, 6).forEach((bubbleItem) => {
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
  const freshNotes = normalizeExpiringList(state.dailyNotes);
  if (freshNotes.length === 0) {
    note.textContent = "Add a daily note to make it appear.";
    return;
  }
  const index = Math.floor(Math.random() * freshNotes.length);
  note.textContent = freshNotes[index].body || freshNotes[index];
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
  const pool = normalizeExpiringList(state.userBubbles);
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

const updateBirthdays = () => {
  const partner = document.getElementById("birthday-partner");
  const self = document.getElementById("birthday-self");
  const card = document.getElementById("birthday-card");
  if (!partner || !self) return;
  if (!state.activeUser) {
    if (card) card.style.display = "none";
    partner.textContent = "Sign in to see";
    self.textContent = "Sign in to see";
    return;
  }
  if (card) card.style.display = "grid";
  const profile = APP_CONFIG.userData?.[state.activeUser]?.birthdays;
  partner.textContent = profile?.partner || "Add in config.js";
  self.textContent = profile?.self || "Add in config.js";
};

const initYouTubePlaylist = () => {
  const container = document.getElementById("music-embed");
  const list = document.getElementById("music-list");
  const title = document.getElementById("music-title");
  const form = document.getElementById("music-form");
  if (!container || !list || !title) return;
  if (!state.musicTracks || !state.musicTracks.length) {
    state.musicTracks = [];
  }

  let current = 0;
  const toEmbedUrl = (url) => {
    if (!url) return "";
    const short = url.match(/youtu\.be\/([\w-]+)/);
    const long = url.match(/v=([\w-]+)/);
    const id = short?.[1] || long?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : "";
  };

  const renderEmbed = () => {
    if (!state.musicTracks.length) {
      container.innerHTML = "";
      title.textContent = "Add YouTube links below";
      return;
    }
    const track = state.musicTracks[current];
    const embedUrl = toEmbedUrl(track.url);
    container.innerHTML = embedUrl
      ? `<iframe src="${embedUrl}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
      : "";
    title.textContent = track.title || "YouTube track";
  };

  const renderList = () => {
    list.innerHTML = "";
    state.musicTracks.forEach((track, index) => {
      const item = document.createElement("div");
      item.className = "music-item";
      item.innerHTML = `
        <span>${track.title || "Untitled"}</span>
        <div>
          <button type="button" data-action="play">Play</button>
          <button type="button" data-action="remove">Remove</button>
        </div>
      `;
      item.querySelector("button[data-action='play']").addEventListener("click", () => {
        current = index;
        renderEmbed();
      });
      item.querySelector("button[data-action='remove']").addEventListener("click", () => {
        state.musicTracks.splice(index, 1);
        saveState();
        if (current >= state.musicTracks.length) {
          current = Math.max(0, state.musicTracks.length - 1);
        }
        renderList();
        renderEmbed();
      });
      list.appendChild(item);
    });
  };

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const url = String(data.get("url") || "").trim();
      const titleText = String(data.get("title") || "").trim();
      if (!url) return;
      state.musicTracks.push({ title: titleText || "YouTube track", url });
      saveState();
      current = state.musicTracks.length - 1;
      renderList();
      renderEmbed();
      form.reset();
    });
  }

  renderList();
  renderEmbed();
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
      if (!tab.classList.contains("active")) {
        const rect = tab.getBoundingClientRect();
        for (let i = 0; i < 5; i += 1) {
          const pop = document.createElement("div");
          pop.className = "tab-heart-pop";
          pop.style.left = `${rect.left + rect.width / 2}px`;
          pop.style.top = `${rect.top + rect.height / 2}px`;
          pop.style.setProperty("--x", `${(Math.random() - 0.5) * 80}px`);
          pop.style.setProperty("--y", `${(Math.random() - 0.5) * 80}px`);
          document.body.appendChild(pop);
          setTimeout(() => pop.remove(), 900);
        }
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
  const statusDetail = document.getElementById("auth-status-detail");
  const signOut = document.getElementById("sign-out");
  const loginButton = document.getElementById("login-button");
  const adminPanel = document.getElementById("admin-panel");
  const adminLocked = document.getElementById("admin-locked");
  const sidebarLogin = document.getElementById("sidebar-login");
  const sidebarContent = document.getElementById("sidebar-content");

  if (status) {
    status.textContent = state.activeUser ? `Signed in as ${state.activeUser}` : "Not signed in";
  }
  if (statusDetail) {
    statusDetail.textContent = state.activeUser ? "Signed in" : "Waiting for login";
  }
  if (signOut) {
    signOut.style.display = state.activeUser ? "inline-flex" : "none";
  }
  if (loginButton) {
    loginButton.style.display = state.activeUser ? "none" : "inline-flex";
  }
  if (sidebarLogin && sidebarContent) {
    sidebarLogin.classList.toggle("hidden", !!state.activeUser);
    sidebarContent.classList.toggle("hidden", !state.activeUser);
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
  document.querySelectorAll(".tab[data-auth='true']").forEach((tab) => {
    tab.classList.toggle("locked", !state.activeUser);
  });
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

const setupConfigAdmin = (firebaseAuth) => {
  const locked = document.getElementById("admin-locked");
  const signOut = document.getElementById("sign-out");
  const loginButton = document.getElementById("login-button");
  const gsiButton = document.getElementById("gsi-button");

  if (!firebaseAuth) {
    if (locked) {
      locked.innerHTML = "<p>Firebase Auth missing.</p>";
    }
    return;
  }

  const provider = new firebase.auth.GoogleAuthProvider();

  if (loginButton) {
    loginButton.addEventListener("click", async () => {
      showToast("Opening Google login...", "");
      try {
        const result = await firebaseAuth.signInWithPopup(provider);
        const email = result.user?.email;
        if (!email || !APP_CONFIG.allowedEmails.includes(email)) {
          showToast("Login failed: access denied", "error");
          await firebaseAuth.signOut();
          return;
        }
        state.activeUser = email;
        saveAuthState(email);
        showToast("Login successful 💜", "success");
        const userConfig = APP_CONFIG.userData?.[email];
        state.userBubbles = userConfig?.floatingBubbles || [];
        loadUserState(email);
        renderBubbles();
        renderNotes("vault-list", state.vaultNotes);
        renderNotes("notes-list", state.notes);
        renderNotes("wishes-list", state.wishes);
        renderNotes("dreams-list", state.dreams);
        renderNotes("love-messages", state.loveMessages);
        updateAuthUI();
        updateBirthdays();
      } catch (error) {
        showToast("Login failed", "error");
      }
    });
  }

  if (gsiButton) {
    gsiButton.style.display = "none";
  }

  if (signOut) {
    signOut.addEventListener("click", async () => {
      state.activeUser = null;
      state.userBubbles = [];
      saveAuthState(null);
      await firebaseAuth.signOut();
      updateAuthUI();
      updateBirthdays();
      renderBubbles();
      showToast("Logged out", "");
      document.querySelectorAll(".tab").forEach((tab) => {
        tab.classList.remove("active");
      });
      const homeTab = document.querySelector(".tab[data-tab='home']");
      if (homeTab) homeTab.classList.add("active");
      document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.remove("active");
      });
      const home = document.getElementById("home");
      if (home) home.classList.add("active");
    });
  }

  updateAuthUI();
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

const initNotifications = () => {
  const form = document.getElementById("notification-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.activeUser) {
      alert("Sign in to send notifications.");
      return;
    }
    const data = new FormData(form);
    const title = data.get("title");
    const body = data.get("body");

    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }

    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: notificationIcon
      });
    } else {
      alert("Notifications blocked. Allow them in your browser settings.");
    }

    form.reset();
  });
};

const initServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => null);
  }
};

const initForms = () => {
  bindForm("notes-form", (data) => {
    if (!state.activeUser) return;
    state.notes.push({
      title: data.get("title"),
      body: data.get("body"),
      createdAt: Date.now()
    });
    saveUserState();
    renderNotes("notes-list", state.notes);
  });

  bindForm("wishes-form", (data) => {
    if (!state.activeUser) return;
    state.wishes.push({
      title: data.get("title"),
      body: data.get("body"),
      createdAt: Date.now()
    });
    saveUserState();
    renderNotes("wishes-list", state.wishes);
  });

  bindForm("dreams-form", (data) => {
    if (!state.activeUser) return;
    state.dreams.push({
      title: data.get("title"),
      body: data.get("body"),
      createdAt: Date.now()
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
    const urls = data
      .get("urls")
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);
    state.collages.unshift({ title: data.get("title"), urls });
    saveState();
    renderCollages();
  });

  bindForm("slideshow-form", (data) => {
    const urls = data
      .get("urls")
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);
    state.slideshows.unshift({ title: data.get("title"), urls });
    saveState();
    renderSlideshows();
  });

  bindForm("love-form", (data) => {
    if (!state.activeUser) return;
    state.loveMessages.push({
      title: "Love",
      body: data.get("body"),
      createdAt: Date.now()
    });
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
    const createdAt = Date.now();
    if (image) {
      state.userBubbles.unshift({ type: "image", content: image, createdAt });
    } else {
      state.userBubbles.unshift({ type: "text", content: message, createdAt });
    }
    saveUserState();
    renderBubbles();
    renderAdminLists();
  });

  bindForm("daily-form", (data) => {
    state.dailyNotes.push({ body: data.get("note"), createdAt: Date.now() });
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
  renderNotes(
    "floating-list",
    state.floatingMessages.map((msg) => ({ title: "", body: msg }))
  );
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
  loadAuthState();
  initTabs();
  startLoveCounter();
  renderDailyNote();
  renderBubbles();
  updateBirthdays();
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
  initYouTubePlaylist();
  initNotifications();
  initServiceWorker();
  const firebaseBundle = initFirebase();
  const db = firebaseBundle?.db || null;
  const firebaseAuth = firebaseBundle?.auth || null;
  setupConfigAdmin(firebaseAuth);
  const listenForPosts = initAnniversaryPopup(db);
  if (listenForPosts && state.activeUser) {
    listenForPosts(state.activeUser);
  }
  const anniversaryForm = document.getElementById("anniversary-form");
  if (anniversaryForm && db) {
    anniversaryForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!state.activeUser) {
        showToast("Sign in to send", "error");
        return;
      }
      const data = new FormData(anniversaryForm);
      const title = data.get("title");
      const message = data.get("message");
      const image = data.get("image");
      const partner = getPartnerEmail(state.activeUser);
      if (!partner) {
        showToast("No partner email found", "error");
        return;
      }
      try {
        await db.collection("anniversaryPosts").add({
          title,
          message,
          image: image || "",
          from: state.activeUser,
          to: partner,
          seen: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast("Sent to your love 💜", "success");
        anniversaryForm.reset();
      } catch (error) {
        showToast("Failed to send", "error");
      }
    });
  }
};

document.addEventListener("DOMContentLoaded", initApp);
