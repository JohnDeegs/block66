import browser from "webextension-polyfill";
import { domainToRuleId } from "./utils";

/** Add a declarativeNetRequest redirect rule for a domain */
export async function addBlockRule(domain: string): Promise<void> {
  const id = domainToRuleId(domain);
  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [id],
    addRules: [
      {
        id,
        priority: 1,
        action: {
          type: "redirect",
          redirect: {
            extensionPath: `/src/blocked/index.html?domain=${encodeURIComponent(domain)}`,
          },
        },
        condition: {
          urlFilter: `||${domain}`,
          resourceTypes: ["main_frame"],
        },
      },
    ],
  } as Parameters<typeof browser.declarativeNetRequest.updateDynamicRules>[0]);
}

/** Remove the declarativeNetRequest redirect rule for a domain */
export async function removeBlockRule(domain: string): Promise<void> {
  const id = domainToRuleId(domain);
  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [id],
    addRules: [],
  } as Parameters<typeof browser.declarativeNetRequest.updateDynamicRules>[0]);
}
