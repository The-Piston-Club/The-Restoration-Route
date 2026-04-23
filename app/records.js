import {
  auth,
  db,
  dom,
  state,
  VALID_PARTS,
  RESET_REDIRECT_URL,
  STAMP_ANIMATION_DELAY_MS,
  STAMP_ANIMATION_DURATION_MS,
  STAMP_HOLD_MS,
  DUPLICATE_MESSAGE_MS,
  CELEBRATION_MS,
  signOut,
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  writeBatch,
  increment,
  serverTimestamp,
  getPartLabel,
  getUserDisplayName,
  readScanClaimFromUrl,
  resetIdentityState
} from "./core.js";
import {
  showStatus,
  clearStatus,
  showRecordPanel,
  hideRecordPanel,
  markCard,
  playStampAnimation,
  playAllStampAnimations,
  enterScanClaimMode,
  exitScanClaimMode,
  showCelebrationOverlay,
  hideCelebrationOverlay,
  updateCompletedVehicles,
  clearSecretOverride,
  updateProfileWelcome,
  closeProfileMenu,
  closeGarageDirectory
} from "./ui.js";

export async function ensureUserDocument(user) {
  const userRef = doc(db, "userVisits", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      visitedVenues: [],
      completedVehicles: 0,
      displayName: user.displayName || "",
      isAnonymous: !!user.isAnonymous,
      isRegistered: !user.isAnonymous,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return {
      visitedVenues: [],
      completedVehicles: 0,
      username: "",
      usernameLower: "",
      trailReasonKey: "",
      trailReasonLabel: ""
    };
  }

  const data = snap.data();
  const visitedVenues = Array.isArray(data.visitedVenues)
    ? data.visitedVenues.filter((value) => VALID_PARTS.includes(value))
    : [];
  const completedVehicles = Number.isFinite(data.completedVehicles) ? data.completedVehicles : 0;
  const username = typeof data.username === "string" ? data.username : "";
  const usernameLower = typeof data.usernameLower === "string" ? data.usernameLower : "";
  const trailReasonKey = typeof data.trailReasonKey === "string" ? data.trailReasonKey : "";
  const trailReasonLabel = typeof data.trailReasonLabel === "string" ? data.trailReasonLabel : "";

  await setDoc(
    userRef,
    {
      visitedVenues,
      completedVehicles,
      isAnonymous: !!user.isAnonymous,
      isRegistered: !user.isAnonymous,
      displayName: username || user.displayName || data.displayName || "",
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  return {
    visitedVenues,
    completedVehicles,
    username,
    usernameLower,
    trailReasonKey,
    trailReasonLabel
  };
}

export async function loadUserCard(user) {
  const userData = await ensureUserDocument(user);

  state.currentVisitedVenues = userData.visitedVenues;
  state.currentCompletedVehicles = userData.completedVehicles;
  state.currentUsername = userData.username || "";
  state.currentUsernameLower = userData.usernameLower || "";
  state.currentTrailReasonKey = userData.trailReasonKey || "";
  state.currentTrailReasonLabel = userData.trailReasonLabel || "";

  markCard(state.currentVisitedVenues);
  updateCompletedVehicles(state.currentCompletedVehicles);
  updateProfileWelcome(state.currentUsername || getUserDisplayName(user));
  try {
    localStorage.setItem("rrDisplayName", state.currentUsername || getUserDisplayName(user));
  } catch {}
}

export async function finalizeCompletedVehicle(user) {
  const userRef = doc(db, "userVisits", user.uid);
  const leaderboardRef = doc(db, "leaderboard", user.uid);
  const nextCompletedVehiclesTotal = state.currentCompletedVehicles + 1;

  const batch = writeBatch(db);

  batch.set(
    userRef,
    {
      visitedVenues: [],
      completedVehicles: increment(1),
      displayName: state.currentUsername || getUserDisplayName(user),
      isAnonymous: !!user.isAnonymous,
      isRegistered: !user.isAnonymous,
      lastCompletedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  if (!user.isAnonymous && state.currentUsername && state.currentUsernameLower) {
    batch.set(
      leaderboardRef,
      {
        uid: user.uid,
        username: state.currentUsername,
        usernameLower: state.currentUsernameLower,
        completedVehicles: increment(1),
        updatedAt: serverTimestamp(),
        isRegistered: true
      },
      { merge: true }
    );
  }

  await batch.commit();

  state.currentVisitedVenues = [];
  state.currentCompletedVehicles = nextCompletedVehiclesTotal;
  updateCompletedVehicles(state.currentCompletedVehicles);
  showCelebrationOverlay(state.currentCompletedVehicles);

  window.setTimeout(() => {
    hideCelebrationOverlay();
    window.location.replace(RESET_REDIRECT_URL);
  }, CELEBRATION_MS);
}

export async function processVenueFromUrl(user) {
  if (state.completionInProgress) return;

  const claim = readScanClaimFromUrl();
  if (claim.state !== "valid" || !claim.partKey) return;

  const userRef = doc(db, "userVisits", user.uid);
  const snap = await getDoc(userRef);

  let visitedVenues = [];
  if (snap.exists()) {
    const data = snap.data();
    visitedVenues = Array.isArray(data.visitedVenues)
      ? data.visitedVenues.filter((value) => VALID_PARTS.includes(value))
      : [];
  } else {
    await setDoc(userRef, {
      visitedVenues: [],
      completedVehicles: 0,
      displayName: getUserDisplayName(user),
      isAnonymous: !!user.isAnonymous,
      isRegistered: !user.isAnonymous,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  if (visitedVenues.includes(claim.partKey)) {
    exitScanClaimMode();
    state.currentVisitedVenues = visitedVenues;
    markCard(visitedVenues);
    showRecordPanel();
    showStatus(
      `This stamp has already been added for ${getPartLabel(claim.partKey)}.`,
      "info",
      DUPLICATE_MESSAGE_MS
    );
    return;
  }

  state.completionInProgress = true;
  const updatedVenues = [...visitedVenues, claim.partKey];
  state.currentVisitedVenues = updatedVenues;

  await setDoc(
    userRef,
    {
      visitedVenues: arrayUnion(claim.partKey),
      displayName: state.currentUsername || getUserDisplayName(user),
      isAnonymous: !!user.isAnonymous,
      isRegistered: !user.isAnonymous,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  clearStatus();
  enterScanClaimMode();
  markCard(updatedVenues);
  playStampAnimation(claim.partKey);

  const postStampDelay = STAMP_ANIMATION_DELAY_MS + STAMP_ANIMATION_DURATION_MS + STAMP_HOLD_MS;

  if (updatedVenues.length === 8) {
    window.setTimeout(async () => {
      try {
        await finalizeCompletedVehicle(user);
      } catch (error) {
        state.completionInProgress = false;
        showStatus(error.message || "Could not complete the restoration.", "error");
      }
    }, postStampDelay);
    return;
  }

  window.setTimeout(() => {
    window.location.replace(RESET_REDIRECT_URL);
  }, postStampDelay);
}

export async function runSecretCompletionTest() {
  if (!auth.currentUser) {
    showStatus("Sign in first to use the workshop override.", "info", 3000);
    return;
  }

  if (state.completionInProgress) return;

  state.completionInProgress = true;
  clearStatus();
  dom.secretTestBtn.disabled = true;

  try {
    showRecordPanel();
    enterScanClaimMode();

    state.currentVisitedVenues = [...VALID_PARTS];
    markCard(state.currentVisitedVenues);
    playAllStampAnimations();

    const postStampDelay = STAMP_ANIMATION_DELAY_MS + STAMP_ANIMATION_DURATION_MS + STAMP_HOLD_MS;

    window.setTimeout(async () => {
      try {
        await finalizeCompletedVehicle(auth.currentUser);
        clearSecretOverride();
      } catch (error) {
        state.completionInProgress = false;
        exitScanClaimMode();
        dom.secretTestBtn.disabled = false;
        showStatus(error.message || "Could not run workshop override completion.", "error");
      }
    }, postStampDelay);
  } catch (error) {
    state.completionInProgress = false;
    exitScanClaimMode();
    dom.secretTestBtn.disabled = false;
    showStatus(error.message || "Could not run workshop override completion.", "error");
  }
}

export async function logOutFlow() {
  clearStatus();

  try {
    localStorage.removeItem("chipWorkshopOverride");
    localStorage.removeItem("rrDisplayName");
    state.secretUnlocked = false;
    resetIdentityState();
    closeProfileMenu();
    closeGarageDirectory();
    await signOut(auth);
    hideRecordPanel();
    showStatus("Logged out successfully.", "success");
  } catch (error) {
    showStatus(error.message || "Could not log out.", "error");
  }
}
