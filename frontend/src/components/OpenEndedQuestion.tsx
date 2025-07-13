"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isFocused, setIsFocused] = useState(false);
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "from-green-400 to-emerald-500";
      case "Base Knowledge":
        return "from-blue-400 to-cyan-500";
      case "Intermediate":
        return "from-yellow-400 to-orange-500";
      case "Advanced":
        return "from-red-400 to-pink-500";
      case "Expert":
        return "from-purple-400 to-indigo-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const getStatusColor = () => {
    if (isCorrect === "correct") return "border-green-300 bg-green-50";
    if (isCorrect === "incorrect") return "border-red-300 bg-red-50";
    if (isFocused) return "border-indigo-300 bg-indigo-50";
    return "border-gray-200 bg-white/50";
  };

  return (
    <div className="p-6">
      {/* Question Header */}
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-semibold text-gray-900 leading-relaxed flex-1 mr-4">
          {question}
        </h3>
        <div className={`bg-gradient-to-r ${getDifficultyColor(difficulty)} text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg`}>
          {difficulty}
        </div>
      </div>

      {/* Open-ended Notice */}
      <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
        <p className="text-sm text-emerald-800 font-medium">
          ✏️ Write your answer in detail
        </p>
      </div>

      {/* Answer Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="relative">
          <textarea
            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${getStatusColor()}`}
            rows={6}
            placeholder="Type your answer here... Be detailed and specific."
            value={value?.[0] || ""}
            onChange={(e) => onChange([e.target.value])}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            readOnly={isSubmitted}
          />
          
          {/* Character count */}
          <div className="absolute bottom-3 right-3 text-xs text-gray-500">
            {value?.[0]?.length || 0} characters
          </div>
          
          {/* Status indicator */}
          {isSubmitted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute top-3 right-3"
            >
              {isCorrect === "correct" ? (
                <div className="p-1 bg-green-100 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 text-green-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                </div>
              ) : isCorrect === "incorrect" ? (
                <div className="p-1 bg-red-100 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 text-red-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              ) : (
                <div className="p-1 bg-yellow-100 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 text-yellow-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Explanation Section */}
      {isSubmitted && showExplanations && (explanation || answer) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 pt-4 border-t border-gray-200"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAnswer((prev) => !prev)}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
              animate={{ rotate: showAnswer ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </motion.svg>
            {showAnswer ? "Hide Answer & Explanation" : "Show Answer & Explanation"}
          </motion.button>

          <AnimatePresence>
            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0, originY: 0 }}
                animate={{ opacity: 1, scaleY: 1, originY: 0 }}
                exit={{ opacity: 0, scaleY: 0, originY: 0 }}
                transition={{ 
                  duration: 0.3, 
                  ease: "easeInOut",
                  opacity: { duration: 0.2 }
                }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-4">
                  {/* Sample Answer */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4 text-green-600"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-green-800 mb-1">Sample Answer:</p>
                        <p className="text-green-700">{answer}</p>
                      </div>
                    </div>
                  </div>

                  {/* Explanation */}
                  {explanation && (
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-100 rounded-full">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 text-indigo-600"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189 6.01 6.01 0 005.25-5.25 6.01 6.01 0 00-.189-1.5M12 12.75V7.5m0 0a3.75 3.75 0 00-3.75 3.75m0 0a3.75 3.75 0 003.75 3.75m0 0a3.75 3.75 0 003.75-3.75m0 0a3.75 3.75 0 00-3.75-3.75m0 0V3.75A3.75 3.75 0 003.75 0a3.75 3.75 0 00-3.75 3.75m0 0a3.75 3.75 0 003.75 3.75m0 0a3.75 3.75 0 003.75-3.75m0 0a3.75 3.75 0 00-3.75-3.75"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-indigo-800 mb-1">Explanation:</p>
                          <p className="text-indigo-700">{explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
