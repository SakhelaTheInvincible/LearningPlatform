"use client";
import React from "react";

interface OpenEndedProps {
  question: string;
  difficulty:
    | "Beginner"
    | "Base Knowledge"
    | "Intermediate"
    | "Advanced"
    | "Expert";
  onChange: (answer: string[]) => void;
}

export default function OpenEndedQuestion({
  question,
  difficulty,
  onChange,
}: OpenEndedProps) {
  return (
    <div className="border border-indigo-300 rounded-lg p-6 shadow-sm bg-gray-50">
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
      ></textarea>
    </div>
  );
}
