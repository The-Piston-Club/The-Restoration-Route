# The Restoration Route — Finished Static Firebase Build

Upload the contents of this folder to:

https://the-piston-club.github.io/The-Restoration-Route

## Firebase setup required

1. Firebase Authentication → Sign-in method → enable Email/Password.
2. Authentication → Settings → Authorized domains → add:
   the-piston-club.github.io
3. Firestore Database → create database.
4. Apply the included `firestore.rules`.
5. Keep the Firebase project on Spark/free plan if zero cost is the hard requirement.

## Included

- Exact JSON layout positioning.
- Home as the base screen.
- Menu, Garage Directory and Venue pages as popups over Home.
- Scanner as a full-screen screen.
- Email/password account creation.
- Required username on registration.
- Basic offensive username blocking.
- Terms/prize-draw consent checkbox.
- Firebase email verification email sent on sign-up.
- Prize entries only become eligible if email is verified.
- Firestore user progress, leaderboard and scan event structures.
- 8 venues and 8 component repairs.
- Random long QR scan tokens rather than venue-name URLs.
- URL is immediately cleaned with `history.replaceState()` after a QR/deep-link scan.
- Raw QR links and QR PNGs are not included in the public upload folder. Keep `Private-QR-Assets-v37` local/private for printing.
- Issues button opens email to chip@thepistonclub.co.uk.
- Admin: open Menu, tap the Restoration Route logo 5 times, then press the red X. Code: Watson.

## Prize-draw tracking

For the zero-cost version, use these Firestore collections:

- `userVisits/{uid}`: user route progress and completed vehicle totals.
- `leaderboard/{uid}`: completed vehicles, prize entries, and public username.
- `scanEvents`: append-only scan log written when a user scans a valid route QR.

This is the strongest no-billing version. Because it avoids paid Cloud Functions, validation happens in the public web app rather than on a private server. Keep the private QR folder off GitHub and use the scan logs for common-sense checks before awarding prizes.
