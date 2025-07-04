"use client";
import React, { useState } from "react";

interface OpenEndedProps {
  question: string;
  difficulty:
    | "Beginner"
    | "Base Knowledge"
    | "Intermediate"
    | "Advanced"
    | "Expert";
  onChange: (answer: string[]) => void;
  isCorrect?: "correct" | "incorrect";
  value: string[];
  isSubmitted?: boolean;
  answer: string;
  explanation?: string;
  showExplanations: boolean;
}

export default function OpenEndedQuestion({
  question,
  difficulty,
  onChange,
  isCorrect,
  value,
  isSubmitted,
  answer,
  explanation,
  showExplanations,
}: OpenEndedProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <div
      className={`border rounded-lg p-6 shadow-sm ${
        isCorrect === "correct"
          ? "border-green-500 bg-green-50"
          : isCorrect === "incorrect"
          ? "border-red-500 bg-red-50"
          : "border-indigo-300 bg-gray-50"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{question}</h3>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
          {difficulty}
        </span>
      </div>
      <textarea
        className="w-full mt-2 border border-indigo-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500"
        rows={4}
        placeholder="Write your answer here..."
        value={value?.[0] || ""}
        onChange={(e) => onChange([e.target.value])}
        readOnly={isSubmitted}
      ></textarea>
      {isSubmitted && explanation && (
        <div className="mt-3 p-3 rounded text-blue-800">
          <strong>Explanation:</strong> {explanation}
        </div>
      )}
      {isSubmitted && showExplanations && (
        <div className="mt-3">
          <button
            onClick={() => setShowAnswer((prev) => !prev)}
            className="text-sm ml-3 text-indigo-700 underline hover:text-indigo-900"
          >
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </button>

          {showAnswer && answer && (
            <div className="mt-2 p-3 rounded border border-indigo-500 text-sm text-indigo-800">
              <strong>Correct Answer:</strong> {answer}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
