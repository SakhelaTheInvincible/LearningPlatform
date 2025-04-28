"use client";
import React from "react";

interface FillInTheBlankProps {
  prompt: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export default function FillInTheBlankQuestion({
  prompt,
  difficulty,
}: FillInTheBlankProps) {
  return (
    <div className="border border-indigo-300 rounded-lg p-6 shadow-sm bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Fill in the missing word:</h3>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
          {difficulty}
        </span>
      </div>
      <p className="mb-4">{prompt}</p>
      <input
        type="text"
        className="w-full border border-indigo-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Type the missing word here..."
      />
    </div>
  );
}
