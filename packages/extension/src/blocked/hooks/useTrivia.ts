import { useState, useCallback } from "react";
import {
  type DisplayQuestion,
  type OpenTDBResponse,
  TRIVIA_QUESTION_COUNT,
  decodeHtml,
  shuffle,
} from "@block66/shared";

type TriviaState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; questions: DisplayQuestion[] }
  | { status: "error"; message: string; rateLimited: boolean };

export function useTrivia() {
  const [state, setState] = useState<TriviaState>({ status: "idle" });

  const fetchQuestions = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch(
        `https://opentdb.com/api.php?amount=${TRIVIA_QUESTION_COUNT}&difficulty=medium&type=multiple`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: OpenTDBResponse = await res.json();

      if (data.response_code === 5) {
        setState({
          status: "error",
          message: "Too many requests. Please wait a moment and try again.",
          rateLimited: true,
        });
        return;
      }

      if (data.response_code !== 0 || data.results.length === 0) {
        throw new Error(`OpenTDB error code ${data.response_code}`);
      }

      const questions: DisplayQuestion[] = data.results.map((q) => ({
        question: decodeHtml(q.question),
        correctAnswer: decodeHtml(q.correct_answer),
        answers: shuffle([
          decodeHtml(q.correct_answer),
          ...q.incorrect_answers.map(decodeHtml),
        ]),
      }));

      setState({ status: "ready", questions });
    } catch (err) {
      setState({
        status: "error",
        message:
          "Could not load trivia questions. Check your connection and try again.",
        rateLimited: false,
      });
    }
  }, []);

  return { state, fetchQuestions };
}
