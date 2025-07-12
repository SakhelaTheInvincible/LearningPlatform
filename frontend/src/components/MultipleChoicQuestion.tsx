"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="backdrop-blur-sm bg-white/70 border border-white/20 rounded-2xl p-6 shadow-lg">
      {/* Question Header */}
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-semibold text-gray-900 leading-relaxed flex-1 mr-4">
          {question}
        </h3>
        <div className={`bg-gradient-to-r ${getDifficultyColor(difficulty)} text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg`}>
          {difficulty}
        </div>
      </div>

      {/* Multiple Choice Notice */}
      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 backdrop-blur-sm border border-blue-200/50 rounded-lg">
        <p className="text-sm text-blue-800 font-medium">
          ✓ Select all that apply (multiple answers possible)
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => {
          const optionLabel = String.fromCharCode(97 + index);
          const isSelected = selected.includes(optionLabel);

          return (
            <motion.label
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center p-4 rounded-xl cursor-pointer transition-all border-2 backdrop-blur-sm ${
                isCorrect === "correct" && isSelected
                  ? "border-green-300 bg-green-50/80 text-green-800"
                  : isCorrect === "incorrect" && isSelected
                  ? "border-red-300 bg-red-50/80 text-red-800"
                  : isSelected
                  ? "border-indigo-300 bg-indigo-50/80 text-indigo-800"
                  : "border-gray-200/50 bg-white/60 hover:bg-white/80 hover:border-indigo-200"
              }`}
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="relative">
                  <input
                    type="checkbox"
                    name={`${name}-${index}`}
                    value={optionLabel}
                    checked={isSelected}
                    onChange={() => handleCheckboxChange(optionLabel)}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                    disabled={isCorrect !== undefined}
                  />
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 w-5 h-5 bg-indigo-600 rounded flex items-center justify-center pointer-events-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-3 h-3 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    </motion.div>
                  )}
                </div>
                <span className="text-gray-800 font-medium">{option}</span>
              </div>
              
              {isCorrect !== undefined && answer?.includes(optionLabel) && (
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
          );
        })}
      </div>

      {/* Explanation Section */}
      {isSubmitted && showExplanations && explanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 pt-4 border-t border-gray-200/50"
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
                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl border border-indigo-200/50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-100/80 rounded-full">
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
