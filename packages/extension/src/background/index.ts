import browser from "webextension-polyfill";
import {
  ALARM_EXPIRE_PREFIX,
  ALARM_EMERGENCY_PREFIX,
  ALARM_PENALTY_PREFIX,
  EMERGENCY_DURATION_MS,
  PENALTY_DURATION_MS,
  type ExtensionMessage,
  type ExtensionResponse,
  type StorageData,
  normalizeDomain,
  isValidDomain,
} from "@block66/shared";
import { addBlockRule, removeBlockRule, setStorage } from "@block66/shared";
import {
  scheduleExpireAlarm,
  scheduleEmergencyAlarm,
  schedulePenaltyAlarm,
} from "@block66/shared";
import { apiGet, apiPost, setToken } from "../api.js";

// Suppress unused import warnings — these are kept for alarm scheduling
void EMERGENCY_DURATION_MS;
void PENALTY_DURATION_MS;

// --- Sync block rules from API ---

async function syncFromApi(): Promise<void> {
  let data: StorageData;
  try {
    data = (await apiGet("/sites")) as StorageData;
  } catch {
    // No token or API unreachable — clear all rules so nothing is orphaned
    const existing = await browser.declarativeNetRequest.getDynamicRules();
    if (existing.length > 0) {
      await browser.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existing.map((r) => r.id),
        addRules: [],
      } as Parameters<typeof browser.declarativeNetRequest.updateDynamicRules>[0]);
    }
    return;
  }

  const { blockedSites, emergencyAccess, penalties } = data;

  // Mirror API state to local storage so the blocked page can read it
  await setStorage({ blockedSites, emergencyAccess, penalties });

  // Remove all existing dynamic rules, then re-apply from API state
  const existing = await browser.declarativeNetRequest.getDynamicRules();
  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map((r) => r.id),
    addRules: [],
  } as Parameters<typeof browser.declarativeNetRequest.updateDynamicRules>[0]);

  const nowMs = Date.now();
  for (const domain of Object.keys(blockedSites)) {
    const hasActiveEmergency =
      emergencyAccess[domain] && emergencyAccess[domain].expiresAt > nowMs;
    if (!hasActiveEmergency) {
      await addBlockRule(domain);
    }
  }
}

// --- Alarm handler ---

browser.alarms.onAlarm.addListener(async (alarm) => {
  const { name } = alarm;

  if (name.startsWith(ALARM_EXPIRE_PREFIX)) {
    const domain = name.slice(ALARM_EXPIRE_PREFIX.length);
    await removeBlockRule(domain);
    return;
  }

  if (name.startsWith(ALARM_EMERGENCY_PREFIX)) {
    const domain = name.slice(ALARM_EMERGENCY_PREFIX.length);
    await addBlockRule(domain);
    return;
  }

  // ALARM_PENALTY_PREFIX — no rule change needed
});

// --- Internal message handler (blocked page → background) ---

browser.runtime.onMessage.addListener(
  (message: unknown, _sender, sendResponse) => {
    const msg = message as ExtensionMessage;
    handleInternalMessage(msg)
      .then((res) => sendResponse(res))
      .catch((err) =>
        sendResponse({ ok: false, error: String(err) } as ExtensionResponse)
      );
    return true;
  }
);

// --- External message handler (website → extension: SET_TOKEN only) ---

browser.runtime.onMessageExternal.addListener(
  (message: unknown, _sender, sendResponse) => {
    const msg = message as ExtensionMessage;
    handleExternalMessage(msg)
      .then((res) => sendResponse(res))
      .catch((err) =>
        sendResponse({ ok: false, error: String(err) } as ExtensionResponse)
      );
    return true;
  }
);

async function handleExternalMessage(
  msg: ExtensionMessage
): Promise<ExtensionResponse> {
  if (msg.type === "SET_TOKEN") {
    await setToken(msg.token);
    await syncFromApi();
    return { ok: true };
  }
  return { ok: false, error: "Unknown external message type" };
}

async function handleInternalMessage(
  msg: ExtensionMessage
): Promise<ExtensionResponse> {
  switch (msg.type) {
    case "GRANT_EMERGENCY": {
      const domain = normalizeDomain(msg.domain);
      if (!isValidDomain(domain)) return { ok: false, error: "Invalid domain" };
      await apiPost(`/sites/${domain}/emergency`);
      await removeBlockRule(domain);
      await scheduleEmergencyAlarm(domain);
      return { ok: true };
    }

    case "APPLY_PENALTY": {
      const domain = normalizeDomain(msg.domain);
      if (!isValidDomain(domain)) return { ok: false, error: "Invalid domain" };
      await apiPost(`/sites/${domain}/penalty`);
      await schedulePenaltyAlarm(domain);
      return { ok: true };
    }

    case "RETRY_TRIVIA": {
      return { ok: true };
    }

    default: {
      return { ok: false, error: "Unknown message type" };
    }
  }
}

// --- Reconcile alarms + sync rules on startup / install ---

async function reconcileAlarms(): Promise<void> {
  let data: StorageData;
  try {
    data = (await apiGet("/sites")) as StorageData;
  } catch {
    return;
  }

  const { blockedSites, emergencyAccess, penalties } = data;
  const existingAlarms = await browser.alarms.getAll();
  const existingNames = new Set(existingAlarms.map((a) => a.name));
  const nowMs = Date.now();
  const blockDurationMs = 66 * 24 * 60 * 60 * 1000;

  for (const [domain, site] of Object.entries(blockedSites)) {
    const alarmName = `${ALARM_EXPIRE_PREFIX}${domain}`;
    if (!existingNames.has(alarmName)) {
      const expireAt = site.startTimestamp + blockDurationMs;
      if (expireAt > nowMs) {
        await scheduleExpireAlarm(domain, site.startTimestamp);
      }
    }
  }

  for (const [domain, record] of Object.entries(emergencyAccess)) {
    const alarmName = `${ALARM_EMERGENCY_PREFIX}${domain}`;
    if (!existingNames.has(alarmName) && record.expiresAt > nowMs) {
      await scheduleEmergencyAlarm(domain);
    }
  }

  for (const [domain, record] of Object.entries(penalties)) {
    const alarmName = `${ALARM_PENALTY_PREFIX}${domain}`;
    if (!existingNames.has(alarmName) && record.expiresAt > nowMs) {
      await schedulePenaltyAlarm(domain);
    }
  }

  await syncFromApi();
}

browser.runtime.onInstalled.addListener(reconcileAlarms);
browser.runtime.onStartup.addListener(reconcileAlarms);
