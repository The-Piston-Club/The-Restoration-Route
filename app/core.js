import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  deleteUser,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  writeBatch,
  increment,
  serverTimestamp,
  runTransaction
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

import {
  ROUTE_VENUES,
  VALID_PARTS,
  ALIAS_MAP,
  TOKEN_MAP,
  getVenueByPartKey,
  normalizeVenueValue,
  getUserLocation,
  getVenueDistanceMiles,
  formatDistanceMiles,
  getVenueOpenState
} from "../route-data.js";

export {
  ROUTE_VENUES,
  VALID_PARTS,
  ALIAS_MAP,
  TOKEN_MAP,
  getVenueByPartKey,
  normalizeVenueValue,
  getUserLocation,
  getVenueDistanceMiles,
  formatDistanceMiles,
  getVenueOpenState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  deleteUser,
  updateProfile,
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  writeBatch,
  increment,
  serverTimestamp,
  runTransaction
};

const firebaseConfig = {
  apiKey: "AIzaSyBSSekdM7t9zc_ee0kQ5xSBFYNvRN53PV0",
  authDomain: "the-restoration-route.firebaseapp.com",
  projectId: "the-restoration-route",
  storageBucket: "the-restoration-route.firebasestorage.app",
  messagingSenderId: "878380399095",
  appId: "1:878380399095:web:6a16f26fedce5f1f9c96f2",
  measurementId: "G-0PLZQ6B8HT"
};

export const RESET_REDIRECT_URL = "https://the-piston-club.github.io/The-Restoration-Route/";
export const STAMP_ANIMATION_DELAY_MS = 400;
export const STAMP_ANIMATION_DURATION_MS = 950;
export const STAMP_HOLD_MS = 900;
export const DUPLICATE_MESSAGE_MS = 5000;
export const CELEBRATION_MS = 4200;
export const SECRET_STORAGE_KEY = "chipWorkshopOverride";
export const CAMERA_PERMISSION_HINT_KEY = "restorationRouteCameraPermission";

export const TRAIL_REASONS = {
  cars: "I love cars",
  motorbikes: "I love motorbikes",
  "good-food-and-drink": "I love good food and drink"
};

export const BANNED_USERNAME_FRAGMENTS = [
  "admin",
  "moderator",
  "mod",
  "owner",
  "staff",
  "support",
  "official",
  "fuck",
  "shit",
  "bitch",
  "cunt",
  "twat",
  "wank",
  "arsehole",
  "bollock",
  "dick",
  "porn",
  "rape",
  "naz"
];

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const dom = {
  brandPanel: document.getElementById("brandPanel"),
  statusBox: document.getElementById("statusBox"),
  authPanel: document.getElementById("authPanel"),
  recordPanel: document.getElementById("recordPanel"),
  garageDirectoryPanel: document.getElementById("garageDirectoryPanel"),
  garageDirectoryGrid: document.getElementById("garageDirectoryGrid"),
  garageDirectoryBtn: document.getElementById("garageDirectoryBtn"),
  closeGarageDirectoryBtn: document.getElementById("closeGarageDirectoryBtn"),
  accountActionsPanel: document.getElementById("accountActionsPanel"),
  profileMenuBtn: document.getElementById("profileMenuBtn"),
  profileDropdown: document.getElementById("profileDropdown"),
  profileWelcome: document.getElementById("profileWelcome"),
  secretTestingPanel: document.getElementById("secretTestingPanel"),
  usernameInput: document.getElementById("username"),
  emailInput: document.getElementById("email"),
  passwordInput: document.getElementById("password"),
  trailReasonSelect: document.getElementById("trailReason"),
  signUpBtn: document.getElementById("signUpBtn"),
  logInBtn: document.getElementById("logInBtn"),
  googleBtn: document.getElementById("googleBtn"),
  logOutBtn: document.getElementById("logOutBtn"),
  secretTestBtn: document.getElementById("secretTestBtn"),
  progressCount: document.getElementById("progressCount"),
  completedVehiclesCount: document.getElementById("completedVehiclesCount"),
  accountCompletedVehiclesCount: document.getElementById("accountCompletedVehiclesCount"),
  celebrationOverlay: document.getElementById("celebrationOverlay"),
  celebrationVehicleCount: document.getElementById("celebrationVehicleCount"),
  scannerOverlay: document.getElementById("scannerOverlay"),
  openScannerBtn: document.getElementById("openScannerBtn"),
  closeScannerBtn: document.getElementById("closeScannerBtn"),
  scannerHelp: document.getElementById("scannerHelp")
};

export const partElements = {};
VALID_PARTS.forEach((partKey) => {
  partElements[partKey] = document.getElementById(`part-${partKey}`);
});

export const state = {
  statusHideTimer: null,
  authBusy: false,
  currentVisitedVenues: [],
  currentCompletedVehicles: 0,
  currentUsername: "",
  currentUsernameLower: "",
  currentTrailReasonKey: "",
  currentTrailReasonLabel: "",
  completionInProgress: false,
  secretUnlocked: false
};

export function resetIdentityState() {
  state.currentUsername = "";
  state.currentUsernameLower = "";
  state.currentTrailReasonKey = "";
  state.currentTrailReasonLabel = "";
}

export function readScanClaimFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const rawVenue = params.get("venue");
  const rawToken = params.get("token");

  if (!rawVenue) return { state: "none", partKey: null };

  const normalizedVenue = normalizeVenueValue(rawVenue);
  const resolvedPartKey = ALIAS_MAP[normalizedVenue] || null;

  if (!resolvedPartKey) return { state: "invalid", partKey: null };
  if (!rawToken || rawToken !== TOKEN_MAP[resolvedPartKey]) {
    return { state: "invalid", partKey: resolvedPartKey };
  }

  return { state: "valid", partKey: resolvedPartKey };
}

export function getPartLabel(partKey) {
  const venue = getVenueByPartKey(partKey);
  return venue ? venue.partLabel : partKey;
}

export function getUserDisplayName(user) {
  if (state.currentUsername) return state.currentUsername;
  if (!user) return "Guest";
  if (user.displayName && user.displayName.trim()) return user.displayName.trim();
  if (user.email) return user.email.split("@")[0];
  return `Guest-${user.uid.slice(0, 6).toUpperCase()}`;
}

export function sanitizeSuggestedUsername(text) {
  return String(text || "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);
}

export function getSuggestedUsername(user) {
  let candidate = sanitizeSuggestedUsername(
    user?.displayName || user?.email?.split("@")[0] || "Driver"
  );

  if (candidate.length < 3) {
    candidate = `Driver ${String(user?.uid || "1234").slice(0, 4)}`;
  }

  return candidate.slice(0, 24);
}

export function validateUsername(rawValue) {
  const clean = String(rawValue || "")
    .replace(/\s+/g, " ")
    .trim();
  const lower = clean.toLowerCase();

  if (!/^[A-Za-z0-9 ]{3,24}$/.test(clean)) {
    throw new Error(
      "Display names must be 3–24 characters and use only letters, numbers, and spaces."
    );
  }

  if (BANNED_USERNAME_FRAGMENTS.some((fragment) => lower.includes(fragment))) {
    throw new Error("That display name is not allowed. Please choose another.");
  }

  return { clean, lower };
}

export function parseTrailReason(rawValue) {
  const key = String(rawValue || "").trim();
  const label = TRAIL_REASONS[key];

  if (!label) {
    throw new Error("Choose what brings you to the route.");
  }

  return { key, label };
}

export function setAuthButtonsDisabled(isDisabled) {
  dom.signUpBtn.disabled = isDisabled;
  dom.logInBtn.disabled = isDisabled;
  dom.googleBtn.disabled = isDisabled;
}
