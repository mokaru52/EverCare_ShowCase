EverCare — Public Showcase 

A mobile app (React Native, Android-first) that helps older adults and caregivers manage medications, doctor appointments, and safety.

Status: Pre-API / Pre-security. This is a sanitized version of our MAHAT submission.
Real integrations and credentials live in a private working repo.
A runnable offline branch (demo-mock) will be added next.

✨ Highlights

Medication management UI — list, dose, schedule (demo UI).

Appointments — upcoming visits + “next appointment” widget (demo UI).

Safety — fall-detection scaffolding + one-tap Emergency flow (MADA/caregiver).

DDI concept — flags potential drug–drug interactions (informational only).

Clean architecture — TypeScript, modular screens/components/services, Android native scaffolding for background work.

🧭 Two-Repo Model

Private Working Repo — active development, real APIs (FHIR/SMART-on-FHIR), Firebase/Auth, security hardening.

This Public Showcase — safe code & UI for review (no secrets, no PHI, no live API calls).

🩺 Feature Details
DDI (Drug–Drug Interaction)

Goal: raise awareness of potential interactions when users add/edit meds.

Behavior (showcase): compares med pairs against a small mock index and shows severity labels (e.g., informational / monitor / avoid) + a short rationale and disclaimer.

Privacy: can run locally for common pairs; richer cloud checks exist in the private repo.

Fall Detection

Heuristics: impact spike → short immobility (optionally posture check).

UX: alert shows a Cancel timer (e.g., 20–30s). If not cancelled, it escalates to Emergency.

Tech: Android native scaffolding for sensors/receivers. In demo-mock, sensors can be simulated for repeatable demos.

Emergency Calls (MADA / Caregiver)

One-tap Emergency: choose MADA (101) or a configured caregiver contact.

Auto-escalation: if a fall isn’t cancelled in time, auto-call MADA; optionally send SMS to caregiver (permissions required).

Showcase note: Calls/SMS are simulated here; the private repo contains real flows and permission handling.

🏗️ Architecture

React Native + TypeScript: screens, components, navigation (stack/drawer/tab), context state, theming.

Services: fall detection, notifications, permissions helpers.

Android Native (Java): background listener + receivers; bridges to RN.

Mocks: provider slots/doctors + DDI samples for offline demos.

📁 Project Structure (typical)
root/
  android/                      # Native Android project
  ios/                          # Native iOS project (placeholder at this stage)
  src/
    components/                 # Reusable UI
    screens/                    # Home, Medications, Appointments, Safety, Settings
    navigation/                 # Navigators & route maps
    context/                    # SettingsContext, mock/global state
    services/                   # fallDetection, notifications, permissions
    mocks/                      # mock providers, slots, sample DDI pairs
    styles/                     # colors / global styles
    types/                      # TypeScript interfaces
    utils/                      # helpers & theming hooks
  assets/
  app.json
  package.json
  tsconfig.json
  babel.config.js
  metro.config.js


In this snapshot, sensitive files (e.g., config/firebase.ts, .env, mobile configs) are intentionally not included.

🔍 How to Review (now)

Browse src/screens/, src/services/, src/mocks/, src/navigation/, src/context/ to see UI composition and logic scaffolding.

Check the fall-detection → emergency flow wiring and DDI handling patterns.

This branch is code-review focused and may not build without private config.

▶️ How to Run (soon)

A fully offline demo branch demo-mock will be published:

git clone https://github.com/<your-username>/EverCare_ShowCase
cd EverCare_ShowCase
git checkout demo-mock
npm install
npm run android   # or: npm run ios


That branch will use mock appointments, mock DDI, and a simulated fall → emergency flow (no keys required).

🔒 Security & Privacy

Excluded by design (never stored in this repo):

.env, .env.*

android/app/google-services.json

ios/GoogleService-Info.plist

serviceAccount*.json, *.jks, *.keystore

We follow “public code / private credentials.”
Disclaimer: EverCare is not a medical device. DDI prompts are informational; users should consult a clinician.

🗺️ Roadmap

Public Showcase

v1.0-exam — sanitized MAHAT snapshot (this)

demo-mock — runnable offline demo (mock data + simulated safety)

Screenshots + short demo clip in README

Private Working Repo

Firebase/Auth with App Check, provider APIs (FHIR/SMART-on-FHIR)

Cloud DDI service with richer data sources

CI, accessibility, and performance polish

🧰 Tech Stack

React Native (TypeScript), Android native modules (Java), mock data/state for demos, global styles/typography.

📜 License

MIT (see LICENSE).

🤝 Contact

Maintainers: Yevgeny Nikolayev & Marcel Maron
For collaboration or to review the private roadmap, please open an issue.