"use client";
import React from "react";

interface MultipleChoiceProps {
  question: string;
  options: string[];
  name: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export default function MultipleChoiceQuestion({
  question,
  options,
  name,
  difficulty,
}: MultipleChoiceProps) {
  return (
    <div className="border border-indigo-300 rounded-lg p-6 shadow-sm bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{question}</h3>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
          {difficulty}
        </span>
      </div>
      <div className="space-y-2">
        {options.map((option, index) => (
          <label key={index} className="flex items-center space-x-2">
            <input type="radio" name={name} className="accent-indigo-600" />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
