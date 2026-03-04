import browser from "webextension-polyfill";
import type { StorageData, BlockedSite } from "./types";

export async function getStorage(): Promise<StorageData> {
  const result = await browser.storage.local.get(null);
  return {
    blockedSites: (result["blockedSites"] as StorageData["blockedSites"]) ?? {},
    emergencyAccess:
      (result["emergencyAccess"] as StorageData["emergencyAccess"]) ?? {},
    penalties: (result["penalties"] as StorageData["penalties"]) ?? {},
  };
}

export async function setStorage(partial: Partial<StorageData>): Promise<void> {
  await browser.storage.local.set(partial as Record<string, unknown>);
}

export async function addBlockedSite(site: BlockedSite): Promise<void> {
  const { blockedSites } = await getStorage();
  blockedSites[site.domain] = site;
  await setStorage({ blockedSites });
}

export async function removeBlockedSite(domain: string): Promise<void> {
  const data = await getStorage();
  delete data.blockedSites[domain];
  delete data.emergencyAccess[domain];
  delete data.penalties[domain];
  await setStorage(data);
}

export async function setEmergencyAccess(
  domain: string,
  expiresAt: number
): Promise<void> {
  const { emergencyAccess } = await getStorage();
  emergencyAccess[domain] = { expiresAt };
  await setStorage({ emergencyAccess });
}

export async function clearEmergencyAccess(domain: string): Promise<void> {
  const { emergencyAccess } = await getStorage();
  delete emergencyAccess[domain];
  await setStorage({ emergencyAccess });
}

export async function setPenalty(
  domain: string,
  expiresAt: number
): Promise<void> {
  const { penalties } = await getStorage();
  penalties[domain] = { expiresAt };
  await setStorage({ penalties });
}

export async function clearPenalty(domain: string): Promise<void> {
  const { penalties } = await getStorage();
  delete penalties[domain];
  await setStorage({ penalties });
}

export async function incrementEmergencyCount(domain: string): Promise<void> {
  const { blockedSites } = await getStorage();
  if (blockedSites[domain]) {
    blockedSites[domain].emergencyUseCount++;
    await setStorage({ blockedSites });
  }
}
