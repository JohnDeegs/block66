import browser from "webextension-polyfill";
import { getStorage, normalizeDomain, formatCountdown } from "@block66/shared";

const HOST_ID = "block66-timer-root";

async function maybeInjectTimer(): Promise<void> {
  const hostname = normalizeDomain(window.location.hostname);
  const { emergencyAccess } = await getStorage();
  const record = emergencyAccess[hostname];

  if (!record || record.expiresAt <= Date.now()) {
    removeTimer();
    return;
  }

  injectTimer(record.expiresAt);
}

function injectTimer(expiresAt: number): void {
  if (document.getElementById(HOST_ID)) return; // already injected

  const host = document.createElement("div");
  host.id = HOST_ID;
  host.style.cssText =
    "position:fixed;bottom:20px;right:20px;z-index:2147483647;";
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  // Inject styles into shadow root
  const style = document.createElement("style");
  style.textContent = `
    .timer {
      background: #1a1a24;
      border: 1px solid #6c63ff;
      border-radius: 10px;
      padding: 10px 14px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #e8e8f0;
      font-size: 13px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      min-width: 140px;
    }
    .timer-label {
      font-size: 10px;
      color: #888899;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 4px;
    }
    .timer-count {
      font-size: 18px;
      font-weight: 700;
      color: #6c63ff;
    }
    .timer-domain {
      font-size: 10px;
      color: #888899;
      margin-top: 3px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 160px;
    }
  `;
  shadow.appendChild(style);

  const container = document.createElement("div");
  container.className = "timer";
  shadow.appendChild(container);

  const labelEl = document.createElement("div");
  labelEl.className = "timer-label";
  labelEl.textContent = "Block66 — Emergency Access";
  container.appendChild(labelEl);

  const countEl = document.createElement("div");
  countEl.className = "timer-count";
  container.appendChild(countEl);

  const domainEl = document.createElement("div");
  domainEl.className = "timer-domain";
  domainEl.textContent = normalizeDomain(window.location.hostname);
  container.appendChild(domainEl);

  // Live countdown tick
  const tick = () => {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      removeTimer();
      return;
    }
    countEl.textContent = formatCountdown(remaining);
  };
  tick();
  const intervalId = setInterval(tick, 1000);

  // Store interval ID on the host element for cleanup
  (host as HTMLElement & { _block66Interval?: ReturnType<typeof setInterval> })
    ._block66Interval = intervalId;
}

function removeTimer(): void {
  const host = document.getElementById(HOST_ID) as
    | (HTMLElement & { _block66Interval?: ReturnType<typeof setInterval> })
    | null;
  if (!host) return;
  if (host._block66Interval) clearInterval(host._block66Interval);
  host.remove();
}

// React to storage changes (e.g. emergency access granted or expired)
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && "emergencyAccess" in changes) {
    maybeInjectTimer();
  }
});

// Initial check on page load
maybeInjectTimer();
