const authState = {
  activeUser: null
};

const getUserStorageKey = (email) => `purple-heart-${email}`;

const loadUserState = (email, state) => {
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

const saveUserState = (state) => {
  if (!authState.activeUser) return;
  const payload = {
    userBubbles: state.userBubbles,
    vaultNotes: state.vaultNotes,
    notes: state.notes,
    wishes: state.wishes,
    dreams: state.dreams,
    loveMessages: state.loveMessages
  };
  localStorage.setItem(getUserStorageKey(authState.activeUser), JSON.stringify(payload));
};

const updateAuthUI = (state) => {
  const status = document.getElementById("auth-status");
  const signOut = document.getElementById("sign-out");
  const adminPanel = document.getElementById("admin-panel");
  const adminLocked = document.getElementById("admin-locked");
  if (status) {
    status.textContent = authState.activeUser
      ? `Signed in as ${authState.activeUser}`
      : "Not signed in";
  }
  if (signOut) {
    signOut.style.display = authState.activeUser ? "inline-flex" : "none";
  }
  if (adminPanel && adminLocked) {
    if (authState.activeUser) {
      adminPanel.classList.remove("hidden");
      adminLocked.classList.add("hidden");
    } else {
      adminPanel.classList.add("hidden");
      adminLocked.classList.remove("hidden");
    }
  }

  document.querySelectorAll(".tab[data-auth='true']").forEach((tab) => {
    tab.classList.toggle("locked", !authState.activeUser);
  });
};

const setupAuth = (state, renderAfterAuth) => {
  const locked = document.getElementById("admin-locked");
  const signOut = document.getElementById("sign-out");
  if (!APP_CONFIG.googleClientId || APP_CONFIG.googleClientId.includes("PASTE")) {
    if (locked) {
      locked.innerHTML = "<p>Add your Google Client ID in config.js to enable login.</p>";
    }
    return;
  }

  google.accounts.id.initialize({
    client_id: APP_CONFIG.googleClientId,
    callback: (response) => {
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      if (APP_CONFIG.allowedEmails.includes(payload.email)) {
        authState.activeUser = payload.email;
        const userConfig = APP_CONFIG.userData?.[payload.email];
        state.userBubbles = userConfig?.floatingBubbles || [];
        loadUserState(payload.email, state);
        updateAuthUI(state);
        renderAfterAuth();
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
      authState.activeUser = null;
      state.userBubbles = [];
      updateAuthUI(state);
      renderAfterAuth();
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

  updateAuthUI(state);
};
