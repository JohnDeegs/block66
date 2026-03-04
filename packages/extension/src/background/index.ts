import browser from "webextension-polyfill";
import {
  ALARM_EXPIRE_PREFIX,
  ALARM_EMERGENCY_PREFIX,
  ALARM_PENALTY_PREFIX,
  BLOCK_DURATION_MS,
  EMERGENCY_DURATION_MS,
  PENALTY_DURATION_MS,
  type ExtensionMessage,
  type ExtensionResponse,
} from "@block66/shared";
import {
  getStorage,
  addBlockedSite,
  removeBlockedSite,
  clearEmergencyAccess,
  clearPenalty,
  setEmergencyAccess,
  setPenalty,
  incrementEmergencyCount,
} from "@block66/shared";
import { addBlockRule, removeBlockRule } from "@block66/shared";
import {
  scheduleExpireAlarm,
  scheduleEmergencyAlarm,
  schedulePenaltyAlarm,
} from "@block66/shared";

// --- Alarm handler ---

browser.alarms.onAlarm.addListener(async (alarm) => {
  const { name } = alarm;

  if (name.startsWith(ALARM_EXPIRE_PREFIX)) {
    const domain = name.slice(ALARM_EXPIRE_PREFIX.length);
    await removeBlockRule(domain);
    await removeBlockedSite(domain);
    return;
  }

  if (name.startsWith(ALARM_EMERGENCY_PREFIX)) {
    const domain = name.slice(ALARM_EMERGENCY_PREFIX.length);
    await clearEmergencyAccess(domain);
    await addBlockRule(domain);
    return;
  }

  if (name.startsWith(ALARM_PENALTY_PREFIX)) {
    const domain = name.slice(ALARM_PENALTY_PREFIX.length);
    await clearPenalty(domain);
    return;
  }
});

// --- External message handler (website <-> extension bridge) ---

browser.runtime.onMessageExternal.addListener(
  (message: unknown, _sender, sendResponse) => {
    const msg = message as ExtensionMessage;
    handleExternalMessage(msg)
      .then((res) => sendResponse(res))
      .catch((err) =>
        sendResponse({ ok: false, error: String(err) } as ExtensionResponse)
      );
    return true; // keep message channel open for async response
  }
);

async function handleExternalMessage(
  msg: ExtensionMessage
): Promise<ExtensionResponse> {
  switch (msg.type) {
    case "GET_DATA": {
      const data = await getStorage();
      return { ok: true, data };
    }

    case "REMOVE_SITE": {
      const { domain } = msg;
      await browser.alarms.clear(`${ALARM_EXPIRE_PREFIX}${domain}`);
      await browser.alarms.clear(`${ALARM_EMERGENCY_PREFIX}${domain}`);
      await browser.alarms.clear(`${ALARM_PENALTY_PREFIX}${domain}`);
      await removeBlockRule(domain);
      await removeBlockedSite(domain);
      return { ok: true };
    }

    case "ADD_SITE": {
      const { domain } = msg;
      const startTimestamp = Date.now();
      await addBlockedSite({ domain, startTimestamp, emergencyUseCount: 0 });
      await addBlockRule(domain);
      await scheduleExpireAlarm(domain, startTimestamp);
      return { ok: true };
    }

    case "GRANT_EMERGENCY": {
      const { domain } = msg;
      const expiresAt = Date.now() + EMERGENCY_DURATION_MS;
      await incrementEmergencyCount(domain);
      await setEmergencyAccess(domain, expiresAt);
      await removeBlockRule(domain);
      await scheduleEmergencyAlarm(domain);
      return { ok: true };
    }

    case "APPLY_PENALTY": {
      const { domain } = msg;
      const expiresAt = Date.now() + PENALTY_DURATION_MS;
      await setPenalty(domain, expiresAt);
      await schedulePenaltyAlarm(domain);
      return { ok: true };
    }

    case "RETRY_TRIVIA": {
      // No storage changes needed — just acknowledge so the blocked page
      // can re-fetch new trivia questions.
      return { ok: true };
    }

    default: {
      return { ok: false, error: "Unknown message type" };
    }
  }
}

// --- Alarm reconciliation on install / startup ---

async function reconcileAlarms(): Promise<void> {
  const { blockedSites, emergencyAccess, penalties } = await getStorage();
  const existingAlarms = await browser.alarms.getAll();
  const existingNames = new Set(existingAlarms.map((a) => a.name));

  for (const [domain, site] of Object.entries(blockedSites)) {
    const alarmName = `${ALARM_EXPIRE_PREFIX}${domain}`;
    if (!existingNames.has(alarmName)) {
      const expireAt = site.startTimestamp + BLOCK_DURATION_MS;
      if (expireAt > Date.now()) {
        await browser.alarms.create(alarmName, { when: expireAt });
      } else {
        // Block expired while extension was inactive — clean up now
        await removeBlockRule(domain);
        await removeBlockedSite(domain);
      }
    }
  }

  for (const [domain, record] of Object.entries(emergencyAccess)) {
    const alarmName = `${ALARM_EMERGENCY_PREFIX}${domain}`;
    if (!existingNames.has(alarmName)) {
      if (record.expiresAt > Date.now()) {
        await browser.alarms.create(alarmName, { when: record.expiresAt });
      } else {
        await clearEmergencyAccess(domain);
        await addBlockRule(domain);
      }
    }
  }

  for (const [domain, record] of Object.entries(penalties)) {
    const alarmName = `${ALARM_PENALTY_PREFIX}${domain}`;
    if (!existingNames.has(alarmName)) {
      if (record.expiresAt > Date.now()) {
        await browser.alarms.create(alarmName, { when: record.expiresAt });
      } else {
        await clearPenalty(domain);
      }
    }
  }
}

browser.runtime.onInstalled.addListener(reconcileAlarms);
browser.runtime.onStartup.addListener(reconcileAlarms);
