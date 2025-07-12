"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaCode, FaLaptopCode, FaCheck } from "react-icons/fa";
import CodeEditor from "@/src/components/CodeEditor";

import WeekMenu, { WeekMenuHandle } from "@/src/components/weekMenu";
import Breadcrumbs from "@/src/components/Breadcrumbs";
import LeetCodeEditor from "@/src/components/LeetCodeEditor";
import EditorLayout from "@/src/components/EditorLayout";
import api from "@/src/lib/axios";
import { useParams } from "next/navigation";
import CodingTaskCard from "@/src/components/CodingTaskCard";

interface Code {
  difficulty_display: string;
  id: number;
  problem_statement: string;
  solution: string;
  template_code: string;
  user_code: string;
  user_score: number;
}

interface Part {
  name: string;
  type: "reading" | "questions" | "coding" | "complete";
  slug: string;
  description: string;
  completed: boolean;
}

export default function Week1Coding() {
  const [completedCoding, setCompletedCoding] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [codeTasks, setCodeTasks] = useState<Code[]>([]);
  const menuRef = useRef<WeekMenuHandle>(null);

  const params = useParams();
  const slug = params?.slug as string;
  const weekNumber = parseInt(params?.weekNumber as string);

  const initialCode = `// Write your code here
console.log('Hello, World!');`;

  const handleRunCode = () => {
    try {
      // Use eval to run JavaScript code (be cautious with eval)
      // eval can return a value, so handle that and set it to output
      const result: unknown = eval(initialCode); // eval returns unknown, so we cast it
      if (result !== undefined) {
        setOutput(String(result)); // If there is a result, convert it to string
      } else {
        setOutput("Code executed successfully but no return value.");
      }
      setError(null); // Clear any previous errors
    } catch (err) {
      // Handle errors, type the error as a generic Error type
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      setOutput(""); // Clear output when there is an error
    }
  };
  useEffect(() => {
    async function fetchSidebar() {
      try {
        const data = await api.get(
          `/courses/${slug}/weeks/${weekNumber}/get_completion/`
        );
        
        setParts([
          {
            name: "Reading Material",
            type: "reading",
            slug: "reading",
            description: `Learning material`,
            completed: data.data.material_read,
          },
          {
            name: "Quiz questions",
            type: "questions",
            slug: "questions",
            description: "Answer quiz questions",
            completed: data.data.quiz_completed,
          },
          {
            name: "Coding Tasks",
            type: "coding",
            slug: "coding",
            description: "Complete coding challenges",
            completed: data.data.code_completed,
          },
          {
            name: "Complete Tasks",
            type: "complete",
            slug: "complete",
            description: "Finish this week's materials",
            completed:
              data.data.material_read &&
              data.data.quiz_completed &&
              data.data.code_completed,
          },
        ]);
      } catch (error) {
        console.error("Failed to load sidebar:", error);
      }
    }

    fetchSidebar();
  }, [slug, weekNumber]);

  useEffect(() => {
    async function fetchCode() {
      try {
        const res = await api.get(
          `/courses/${slug}/weeks/${weekNumber}/codes/`
        );
        const data = res.data;
        console.log(data);

        if (data.length > 0) {
          setCodeTasks(data);
        }
      } catch (error) {
        console.error("Failed to load coding challenges:", error);
      }
    }

    fetchCode();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Animated Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-20 -right-32 w-72 h-72 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full opacity-25 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99,102,241,0.3) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      <div className="relative z-10 pt-20">
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0 p-6">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 sticky top-24">
              <WeekMenu ref={menuRef} parts={parts} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              {/* Breadcrumbs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-6"
              >
                <Breadcrumbs />
              </motion.div>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20 mb-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <FaCode className="text-indigo-600 text-3xl" />
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Week {weekNumber}: Coding Challenge
                  </h1>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Each week's coding challenge is carefully crafted from the
                  material you've just studied. These tasks are designed to help
                  you apply what you've learned in a practical way, reinforce
                  your understanding, and build confidence in solving real-world
                  programming problems.
                </p>
              </motion.div>

              {/* Coding Tasks */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20 mb-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <FaLaptopCode className="text-purple-600 text-2xl" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Coding Tasks
                  </h2>
                </div>
                
                {codeTasks.length > 0 ? (
                  <div className="space-y-6">
                    {codeTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                      >
                        <CodingTaskCard
                          taskNumber={index + 1}
                          taskId={task.id}
                          description={task.problem_statement}
                          difficulty={task.difficulty_display}
                          userScore={task.user_score}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaCode className="text-gray-400 text-6xl mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No coding tasks available for this week.</p>
                  </div>
                )}
              </motion.div>

              {/* Complete Button */}
              {codeTasks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="text-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex items-center gap-2 px-8 py-4 mx-auto rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={() => {
                      menuRef.current?.goToNextPart();
                    }}
                  >
                    <FaCheck className="text-sm group-hover:scale-110 transition-transform" />
                    Complete Coding Challenges
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
