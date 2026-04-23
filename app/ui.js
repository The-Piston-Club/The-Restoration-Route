import {
  auth,
  dom,
  partElements,
  state,
  ROUTE_VENUES,
  VALID_PARTS,
  SECRET_STORAGE_KEY,
  STAMP_ANIMATION_DELAY_MS,
  STAMP_ANIMATION_DURATION_MS
} from "./core.js";

export function showStatus(message, type = "info", autoHideMs = 0) {
  if (state.statusHideTimer) {
    clearTimeout(state.statusHideTimer);
    state.statusHideTimer = null;
  }

  dom.statusBox.textContent = message;
  dom.statusBox.className = `status ${type}`;
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (autoHideMs > 0) {
    state.statusHideTimer = window.setTimeout(() => clearStatus(), autoHideMs);
  }
}

export function clearStatus() {
  if (state.statusHideTimer) {
    clearTimeout(state.statusHideTimer);
    state.statusHideTimer = null;
  }

  dom.statusBox.textContent = "";
  dom.statusBox.className = "status";
}

export function openGarageDirectory() {
  dom.garageDirectoryPanel.classList.add("show");
  dom.garageDirectoryPanel.classList.remove("hidden");
  dom.garageDirectoryPanel.setAttribute("aria-hidden", "false");
}

export function closeGarageDirectory() {
  dom.garageDirectoryPanel.classList.remove("show");
  dom.garageDirectoryPanel.classList.add("hidden");
  dom.garageDirectoryPanel.setAttribute("aria-hidden", "true");
}

export function closeProfileMenu() {
  if (!dom.profileDropdown || !dom.profileMenuBtn) return;
  dom.profileDropdown.classList.add("hidden");
  dom.profileMenuBtn.setAttribute("aria-expanded", "false");
}

export function openProfileMenu() {
  if (!dom.profileDropdown || !dom.profileMenuBtn) return;
  dom.profileDropdown.classList.remove("hidden");
  dom.profileMenuBtn.setAttribute("aria-expanded", "true");
}

export function toggleProfileMenu() {
  if (!dom.profileDropdown || dom.profileDropdown.classList.contains("hidden")) {
    openProfileMenu();
  } else {
    closeProfileMenu();
  }
}

export function showRecordPanel() {
  dom.recordPanel.classList.remove("hidden");
}

export function hideRecordPanel() {
  dom.recordPanel.classList.add("hidden");
  closeProfileMenu();
  closeGarageDirectory();
}


export function updateProgress(visitedVenues = []) {
  if (dom.progressCount) {
    dom.progressCount.textContent = `${visitedVenues.length} of 8`;
  }
}

export function updateCompletedVehicles(total = 0) {
  const value = String(total);

  if (dom.completedVehiclesCount) {
    dom.completedVehiclesCount.textContent = value;
  }

  if (dom.accountCompletedVehiclesCount) {
    dom.accountCompletedVehiclesCount.textContent = value;
  }
}

export function markCard(visitedVenues = []) {
  VALID_PARTS.forEach((partKey) => {
    const part = partElements[partKey];
    if (!part) return;

    part.classList.remove("animate-stamp");

    if (visitedVenues.includes(partKey)) {
      part.classList.add("stamped");
    } else {
      part.classList.remove("stamped");
    }
  });

  updateProgress(visitedVenues);
}

export function playStampAnimation(partKey) {
  const part = partElements[partKey];
  if (!part) return;

  part.classList.add("stamped");
  part.classList.add("animate-stamp");

  window.setTimeout(() => {
    part.classList.remove("animate-stamp");
  }, STAMP_ANIMATION_DELAY_MS + STAMP_ANIMATION_DURATION_MS + 50);
}

export function playAllStampAnimations() {
  VALID_PARTS.forEach((partKey) => {
    const part = partElements[partKey];
    if (!part) return;

    part.classList.add("stamped");
    part.classList.add("animate-stamp");

    window.setTimeout(() => {
      part.classList.remove("animate-stamp");
    }, STAMP_ANIMATION_DELAY_MS + STAMP_ANIMATION_DURATION_MS + 50);
  });
}

export function enterScanClaimMode() {
  document.body.classList.add("scan-claim-mode");
  showRecordPanel();
}

export function exitScanClaimMode() {
  document.body.classList.remove("scan-claim-mode");
}

export function showCelebrationOverlay(totalCompleted) {
  dom.celebrationVehicleCount.textContent = String(totalCompleted);
  dom.celebrationOverlay.classList.add("show");
  dom.celebrationOverlay.setAttribute("aria-hidden", "false");
}

export function hideCelebrationOverlay() {
  dom.celebrationOverlay.classList.remove("show");
  dom.celebrationOverlay.setAttribute("aria-hidden", "true");
}

export function renderGarageDirectory() {
  dom.garageDirectoryGrid.innerHTML = ROUTE_VENUES.map((venue) => `
    <a class="directory-link" href="./venue.html?garage=${encodeURIComponent(venue.partKey)}">
      <div class="directory-part">${venue.partLabel}</div>
      <div class="directory-name">${venue.name}</div>
      <div class="directory-quip">${venue.quip}</div>
    </a>
  `).join("");
}

export function syncSecretUnlockFromStorage() {
  state.secretUnlocked = localStorage.getItem(SECRET_STORAGE_KEY) === "unlocked";
}

export function updateSecretPanelVisibility() {
  syncSecretUnlockFromStorage();

  if (auth.currentUser && state.secretUnlocked) {
    dom.secretTestingPanel.classList.remove("hidden");
  } else {
    dom.secretTestingPanel.classList.add("hidden");
  }
}

export function clearSecretOverride() {
  localStorage.removeItem(SECRET_STORAGE_KEY);
  state.secretUnlocked = false;
  updateSecretPanelVisibility();
}


