"use client";
import { motion } from "framer-motion";
import { FaStar, FaGem, FaTrophy, FaRocket } from "react-icons/fa";
import { useEffect, useState } from "react";

interface UserLevelDisplayProps {
  totalExperience: number; // Total accumulated XP
  maxExperience?: number; // XP needed for each level (default 500)
  className?: string;
  compact?: boolean;
}

export default function UserLevelDisplay({
  totalExperience,
  maxExperience = 500,
  className = "",
  compact = false
}: UserLevelDisplayProps) {
  const [animatedExp, setAnimatedExp] = useState(0);
  
  // Ensure totalExperience is a valid number, default to 0
  const validTotalExp = isNaN(totalExperience) || totalExperience == null ? 0 : Math.max(0, totalExperience);
  
  // Calculate current level (starts from 1)
  const currentLevel = Math.floor(validTotalExp / maxExperience) + 1;
  
  // Calculate XP within current level (0-499 for each level)
  const currentLevelExp = validTotalExp % maxExperience;
  
  // Progress percentage within current level
  const progressPercentage = (currentLevelExp / maxExperience) * 100;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedExp(currentLevelExp);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentLevelExp]);

  const getLevelIcon = (level: number) => {
    if (level >= 50) return <FaRocket className="text-red-400" />;
    if (level >= 25) return <FaTrophy className="text-yellow-400" />;
    if (level >= 10) return <FaGem className="text-purple-400" />;
    return <FaStar className="text-blue-400" />;
  };

  const getLevelColor = (level: number) => {
    if (level >= 50) return "from-red-500 to-pink-500";
    if (level >= 25) return "from-yellow-500 to-orange-500";
    if (level >= 10) return "from-purple-500 to-pink-500";
    return "from-blue-500 to-indigo-500";
  };

  const getLevelTitle = (level: number) => {
    if (level >= 50) return "Legendary";
    if (level >= 25) return "Master";
    if (level >= 10) return "Expert";
    if (level >= 5) return "Advanced";
    return "Novice";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "from-emerald-500 to-teal-500";
    if (percentage >= 60) return "from-blue-500 to-cyan-500";
    if (percentage >= 40) return "from-yellow-500 to-orange-500";
    return "from-indigo-500 to-purple-500";
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`w-8 h-8 bg-gradient-to-r ${getLevelColor(currentLevel)} rounded-full flex items-center justify-center shadow-lg`}
          >
            {getLevelIcon(currentLevel)}
          </motion.div>
          <div className="text-sm">
            <div className="font-bold text-gray-800">
              Lvl {currentLevel}
            </div>
            <div className="text-xs text-gray-600">
              {Math.round(animatedExp)}/{maxExperience} XP
            </div>
          </div>
        </div>
        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${getProgressColor(progressPercentage)} rounded-full shadow-inner`}
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 12 }}
            className={`w-14 h-14 rounded-full bg-gradient-to-r ${getLevelColor(currentLevel)} flex items-center justify-center shadow-lg`}
          >
            <div className="text-white text-2xl">
              {getLevelIcon(currentLevel)}
            </div>
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-800">
                Level {currentLevel}
              </span>
              <span className="text-sm font-medium text-gray-600 bg-gradient-to-r from-gray-100 to-gray-200 px-2 py-1 rounded-full">
                {getLevelTitle(currentLevel)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {maxExperience - currentLevelExp} XP to next level
            </p>
          </div>
        </div>
      </div>

      {/* XP Progress Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">
            Experience Points
          </span>
          <motion.span 
            key={animatedExp}
            initial={{ scale: 1.2, color: "#10B981" }}
            animate={{ scale: 1, color: "#374151" }}
            transition={{ duration: 0.5 }}
            className="text-lg font-bold text-gray-800"
          >
            {Math.round(animatedExp)} / {maxExperience}
          </motion.span>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${getProgressColor(progressPercentage)} rounded-full shadow-sm relative`}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-pulse" />
            </motion.div>
          </div>
          
          {/* Progress percentage indicator */}
          <div className="absolute -top-8 right-0 text-xs font-medium text-gray-600 bg-white/80 px-2 py-1 rounded-full shadow-sm">
            {Math.round(progressPercentage)}%
          </div>
        </div>

        {/* Level Progress Dots */}
        <div className="flex justify-center space-x-2 mt-4">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 + 0.5, duration: 0.3 }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i < Math.floor(progressPercentage / 20)
                  ? `bg-gradient-to-r ${getProgressColor(progressPercentage)} shadow-md`
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Next Level Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-indigo-700">
            Next: Level {currentLevel + 1}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-indigo-600">
              {getLevelTitle(currentLevel + 1)}
            </span>
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-indigo-500"
            >
              →
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 