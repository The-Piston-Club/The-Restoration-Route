The Restoration Route — Public GitHub Upload Build v80

This is the public app package intended for GitHub Pages upload.

Upload the contents of this folder to the GitHub repository root, or to the folder used for the GitHub Pages site.

Public build notes:
- Uses the latest v79 repair UI layout as the default public layout.
- The repair UI stage is anchored to the same centred mobile app stage as the home UI.
- The final vehicle completion flow is included: broken vehicle -> repair transition -> repaired vehicle.
- The scanner development test buttons are disabled for the public build.
- Layout/editor HTML files and private route-code QR image files have been excluded from this public package.
- The service worker cache has been bumped to v80.

Core files:
- index.html
- app.js
- data.js
- styles.css
- manifest.webmanifest
- service-worker.js
- firestore.rules
- assets/

If the browser appears to show an older cached version after upload, clear site data or hard refresh once.


V81 notes:
- Public build ignores/removes old layout-editor localStorage keys so bad editor drafts cannot override the shipped layout.
- Scanner, venue, directory, home and repair screens now share one mobile stage scale.
- Firebase sign-in persistence no longer silently falls back to memory persistence on hosted builds.
- Service worker uses network-first loading for app shell files to reduce stale cached versions.


v82 auth update: the app now resumes directly into the remembered local account/profile instead of showing Create Account again when a saved profile exists. Firebase Auth still uses browser persistence when available, and logging out clears the remembered local profile.
