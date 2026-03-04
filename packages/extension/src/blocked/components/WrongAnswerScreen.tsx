import browser from "webextension-polyfill";
import { setPenalty, schedulePenaltyAlarm, PENALTY_DURATION_MS } from "@block66/shared";

interface Props {
  domain: string;
  question: string;
  correctAnswer: string;
  streakDays: number;
  onRetryNow: () => void;
  onWait: () => void;
}

export function WrongAnswerScreen({
  domain,
  question,
  correctAnswer,
  streakDays,
  onRetryNow,
  onWait,
}: Props) {
  const handleWait = async () => {
    const expiresAt = Date.now() + PENALTY_DURATION_MS;
    await setPenalty(domain, expiresAt);
    await schedulePenaltyAlarm(domain);
    onWait();
  };

  return (
    <div className="wrong-answer">
      <div className="icon">❌</div>
      <h2>Incorrect Answer</h2>
      <p className="subtitle">That wasn't right. Do you really need access?</p>

      <div className="question-recap">
        <div className="label">Question</div>
        <p style={{ marginBottom: "0.75rem" }}>{question}</p>
        <div className="label">Correct Answer</div>
        <p className="correct">{correctAnswer}</p>
      </div>

      <div className="streak-banner">
        You've made it <strong>{streakDays} days</strong> into your 66-day block.
        <br />
        Your streak is still intact — keep it that way.
      </div>

      <div className="choices">
        <button className="choice-btn retry" onClick={onRetryNow}>
          Try again now
          <br />
          <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>New question set</span>
        </button>
        <button className="choice-btn wait" onClick={handleWait}>
          Wait 5 minutes
          <br />
          <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>Cooldown period</span>
        </button>
      </div>
    </div>
  );
}
