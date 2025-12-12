"Build a complete Expo React app that runs on both Web and Android.
The app is a QR Token Management System for an event.
The app must have features for generating unique QR codes, scanning QR codes, validating them, counting scanned entries, and showing statistics.
Follow the complete app specification given below."

📌 1. General Requirements

Use Expo framework (latest).

Must work on:

Android app

Web browser (PWA-ready)

Use React Navigation for screen management.

Use AsyncStorage for persistent local data.

Use functional components + hooks (React).

Code should be modular, scalable, and well-structured.

📌 2. App Structure

Create the following screens (use bottom tab navigation):

Scan Screen

Generate QR Screen

Stats/Dashboard Screen

Settings Screen

Create a folder structure like:

/src
  /screens
  /components
  /hooks
  /utils
  /db
  /styles
App.js

📌 3. Data Models

Store data in AsyncStorage with these keys:

generatedTokens: JSON({
    tokenId: {
        id: string,
        used: boolean,
        scannedAt: number | null,
        hash: string
    }
})

usedTokens: JSON({
    tokenId: boolean
})

scanLogs: ARRAY({
    tokenId: string,
    time: number,
    type: "valid"|"duplicate"|"invalid"
})

📌 4. QR Code Format

Each QR code should contain:

{
  "event": "FRESHERS2025",
  "token": "TOKEN_0001",
  "batch": 1,
  "hash": "sha256(secret + token)"
}


Implement a secret key inside the app (hardcoded constant).

Hash must be generated using SHA-256.

During scanning:

Recalculate hash

Validate authenticity

This prevents forgery.

📌 5. Features Detail (Very Important)
A. Scan Screen

Use Expo BarcodeScanner.

Instantly read QR.

Decode JSON.

Validate 3 things:

Is token in generatedTokens?

Does hash match?

Has token been used before?

Show result in a panel:

🟢 Valid Token – Marked as Used

🔴 Duplicate Token – Already Used

⚠️ Invalid QR Code

Automatically log every scan in scanLogs.

B. Generate QR Screen

Input field: How many QR codes to generate?

On click:

Generate tokens: "TOKEN_0001" → "TOKEN_XXXX".

Add to generatedTokens database.

Compute hash.

Save tokens.

Render preview list of generated QR codes.

Ability to:

Save individually as PNG

Download all generated QR as one PDF (web only)
(optional but recommended)

C. Stats / Dashboard Screen

Show these numbers in large card UI:

Total QR Generated

Total Valid Scans

Duplicate Scans

Invalid Scans

Remaining QR (not scanned)

Latest 20 Scan Logs (scrollable)

Each scan log should show:

Token ID

Time

Status (valid/duplicate/invalid)

D. Settings Screen

Include settings:

Button: Reset All Data

Clears generatedTokens, usedTokens, scanLogs.

Button: Export Scan Logs as CSV

Button: Set Admin PIN (optional)

Theme toggle: Light/Dark mode (optional)

📌 6. UI Requirements

Clean, modern, minimal UI.

Use a consistent component system:

Card

Button

Input

QRPreview

StatTile

Use responsive design for both mobile and web.

Colors:

Success (green)

Error (red)

Warning (yellow)

Neutral (gray/blue tones)

Animations:

Add simple fade/scale animation for scan success feedback.

📌 7. Logic & Performance Requirements

Scanner should scan extremely fast without lag.

Prevent multiple scans of the same QR within 2 seconds (debounce).

App should handle:

200–500 QR tokens easily

Instant validation (<150 ms)

Use optimized JSON operations.

AsyncStorage calls should be batched where possible.

📌 8. Security Requirements

Use SHA-256 to generate token hash.

Do not expose secret in generated QR.

QR must be impossible to fake without matching hash.

Duplicate detection must be 100% reliable.

📌 9. Extra Features (Optional but include in code as stubs)

Multi-device sync (prepare empty sync functions)

Event export/import using JSON file

Networking placeholder for future backend

📌 10. Final Deliverables

The system must generate:

1. Fully working Expo React app

Runs on web + Android

2. All code files

Components

Screens

Utils

Hooks

3. Detailed README

Setup instructions

Build instructions

Troubleshooting guide

Deployment steps for web & Android APK

4. Clean, understandable code

Commented

Modular

Future-proof

📌 11. User Flow Summary
Before event:

Generate 400 QR tokens.

Print them on A4.

During event:

Volunteers open scanning screen.

Scan QR.

App validates instantly.

Dashboard updates counts live.

After event:

Export logs if needed.

Reset system for next event.

🎯 **This is the complete specification.

Build the entire project exactly as described above.**