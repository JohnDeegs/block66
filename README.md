# Block66

A browser extension + website that blocks distracting websites for exactly **66 days** — the scientifically backed duration for forming a lasting habit (Lally et al., 2010).

**Live site:** https://block66-extension-wl3m.vercel.app

---

## How it works

- Add a domain in the dashboard and it is blocked immediately via Chrome's `declarativeNetRequest` API
- The block is intentionally immutable for 66 days — the commitment is the point
- Visiting a blocked site shows a **Focus Screen** with your progress and a daily message
- **Emergency 1-hour access** is available but requires passing a 5-question trivia gate (Open Trivia Database)
- All data is stored locally in `chrome.storage.local` — no server, no accounts, no tracking

---

## Repository structure

```
block-websites/
├── packages/
│   ├── extension/   # Chrome/Firefox MV3 browser extension
│   ├── website/     # Public landing page + dashboard (React + Vite)
│   └── shared/      # Shared TypeScript types, storage helpers, utils
├── package.json     # npm workspaces root
└── vercel.json
```

## Tech stack

| Layer | Tech |
|---|---|
| Extension | Manifest V3, `declarativeNetRequest`, `chrome.storage.local`, `chrome.alarms` |
| Extension UI | React + Vite + TypeScript |
| Website | React + Vite + React Router |
| Cross-browser | `webextension-polyfill` |
| Build | `vite-plugin-web-extension` |
| Hosting | Vercel |
| Trivia API | [Open Trivia Database](https://opentdb.com) |

---

## Local development

### Prerequisites

- Node.js 18+
- npm 8+ (workspaces support)

### Setup

```bash
git clone https://github.com/JohnDeegs/block66.git
cd block66
npm install
```

### Run the website

```bash
npm run dev:website
# → http://localhost:5173
```

### Build the extension

```bash
npm run build:extension        # Chrome
npm run build:extension:firefox  # Firefox
```

Then load `packages/extension/dist/` as an unpacked extension in `chrome://extensions/`.

### Connect the website to your local extension

1. Copy the extension ID from `chrome://extensions/`
2. Create `packages/website/.env.local`:
   ```
   VITE_EXTENSION_ID=your_extension_id_here
   ```
3. Restart the dev server

---

## Architecture notes

### Blocking mechanism

`declarativeNetRequest` dynamic rules redirect all navigation to blocked domains to the extension's built-in Focus Screen (`src/blocked/index.html`). Rule IDs are derived from a djb2 hash of the domain string.

### Alarm system

Three alarm types manage time-based events:

| Alarm | Duration | Action |
|---|---|---|
| `block66-expire-{domain}` | 66 days | Removes block rule and storage entry |
| `block66-emergency-{domain}` | 60 minutes | Re-applies block rule |
| `block66-penalty-{domain}` | 5 minutes | Clears penalty cooldown |

On extension startup and install, `reconcileAlarms()` compares storage against active alarms and recreates any that were lost (e.g. after a browser update).

### Website ↔ Extension bridge

The website communicates with the extension via `chrome.runtime.sendMessage` using the `externally_connectable` manifest key. The extension background service worker handles `GET_DATA`, `ADD_SITE`, `REMOVE_SITE`, `GRANT_EMERGENCY`, `APPLY_PENALTY`, and `RETRY_TRIVIA` messages.

### Shared package split

`packages/shared` has two entry points:
- `src/index.ts` — types and utils only (safe for the website, no browser extension APIs)
- `src/ext.ts` — full export including storage/rules/alarms (extension only)

This prevents `webextension-polyfill` from being bundled into the website.

---

## Deployment

The website is deployed to Vercel. The `vercel.json` at the repo root targets `packages/website` explicitly. Vercel's Root Directory should be set to `packages/website` in project settings.

---

## License

MIT
