A mobile app (React Native, Android-first) to help older adults and caregivers manage appointments, medications, and safety needs—built as a practical engineering capstone. This repo is a sanitized showcase: code and assets that demonstrate the UI, core flows, and native modules, without real provider integrations or private keys.

This is a student project at a pre-launch stage; several screens and support features are placeholders by design.

✨ What’s inside (showcase scope)

Core screens & UX: Home, Appointment Center, History, Medication, Settings, Login/Signup, Support (placeholder).

Architecture: UI screens, services layer, global state (context), navigation, types/utilities, Android native modules.

Mock data for Israeli providers (Maccabi, Clalit, Meuhedet, Leumit) to demo appointment flows offline.

Native Android code (Java) for background services, notifications, settings bridging, and fall-detection scaffolding.

Full source appendix in the project book lists folders like screens/, services/, context/, navigation/, types/, utils/, styles/, mocks/, and Android Java modules.

🧭 Feature overview (current)

Appointment browsing and mock scheduling across major Israeli providers (demo data).

Medication tracker (demo).

Basic auth flows (email/password UI wired to a dummy auth layer in this showcase).

Theming + accessibility considerations (typography, color system).

Support page and FAQ placeholders to set expectations.

🏗️ Architecture at a glance
root/
  App.tsx
  screens/                # Feature screens & UI components
  services/               # Appointment, notifications, fall detection, permissions
  context/                # Global SettingsContext & providers
  navigation/             # Navigators & routes
  types/                  # TypeScript interfaces
  utils/                  # Helpers & theming hooks
  styles/                 # Colors & global styles
  mocks/                  # Mock provider doctors/slots JSON
  android/app/src/...     # Native Android modules & services


Supported by the project book’s structure section.

🧪 Mock data

This showcase includes JSON fixtures for providers and slots to keep the app fully demoable offline:
mocks/clalitDoctors.json, mocks/maccabiSlots.json, mocks/meuhedetSlots.json, mocks/leumitSlots.json, etc.

🔐 Security & data

No real API calls; no provider credentials; no Firebase keys in this repo.

Secrets belong in a private repository and .env files excluded via .gitignore.

If you’re evaluating: everything here is intentionally safe to view.

For collaborators, a private “secrets-local/” package (shared out-of-band) provides keys/configs in the working repo (not this showcase).
📱 Key native pieces (Android)

MainActivity starts background services; New Architecture flags are wired.

SettingsModule and packages bridge settings/notifications to RN and send broadcasts.

Fall-detection scaffolding & receivers are registered properly for Android 13+.

🧩 Tech stack

React Native (TypeScript) UI & navigation

Android native modules (Java)

Mock data + local state for demo

Design: Colors/Global styles and Raleway typography referenced in code

Related learning resources used during development include React Native & Firebase docs and course materials.

🗺️ Roadmap (post-showcase)

Replace mocks with real provider APIs (FHIR/SMART-on-FHIR) in the private repo.

Secure auth & data (Firebase/Auth), with no secrets in git.

CI for lint/tests/build on private repo.

Accessibility & performance polish.

🤝 Team & credit

Built by a Marcel Maroon and Yevgeny Nikolayev as part of a practical engineering program. This repo is a public, safe showcase; the active, private repo contains real integrations and credentials.

