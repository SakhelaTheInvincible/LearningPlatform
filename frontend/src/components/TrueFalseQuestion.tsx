"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  answer?: string;
  isSubmitted?: boolean;
  explanation?: string;
  showExplanations: boolean;
}

export default function TrueFalseQuestion({
  question,
  name,
  difficulty,
  onChange,
  isCorrect,
  selectedAnswer,
  answer,
  isSubmitted,
  explanation,
  showExplanations,
}: TrueFalseQuestionProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  
  const handleChange = (value: string) => {
    if (isCorrect !== undefined) return; // prevent changes after grading
    onChange([value]);
  };

  const getClass = (value: string) => {
    if (selectedAnswer === value && isCorrect === "correct") {
      return "border-green-300 bg-green-50 text-green-800";
    }
    if (selectedAnswer === value && isCorrect === "incorrect") {
      return "border-red-300 bg-red-50 text-red-800";
    }
    if (selectedAnswer === value) {
      return "border-indigo-300 bg-indigo-50 text-indigo-800";
    }
    return "border-gray-200 bg-white/50 hover:bg-white/80 hover:border-indigo-200";
  };

  const isCorrectAnswer = (value: string) => {
    return answer?.includes(value);
  };

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

      {/* True/False Notice */}
      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-sm text-purple-800 font-medium">
          ⚡ Select True or False
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {["true", "false"].map((value) => (
          <motion.label
            key={value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center p-4 rounded-xl cursor-pointer transition-all border-2 ${getClass(value)}`}
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="relative">
                <input
                  type="radio"
                  name={name}
                  value={value}
                  className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 focus:ring-2"
                  onChange={() => handleChange(value)}
                  checked={selectedAnswer === value}
                  disabled={isCorrect !== undefined}
                />
                {selectedAnswer === value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center"
                  >
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </motion.div>
                )}
              </div>
              <span className="text-gray-800 font-medium capitalize flex items-center gap-2">
                {value === "true" ? (
                  <>
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
                    True
                  </>
                ) : (
                  <>
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
                    False
                  </>
                )}
              </span>
            </div>
            
            {isCorrect !== undefined && isCorrectAnswer(value) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="ml-3 p-1 bg-green-100 rounded-full"
              >
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
              </motion.div>
            )}
          </motion.label>
        ))}
      </div>

      {/* Explanation Section */}
      {isSubmitted && showExplanations && explanation && (
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
            {showAnswer ? "Hide Explanation" : "Show Explanation"}
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
                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
