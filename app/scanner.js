import { CAMERA_PERMISSION_HINT_KEY, dom } from "./core.js";
import { showStatus } from "./ui.js";

let qrScanner = null;
let qrScannerRunning = false;
let qrScanHandled = false;

function scannerSupported() {
  return (
    window.isSecureContext &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window.Html5Qrcode === "function"
  );
}

function normalizeScannedUrl(decodedText) {
  try {
    const resolved = new URL(decodedText, window.location.href);
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") return null;
    return resolved.href;
  } catch {
    return null;
  }
}

export async function getCameraPermissionState() {
  if (!navigator.permissions?.query) return "unknown";

  try {
    const permission = await navigator.permissions.query({ name: "camera" });
    return permission?.state || "unknown";
  } catch {
    return "unknown";
  }
}

function rememberCameraPermissionGranted() {
  try {
    localStorage.setItem(CAMERA_PERMISSION_HINT_KEY, "granted");
  } catch {}
}

export async function stopScanner() {
  if (qrScanner) {
    try {
      if (qrScannerRunning) await qrScanner.stop();
    } catch {}

    try {
      await qrScanner.clear();
    } catch {}
  }

  qrScanner = null;
  qrScannerRunning = false;
  qrScanHandled = false;
}

export async function closeScannerOverlay() {
  dom.scannerOverlay.classList.remove("show");
  dom.scannerOverlay.setAttribute("aria-hidden", "true");
  dom.scannerHelp.textContent =
    "Bought something and ready for the next fix? Ask a member of staff to show you the repair QR code, then point your camera at it.";
  await stopScanner();
}

async function handleScanSuccess(decodedText) {
  if (qrScanHandled) return;
  qrScanHandled = true;

  const targetUrl = normalizeScannedUrl(decodedText);
  if (!targetUrl) {
    qrScanHandled = false;
    dom.scannerHelp.textContent = "That QR code did not contain a valid web link.";
    return;
  }

  dom.scannerHelp.textContent = "QR code captured. Opening…";
  await closeScannerOverlay();
  window.location.href = targetUrl;
}

export async function startScanner() {
  if (!scannerSupported()) {
    showStatus("Camera scanning needs HTTPS and a supported browser camera API.", "error");
    return;
  }

  const permissionState = await getCameraPermissionState();

  if (permissionState === "denied") {
    showStatus(
      "Camera access is blocked for this browser or site. Please allow camera access in your browser settings.",
      "error"
    );
    return;
  }

  dom.scannerOverlay.classList.add("show");
  dom.scannerOverlay.setAttribute("aria-hidden", "false");
  dom.scannerHelp.textContent =
    permissionState === "granted" || localStorage.getItem(CAMERA_PERMISSION_HINT_KEY) === "granted"
      ? "Opening camera…"
      : "Starting camera…";

  await stopScanner();

  qrScanner = new window.Html5Qrcode("qr-reader");
  const config = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1
  };

  const scannerReadyText =
    "Bought something and ready for the next fix? Ask a member of staff to show you the repair QR code, then point your camera at it.";

  try {
    await qrScanner.start({ facingMode: { exact: "environment" } }, config, handleScanSuccess, () => {});
    qrScannerRunning = true;
    rememberCameraPermissionGranted();
    dom.scannerHelp.textContent = scannerReadyText;
    return;
  } catch {}

  try {
    await qrScanner.start({ facingMode: "environment" }, config, handleScanSuccess, () => {});
    qrScannerRunning = true;
    rememberCameraPermissionGranted();
    dom.scannerHelp.textContent = scannerReadyText;
    return;
  } catch {}

  try {
    const cameras = await window.Html5Qrcode.getCameras();
    if (!cameras || cameras.length === 0) throw new Error("No camera found.");

    const backCamera =
      cameras.find((camera) => /back|rear|environment/i.test(camera.label)) ||
      cameras[cameras.length - 1];

    await qrScanner.start(backCamera.id, config, handleScanSuccess, () => {});
    qrScannerRunning = true;
    rememberCameraPermissionGranted();
    dom.scannerHelp.textContent = scannerReadyText;
  } catch (error) {
    await closeScannerOverlay();
    showStatus(error?.message || "Could not start the camera scanner.", "error");
  }
}
