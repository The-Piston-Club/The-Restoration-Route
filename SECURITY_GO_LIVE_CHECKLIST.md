# Security go-live checklist

This is the zero-cost/static version. It is designed to run on GitHub Pages plus Firebase Spark/free plan, with no Cloud Functions and no billing card required.

## Firebase API key

The Firebase web API key in `data.js` is not a password. Firebase client apps include this key publicly so the browser SDK can identify the Firebase project.

Before launch, restrict the key in Google Cloud Console:

1. Open Google Cloud Console > APIs & Services > Credentials.
2. Select the Firebase web API key for `the-restoration-route`.
3. Set Application restrictions to Websites.
4. Add only your real domains, for example:
   - `https://the-piston-club.github.io/*`
   - `https://the-piston-club.github.io/The-Restoration-Route/*`
5. Keep sandbox domains only while testing.
6. Set API restrictions to only the Firebase/Google APIs this app uses, especially Identity Toolkit / Firebase Authentication and Cloud Firestore.

## Firestore rules

Deploy `firestore.rules` in Firebase Console before launch. They deny broad public writes and only allow signed-in users to write their own progress and scan records.

## QR security

Do not upload `Private-QR-Assets-v37` or any raw QR links to GitHub Pages. The public app does not need QR images to run; those are only for printing.

The public app contains only token hashes. That is strong enough for normal event use, but not as tamper-proof as a paid server-side Cloud Function. Use `scanEvents`, `userVisits`, and `leaderboard` for checks before awarding prizes.

## Google Maps

The route map and "Take Me There" links use normal Google Maps URLs. They do not use a Google Maps JavaScript API key.

## JustGiving

The Banter Box uses JustGiving's official crowdfunding widget. The full JustGiving page cannot be embedded because JustGiving blocks framing on the full page for security.
