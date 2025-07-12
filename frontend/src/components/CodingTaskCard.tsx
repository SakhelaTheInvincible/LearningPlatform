"use client";

import Link from "next/link";
import { JSX } from "react";

interface CodingTaskCardProps {
  taskNumber: number;
  description: string;
  difficulty: string;
  userScore: number; // new prop
  taskId: number;
}

export default function CodingTaskCard({
  taskNumber,
  description,
  difficulty,
  userScore,
  taskId,
}: CodingTaskCardProps) {
  // Determine passing score based on difficulty
  const getPassingScore = (difficulty: string) => {
    const difficultyLower = difficulty.toLowerCase();
    if (difficultyLower.includes('easy')) return 90;
    if (difficultyLower.includes('medium')) return 75;
    if (difficultyLower.includes('hard')) return 70;
    return 70; // Default for unknown difficulty
  };

  const passingScore = getPassingScore(difficulty);
  const isCompleted = userScore >= passingScore;

  function parseProblemStatement(raw: string): JSX.Element {
    // Step 1: Clean header and asterisks
    let text = raw.trim();
    text = text.replace(/^Problem Statement\s*[:\*]*/i, ""); // Remove "Problem Statement:"
    text = text.replace(/\*+/g, ""); // Remove all asterisks

    // Step 2: Clean and split into non-empty lines
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Step 3: Highlight code-like tokens in each line
    const formatLine = (line: string, index: number) => {
      const parts: React.ReactNode[] = [];
      const regex = /(`[^`]+`|'[^']+')/g;
      let lastIndex = 0;

      for (const match of line.matchAll(regex)) {
        const [token] = match;
        const matchStart = match.index ?? 0;

        // Add normal text before the match
        if (matchStart > lastIndex) {
          parts.push(line.slice(lastIndex, matchStart));
        }

        // Add highlighted token (removing surrounding quotes)
        parts.push(
          <code
            key={`${index}-${matchStart}`}
            className="font-mono text-indigo-700 bg-indigo-100 px-1 rounded"
          >
            {token.slice(1, -1)}
          </code>
        );

        lastIndex = matchStart + token.length;
      }

      // Add remaining text
      if (lastIndex < line.length) {
        parts.push(line.slice(lastIndex));
      }

      return (
        <p key={index} className="mb-2 text-black text-sm">
          {parts}
        </p>
      );
    };

    return <div className="space-y-1 text-black">{lines.map(formatLine)}</div>;
  }

  return (
    <Link href={`coding/task/${taskId}`}>
      <div className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer mb-4 ${
        isCompleted 
          ? 'bg-green-50 border-green-300' 
          : 'bg-white border-gray-300'
      }`}>
        <div className="flex flex-row justify-between items-center">
          <h3 className={`text-lg font-semibold ${isCompleted ? 'text-green-600' : 'text-indigo-600'}`}>
            Task {taskNumber}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full ${
            isCompleted 
              ? 'bg-green-100 text-green-700' 
              : 'bg-indigo-100 text-indigo-700'
          }`}>
            {difficulty}
          </span>
        </div>
        <div className="text-gray-700 mt-2 line-clamp-2">
          {parseProblemStatement(description)}
        </div>
        <p className={`text-sm mt-3 ${
          isCompleted 
            ? 'text-green-600 font-medium' 
            : 'text-gray-600'
        }`}>
          Score: {userScore} / 100 {isCompleted && '✓ Passed'}
        </p>
      </div>
    </Link>
    // <div className="border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer bg-white mb-4">
    //   <div className="flex flex-row justify-between items-center">
    //     <h3 className="text-lg font-semibold text-indigo-600">
    //       Task {taskNumber}
    //     </h3>
    //     <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
    //       {difficulty}
    //     </span>
    //   </div>
    //   <p className="text-gray-700 mt-2">{description}</p>
    //   <p className="text-sm text-gray-600 mt-3">Score: {userScore} / 100</p>
    // </div>
  );
}
