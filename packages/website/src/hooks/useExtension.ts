import { useState, useEffect, useCallback } from "react";
import type {
  StorageData,
  ExtensionMessage,
  ExtensionResponse,
} from "@block66/shared";

// The extension ID must match the installed extension.
// In development, load the unpacked extension and copy its ID from chrome://extensions
// then set it here (or via an env variable).
// For production, this will be the published extension's ID.
const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID as string | undefined;

export type ExtensionStatus =
  | "detecting"
  | "not-installed"
  | "connected"
  | "error";

export interface UseExtensionReturn {
  status: ExtensionStatus;
  data: StorageData | null;
  refresh: () => Promise<void>;
  sendMessage: (msg: ExtensionMessage) => Promise<ExtensionResponse>;
}

function getChromeRuntime(): typeof chrome.runtime | null {
  try {
    if (typeof chrome !== "undefined" && chrome.runtime) return chrome.runtime;
  } catch {}
  return null;
}

async function sendToExtension(
  msg: ExtensionMessage
): Promise<ExtensionResponse> {
  const rt = getChromeRuntime();
  if (!rt || !EXTENSION_ID) {
    return { ok: false, error: "Extension not available" };
  }
  return new Promise((resolve) => {
    rt.sendMessage(EXTENSION_ID, msg, (response: ExtensionResponse) => {
      if (rt.lastError) {
        resolve({ ok: false, error: rt.lastError.message ?? "Unknown error" });
      } else {
        resolve(response);
      }
    });
  });
}

export function useExtension(): UseExtensionReturn {
  const [status, setStatus] = useState<ExtensionStatus>("detecting");
  const [data, setData] = useState<StorageData | null>(null);

  const refresh = useCallback(async () => {
    const res = await sendToExtension({ type: "GET_DATA" });
    if (res.ok && "data" in res) {
      setData(res.data);
      setStatus("connected");
    } else {
      setStatus("not-installed");
    }
  }, []);

  const sendMessage = useCallback(
    async (msg: ExtensionMessage): Promise<ExtensionResponse> => {
      const res = await sendToExtension(msg);
      // After mutating messages, re-fetch data
      if (
        res.ok &&
        (msg.type === "ADD_SITE" ||
          msg.type === "REMOVE_SITE" ||
          msg.type === "GRANT_EMERGENCY" ||
          msg.type === "APPLY_PENALTY")
      ) {
        await refresh();
      }
      return res;
    },
    [refresh]
  );

  useEffect(() => {
    const rt = getChromeRuntime();
    if (!rt || !EXTENSION_ID) {
      setStatus("not-installed");
      return;
    }
    refresh();
  }, [refresh]);

  return { status, data, refresh, sendMessage };
}
