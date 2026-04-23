import {
  auth,
  dom,
  state,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  readScanClaimFromUrl,
  getPartLabel,
  resetIdentityState,
  ROUTE_VENUES,
  getVenueDistanceMiles,
  getUserLocation,
  formatDistanceMiles
} from "./core.js";
import {
  showStatus,
  clearStatus,
  renderGarageDirectory,
  showRecordPanel,
  hideRecordPanel,
  closeProfileMenu,
  toggleProfileMenu,
  openGarageDirectory,
  closeGarageDirectory,
  exitScanClaimMode,
  hideCelebrationOverlay,
  updateSecretPanelVisibility,
  markCard,
  updateCompletedVehicles
} from "./ui.js";
import { startScanner, closeScannerOverlay, stopScanner } from "./scanner.js";
import { signUpFlow, logInFlow, googleFlow } from "./profile.js";
import { loadUserCard, processVenueFromUrl, runSecretCompletionTest, logOutFlow } from "./records.js";


async function tryPreferLandscape() {
  const isCompactScreen = window.matchMedia("(max-width: 900px)").matches;
  if (!isCompactScreen) return;

  const runningStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  if (!runningStandalone) return;
  if (!screen.orientation?.lock) return;

  try {
    await screen.orientation.lock("landscape");
  } catch {}
}

function bindEvents() {
  dom.signUpBtn.addEventListener("click", signUpFlow);
  dom.logInBtn.addEventListener("click", logInFlow);
  dom.googleBtn.addEventListener("click", googleFlow);
  dom.logOutBtn.addEventListener("click", logOutFlow);
  dom.secretTestBtn.addEventListener("click", runSecretCompletionTest);

  dom.openScannerBtn.addEventListener("click", startScanner);
  dom.closeScannerBtn.addEventListener("click", closeScannerOverlay);

  dom.garageDirectoryBtn.addEventListener("click", openGarageDirectory);
  dom.closeGarageDirectoryBtn.addEventListener("click", closeGarageDirectory);

  dom.profileMenuBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleProfileMenu();
  });

  dom.scannerOverlay.addEventListener("click", async (event) => {
    if (event.target === dom.scannerOverlay) {
      await closeScannerOverlay();
    }
  });

  dom.garageDirectoryPanel.addEventListener("click", (event) => {
    if (event.target === dom.garageDirectoryPanel) {
      closeGarageDirectory();
    }
  });

  document.addEventListener("click", (event) => {
    if (dom.accountActionsPanel && !dom.accountActionsPanel.contains(event.target)) {
      closeProfileMenu();
    }

    const partButton = event.target.closest("[data-venue-link]");
    if (partButton) {
      const partKey = partButton.getAttribute("data-venue-link");
      window.location.href = `./venue.html?garage=${encodeURIComponent(partKey)}`;
    }
  });

  document.addEventListener("keydown", async (event) => {
    if (event.key === "Escape") {
      closeProfileMenu();
      closeGarageDirectory();
      if (dom.scannerOverlay.classList.contains("show")) {
        await closeScannerOverlay();
      }
    }
  });

  window.addEventListener("beforeunload", () => {
    stopScanner();
  });

  window.addEventListener("orientationchange", () => {
    window.setTimeout(() => { tryPreferLandscape(); }, 120);
  });
}


async function updateDashboardDistances() {
  const targets = ROUTE_VENUES.map((venue) => ({
    venue,
    el: document.getElementById(`distance-${venue.partKey}`)
  })).filter((entry) => entry.el);

  if (!targets.length) return;
  targets.forEach(({ el }) => {
    el.textContent = "Locating…";
  });

  try {
    const userCoords = await getUserLocation();
    targets.forEach(({ venue, el }) => {
      const miles = getVenueDistanceMiles(venue, userCoords);
      el.textContent = Number.isFinite(miles) ? (miles < 10 ? `${miles.toFixed(1)} mi` : `${Math.round(miles)} mi`) : "—";
    });
  } catch {
    targets.forEach(({ el }) => {
      el.textContent = "No location";
    });
  }
}

function resetSignedOutState() {
  state.currentVisitedVenues = [];
  state.currentCompletedVehicles = 0;
  resetIdentityState();
  state.completionInProgress = false;

  markCard([]);
  updateCompletedVehicles(0);
  hideRecordPanel();
  updateSecretPanelVisibility();
}

async function handleAuthStateChanged(user) {
  const claim = readScanClaimFromUrl();
  state.completionInProgress = false;
  hideCelebrationOverlay();

  if (user) {
    document.body.classList.add("signed-in");
    dom.brandPanel.classList.add("hidden");
    dom.authPanel.classList.add("hidden");
    dom.accountActionsPanel.classList.remove("hidden");
    closeProfileMenu();
    showRecordPanel();
    updateSecretPanelVisibility();
    exitScanClaimMode();
    clearStatus();

    await loadUserCard(user);
    updateDashboardDistances();

    if (claim.state === "valid") {
      await processVenueFromUrl(user);
      return;
    }

    if (claim.state === "invalid") {
      showStatus("This QR code is invalid or incomplete.", "error");
    }

    document.body.classList.remove("auth-loading");
    return;
  }

  document.body.classList.remove("signed-in");
  dom.brandPanel.classList.remove("hidden");
  dom.authPanel.classList.remove("hidden");
  dom.accountActionsPanel.classList.add("hidden");
  closeProfileMenu();
  closeGarageDirectory();
  exitScanClaimMode();

  resetSignedOutState();

  document.body.classList.remove("auth-loading");

  if (claim.state === "valid" && claim.partKey) {
    showStatus(`Log in to claim your ${getPartLabel(claim.partKey)} stamp.`, "info");
  } else if (claim.state === "invalid") {
    showStatus("This QR code is invalid or incomplete.", "error");
  } else {
    clearStatus();
  }
}

async function initApp() {
  await tryPreferLandscape();
  renderGarageDirectory();
  closeProfileMenu();
  bindEvents();
  await setPersistence(auth, browserLocalPersistence);
  onAuthStateChanged(auth, handleAuthStateChanged);
}

initApp().catch((error) => {
  showStatus(error.message || "App failed to initialise.", "error");
});
