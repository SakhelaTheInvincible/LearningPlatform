"use client";
import React, { useState } from "react";

interface TrueFalseQuestionProps {
  question: string;
  name: string;
  difficulty:
    | "Beginner"
    | "Base Knowledge"
    | "Intermediate"
    | "Advanced"
    | "Expert";
  onChange: (answer: string[]) => void;
  isCorrect?: "correct" | "incorrect";
  selectedAnswer?: string;
  isSubmitted?: boolean;
  answer: string;
  explanation?: string;
}

export default function TrueFalseQuestion({
  question,
  name,
  difficulty,
  onChange,
  isCorrect,
  selectedAnswer,
  isSubmitted,
  answer,
  explanation,
}: TrueFalseQuestionProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleChange = (value: string) => {
    if (isCorrect !== undefined) return; // prevent changes after grading
    onChange([value]);
  };

  const getClass = (value: string) => {
    if (selectedAnswer === value && isCorrect === "correct") {
      return "bg-green-100 text-green-800";
    }
    if (selectedAnswer === value && isCorrect === "incorrect") {
      return "bg-red-100 text-red-800";
    }
    return "";
  };

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
      <div className="space-y-2">
        {["true", "false"].map((value) => (
          <label
            key={value}
            className={`flex items-center space-x-2 px-2 py-1 rounded-md cursor-pointer ${getClass(
              value
            )}`}
          >
            <input
              type="radio"
              name={name}
              value={value}
              className="accent-indigo-600"
              onChange={() => handleChange(value)}
              checked={selectedAnswer === value}
              disabled={isCorrect !== undefined}
            />
            <span className="capitalize">{value}</span>
          </label>
        ))}
      </div>
      {isSubmitted && (
        <div className="mt-3 space-y-2">
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

          {explanation && (
            <>
              <button
                onClick={() => setShowExplanation((prev) => !prev)}
                className="text-sm ml-3 text-indigo-700 underline hover:text-indigo-900"
              >
                {showExplanation ? "Hide Explanation" : "Show Explanation"}
              </button>

              {showExplanation && (
                <div className="mt-2 p-3 rounded border border-indigo-500 text-sm text-indigo-800">
                  <strong>Explanation:</strong> {explanation}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
