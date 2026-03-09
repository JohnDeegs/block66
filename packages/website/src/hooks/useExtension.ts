import { useState, useEffect, useCallback } from "react";
import type { StorageData, ExtensionMessage, ExtensionResponse } from "@block66/shared";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";
const EXTENSION_ID = (import.meta.env.VITE_EXTENSION_ID as string | undefined) ?? "agjjmbpbgeciohkbklpmajhmghdjhggh";
const TOKEN_KEY = "block66_token";

export type ExtensionStatus =
  | "detecting"
  | "not-authenticated"
  | "connected"
  | "error";

export interface UseExtensionReturn {
  status: ExtensionStatus;
  data: StorageData | null;
  refresh: () => Promise<void>;
  sendMessage: (msg: ExtensionMessage) => Promise<ExtensionResponse>;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  // Forward the token to the extension if it's installed
  if (typeof chrome !== "undefined" && chrome.runtime && EXTENSION_ID) {
    const send = () =>
      chrome.runtime
        .sendMessage(EXTENSION_ID, { type: "SET_TOKEN", token })
        .catch(() => {
          // Service worker may have been inactive — retry once after a short delay
          setTimeout(() => {
            chrome.runtime
              .sendMessage(EXTENSION_ID, { type: "SET_TOKEN", token })
              .catch(() => {});
          }, 1000);
        });
    send();
  }
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
}

async function sendToApi(msg: ExtensionMessage): Promise<ExtensionResponse> {
  try {
    switch (msg.type) {
      case "GET_DATA": {
        const res = await apiFetch("/sites");
        if (res.status === 401) return { ok: false, error: "not-authenticated" };
        if (!res.ok) return { ok: false, error: await res.text() };
        return { ok: true, data: await res.json() };
      }
      case "ADD_SITE": {
        const res = await apiFetch("/sites", {
          method: "POST",
          body: JSON.stringify({ domain: msg.domain }),
        });
        if (!res.ok) return { ok: false, error: await res.text() };
        return { ok: true };
      }
      case "REMOVE_SITE": {
        const res = await apiFetch(`/sites/${encodeURIComponent(msg.domain)}`, { method: "DELETE" });
        if (!res.ok) return { ok: false, error: await res.text() };
        return { ok: true };
      }
      case "GRANT_EMERGENCY": {
        const res = await apiFetch(`/sites/${encodeURIComponent(msg.domain)}/emergency`, { method: "POST" });
        if (!res.ok) return { ok: false, error: await res.text() };
        return { ok: true };
      }
      case "APPLY_PENALTY": {
        const res = await apiFetch(`/sites/${encodeURIComponent(msg.domain)}/penalty`, { method: "POST" });
        if (!res.ok) return { ok: false, error: await res.text() };
        return { ok: true };
      }
      default:
        return { ok: true };
    }
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export function useExtension(): UseExtensionReturn {
  const [status, setStatus] = useState<ExtensionStatus>("detecting");
  const [data, setData] = useState<StorageData | null>(null);

  const refresh = useCallback(async () => {
    const res = await sendToApi({ type: "GET_DATA" });
    if (res.ok && "data" in res) {
      setData(res.data);
      setStatus("connected");
    } else if (!res.ok && res.error === "not-authenticated") {
      setStatus("not-authenticated");
    } else {
      setStatus("error");
    }
  }, []);

  const sendMessage = useCallback(
    async (msg: ExtensionMessage): Promise<ExtensionResponse> => {
      const res = await sendToApi(msg);
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
    if (!getToken()) {
      setStatus("not-authenticated");
      return;
    }
    refresh();
  }, [refresh]);

  return { status, data, refresh, sendMessage };
}
