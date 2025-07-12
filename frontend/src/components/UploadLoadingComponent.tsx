"use client";

import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import { FaSpinner, FaRocket, FaCog, FaCheck } from "react-icons/fa";

export default function LoadingComponent({
  show = true,
  message = "Loading...",
}: {
  show?: boolean;
  message?: string;
}) {
  const getIcon = () => {
    if (message.includes("Generating")) {
      return <FaRocket className="text-blue-500" />;
    }
    if (message.includes("Creating")) {
      return <FaCog className="text-purple-500" />;
    }
    if (message.includes("Uploading")) {
      return <FaSpinner className="text-indigo-500" />;
    }
    return <FaSpinner className="text-indigo-500" />;
  };

  return (
    <Transition show={show} as={Fragment}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <Transition.Child
          as={Fragment}
          enter="transition-all duration-500"
          enterFrom="opacity-0 scale-90"
          enterTo="opacity-100 scale-100"
          leave="transition-all duration-300"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-90"
        >
          <div className="flex flex-col items-center justify-center bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 min-w-[300px] relative">
            {/* Animated Icon */}
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
              }}
              className="text-4xl mb-6"
            >
              {getIcon()}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold text-gray-900 mb-3"
            >
              Processing...
            </motion.h2>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 text-center mb-6"
            >
              {message}
            </motion.p>

            {/* Progress Dots */}
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                  className="w-2 h-2 bg-indigo-500 rounded-full"
                />
              ))}
            </div>

            {/* Floating particles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 0.6, 0],
                  scale: [0, 1, 0],
                  x: [0, Math.random() * 100 - 50],
                  y: [0, Math.random() * 100 - 50]
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.5,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                className="absolute pointer-events-none"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              >
                <div className="w-1 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full" />
              </motion.div>
            ))}
          </div>
        </Transition.Child>
      </div>
    </Transition>
  );
}
