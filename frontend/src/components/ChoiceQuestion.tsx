"use client";
import React from "react";

interface ChoiceQuestionProps {
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
}

export default function ChoiceQuestion({
  question,
  options,
  name,
  difficulty,
  onChange,
  isCorrect,
  selectedAnswers = [],
}: ChoiceQuestionProps) {
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
          const label = String.fromCharCode(97 + index); // a, b, c, ...
          const isSelected = selectedAnswers.includes(label);

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
                type="radio"
                name={name}
                value={option}
                checked={isSelected}
                onChange={() => onChange([label])}
                className="accent-indigo-600"
                disabled={isCorrect !== undefined} // disable after grading
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
