import { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { useTrivia } from "../hooks/useTrivia";
import {
  incrementEmergencyCount,
  setEmergencyAccess,
  removeBlockRule,
  scheduleEmergencyAlarm,
  EMERGENCY_DURATION_MS,
} from "@block66/shared";

interface Props {
  domain: string;
  onSuccess: () => void;
  onWrongAnswer: (question: string, correctAnswer: string) => void;
  onBack: () => void;
}

export function TriviaGate({ domain, onSuccess, onWrongAnswer, onBack }: Props) {
  const { state, fetchQuestions } = useTrivia();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  if (state.status === "loading" || state.status === "idle") {
    return (
      <div className="trivia-gate">
        <div className="loading">Loading questions...</div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="trivia-gate">
        <div className="error">
          <p>{state.message}</p>
          <button
            className="retry-btn"
            onClick={fetchQuestions}
            disabled={state.rateLimited}
          >
            {state.rateLimited ? "Wait a moment..." : "Try again"}
          </button>
          <br />
          <button className="back-link" onClick={onBack} style={{ marginTop: "1rem" }}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const questions = state.questions;
  const current = questions[currentIndex];

  const handleAnswer = async (answer: string) => {
    if (answer === current.correctAnswer) {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        // All 5 correct — grant emergency access
        const expiresAt = Date.now() + EMERGENCY_DURATION_MS;
        await incrementEmergencyCount(domain);
        await setEmergencyAccess(domain, expiresAt);
        await removeBlockRule(domain);
        await scheduleEmergencyAlarm(domain);
        onSuccess();
      }
    } else {
      onWrongAnswer(current.question, current.correctAnswer);
    }
  };

  return (
    <div className="trivia-gate">
      <h2>Emergency Access Challenge</h2>
      <p className="progress">
        Question {currentIndex + 1} of {questions.length} — answer all correctly
        to unlock <strong>{domain}</strong> for 1 hour
      </p>

      <div className="question-card">
        <p className="question-text">{current.question}</p>
        <div className="answers">
          {current.answers.map((answer) => (
            <button
              key={answer}
              className="answer-btn"
              onClick={() => handleAnswer(answer)}
            >
              {answer}
            </button>
          ))}
        </div>
      </div>

      <button className="back-link" onClick={onBack}>
        ← Cancel and go back
      </button>
    </div>
  );
}
