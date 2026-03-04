import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import browser from "webextension-polyfill";
import { getStorage, daysRemaining, normalizeDomain } from "@block66/shared";
import type { StorageData } from "@block66/shared";
import { FocusScreen } from "./components/FocusScreen";
import { TriviaGate } from "./components/TriviaGate";
import { WrongAnswerScreen } from "./components/WrongAnswerScreen";
import "./styles.css";

type View = "focus" | "trivia" | "wrong-answer" | "penalty";

interface WrongAnswerState {
  question: string;
  correctAnswer: string;
  streakDays: number;
}

function BlockedApp() {
  const params = new URLSearchParams(window.location.search);
  const rawDomain = params.get("domain") ?? "";
  const domain = normalizeDomain(rawDomain);

  const [storage, setStorage] = useState<StorageData | null>(null);
  const [view, setView] = useState<View>("focus");
  const [wrongAnswer, setWrongAnswer] = useState<WrongAnswerState | null>(null);
  const [penaltyRemaining, setPenaltyRemaining] = useState(0);

  useEffect(() => {
    getStorage().then(setStorage);

    const listener = (changes: browser.Storage.StorageAreaOnChangedChangesType) => {
      if ("penalties" in changes || "emergencyAccess" in changes) {
        getStorage().then((s) => {
          setStorage(s);
          // If penalty expired, go back to focus screen
          const penalty = s.penalties[domain];
          if (!penalty || penalty.expiresAt <= Date.now()) {
            if (view === "penalty") setView("focus");
          }
        });
      }
    };
    browser.storage.onChanged.addListener(listener);
    return () => browser.storage.onChanged.removeListener(listener);
  }, [domain, view]);

  // Penalty countdown tick
  useEffect(() => {
    if (view !== "penalty" || !storage) return;
    const penalty = storage.penalties[domain];
    if (!penalty) {
      setView("focus");
      return;
    }
    const tick = () => {
      const remaining = penalty.expiresAt - Date.now();
      if (remaining <= 0) {
        setView("focus");
      } else {
        setPenaltyRemaining(remaining);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [view, storage, domain]);

  if (!storage) return <div className="loading">Loading...</div>;

  const site = storage.blockedSites[domain];
  if (!site) {
    // Domain is not in blocklist (e.g. stale redirect) — just go back
    return (
      <div className="not-blocked">
        <p>This site is no longer blocked.</p>
        <button onClick={() => window.history.back()}>Go back</button>
      </div>
    );
  }

  const days = daysRemaining(site.startTimestamp);
  const streakDays = Math.floor(
    (Date.now() - site.startTimestamp) / (24 * 60 * 60 * 1000)
  );

  if (view === "focus") {
    return (
      <FocusScreen
        domain={domain}
        daysRemaining={days}
        onEmergencyAccess={() => setView("trivia")}
      />
    );
  }

  if (view === "trivia") {
    return (
      <TriviaGate
        domain={domain}
        onSuccess={async () => {
          // Grant emergency access — handled in TriviaGate via background bridge
          window.history.back();
        }}
        onWrongAnswer={(question, correctAnswer) => {
          setWrongAnswer({ question, correctAnswer, streakDays });
          setView("wrong-answer");
        }}
        onBack={() => setView("focus")}
      />
    );
  }

  if (view === "wrong-answer" && wrongAnswer) {
    return (
      <WrongAnswerScreen
        domain={domain}
        question={wrongAnswer.question}
        correctAnswer={wrongAnswer.correctAnswer}
        streakDays={wrongAnswer.streakDays}
        onRetryNow={() => setView("trivia")}
        onWait={() => setView("penalty")}
      />
    );
  }

  if (view === "penalty") {
    return (
      <div className="penalty-screen">
        <div className="penalty-card">
          <div className="penalty-icon">⏳</div>
          <h2>Cooling Down</h2>
          <p>Take a breath. You'll be able to try again in:</p>
          <div className="penalty-timer">
            {Math.floor(penaltyRemaining / 60000)}m{" "}
            {Math.floor((penaltyRemaining % 60000) / 1000)}s
          </div>
          <p className="penalty-note">
            Your {streakDays}-day streak is still intact. Stay strong.
          </p>
          <button className="back-btn" onClick={() => setView("focus")}>
            Back to Focus Screen
          </button>
        </div>
      </div>
    );
  }

  return null;
}

const root = document.getElementById("root")!;
createRoot(root).render(
  <StrictMode>
    <BlockedApp />
  </StrictMode>
);
