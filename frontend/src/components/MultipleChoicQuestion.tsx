"use client";
import React, { useState, useEffect } from "react";

interface MultiChoiceProps {
  question: string;
  options: string[];
  name: string;
  difficulty:
    | "Beginner"
    | "Base Knowledge"
    | "Intermediate"
    | "Advanced"
    | "Expert";
  onChange: (answer: string[]) => void;
  isCorrect?: "correct" | "incorrect";
  selectedAnswers?: string[];
  answer?: string;
  isSubmitted?: boolean;
  explanation?: string;
  showExplanations: boolean;
}

export default function MultipleChoiceQuestion({
  question,
  options,
  name,
  difficulty,
  onChange,
  isCorrect,
  selectedAnswers = [],
  answer,
  isSubmitted,
  explanation,
  showExplanations,
}: MultiChoiceProps) {
  const [selected, setSelected] = useState<string[]>(selectedAnswers);
  const [showAnswer, setShowAnswer] = useState(false);

  // Keep selected in sync when selectedAnswers is passed externally,
  // but only update if it actually differs to prevent overwriting local changes.
  useEffect(() => {
    const areArraysEqual =
      selectedAnswers.length === selected.length &&
      selectedAnswers.every((val) => selected.includes(val));

    if (!areArraysEqual) {
      setSelected(selectedAnswers);
    }
  }, [selectedAnswers, selected]);

  const handleCheckboxChange = (optionLabel: string) => {
    if (isCorrect !== undefined) return; // Don't allow changes after grading

    let updated: string[];

    if (selected.includes(optionLabel)) {
      updated = selected.filter((val) => val !== optionLabel); // uncheck
    } else {
      updated = [...selected, optionLabel]; // check
    }

    setSelected(updated);
    onChange(updated);
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
        {options.map((option, index) => {
          const optionLabel = String.fromCharCode(97 + index);
          const isSelected = selected.includes(optionLabel);

          return (
            <label
              key={index}
              className={`flex items-center space-x-2 px-2 py-1 rounded-md cursor-pointer ${
                isCorrect && isSelected
                  ? isCorrect === "correct"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                  : ""
              }`}
            >
              <input
                type="checkbox"
                name={`${name}-${index}`}
                value={optionLabel}
                checked={isSelected}
                onChange={() => handleCheckboxChange(optionLabel)}
                className="accent-indigo-600"
                disabled={isCorrect !== undefined}
              />
              <span className="flex items-center">
                {option}
                {isCorrect !== undefined && answer?.includes(optionLabel) && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="inline w-4 h-4 ml-1 align-middle text-indigo-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                )}
              </span>
            </label>
          );
        })}
      </div>
      {isSubmitted && showExplanations && (
        <div className="mt-3">
          <button
            onClick={() => setShowAnswer((prev) => !prev)}
            className="text-sm ml-3 text-indigo-700 underline hover:text-indigo-900"
          >
            {showAnswer ? "Hide Explanation" : "Show Explanation"}
          </button>

          {showAnswer && answer && (
            <div className="mt-2 p-3 rounded border border-indigo-500 text-sm text-indigo-800">
              <strong>Explanation:</strong> {explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
