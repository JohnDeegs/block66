import {
  ALARM_EXPIRE_PREFIX,
  ALARM_EMERGENCY_PREFIX,
  ALARM_PENALTY_PREFIX,
  BLOCK_DURATION_MS,
  EMERGENCY_DURATION_MS,
  PENALTY_DURATION_MS,
} from "./types";

import browser from "webextension-polyfill";

export async function scheduleExpireAlarm(
  domain: string,
  startTimestamp: number
): Promise<void> {
  await browser.alarms.create(`${ALARM_EXPIRE_PREFIX}${domain}`, {
    when: startTimestamp + BLOCK_DURATION_MS,
  });
}

export async function scheduleEmergencyAlarm(domain: string): Promise<void> {
  await browser.alarms.create(`${ALARM_EMERGENCY_PREFIX}${domain}`, {
    when: Date.now() + EMERGENCY_DURATION_MS,
  });
}

export async function schedulePenaltyAlarm(domain: string): Promise<void> {
  await browser.alarms.create(`${ALARM_PENALTY_PREFIX}${domain}`, {
    when: Date.now() + PENALTY_DURATION_MS,
  });
}

export async function clearEmergencyAlarm(domain: string): Promise<void> {
  await browser.alarms.clear(`${ALARM_EMERGENCY_PREFIX}${domain}`);
}

export async function clearPenaltyAlarm(domain: string): Promise<void> {
  await browser.alarms.clear(`${ALARM_PENALTY_PREFIX}${domain}`);
}
