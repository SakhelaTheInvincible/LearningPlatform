"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaCheckCircle, FaGraduationCap, FaArrowRight } from "react-icons/fa";
import WeekMenu, { WeekMenuHandle } from "@/src/components/weekMenu";
import Breadcrumbs from "@/src/components/Breadcrumbs";
import { useParams } from "next/navigation";
import api from "@/src/lib/axios";
import { useRouter } from "next/navigation";

interface Part {
  name: string;
  type: "reading" | "questions" | "coding" | "complete";
  slug: string;
  description: string;
  completed: boolean;
}

export default function WeekComplete() {
  const [parts, setParts] = useState<Part[]>([]);
  const [showIncompleteMessage, setShowIncompleteMessage] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const menuRef = useRef<WeekMenuHandle>(null);
  const router = useRouter();

  const params = useParams();
  const slug = params?.slug as string;
  const weekNumber = parseInt(params?.weekNumber as string);

  useEffect(() => {
    async function fetchSidebar() {
      try {
        const res = await api.get(
          `/courses/${slug}/weeks/${weekNumber}/get_completion/`
        );
        const data = res.data;
        const res1 = await api.get(
          `/courses/${slug}/weeks/${weekNumber}/codes/`
        );
        const data1 = res1.data;
        let currentParts: Part[] = [];
        
        if (data1.length !== 0) {
          currentParts = [
            {
              name: "Reading Material",
              type: "reading",
              slug: "reading",
              description: `Learning material`,
              completed: data.material_read,
            },
            {
              name: "Quiz questions",
              type: "questions",
              slug: "questions",
              description: "Answer quiz questions",
              completed: data.quiz_completed,
            },
            {
              name: "Coding Tasks",
              type: "coding",
              slug: "coding",
              description: "Complete coding challenges",
              completed: data.code_completed,
            },
            {
              name: "Complete Tasks",
              type: "complete",
              slug: "complete",
              description: "Finish this week's materials",
              completed:
                data.material_read &&
                data.quiz_completed &&
                data.code_completed,
            },
          ];
        } else {
          currentParts = [
            {
              name: "Reading Material",
              type: "reading",
              slug: "reading",
              description: `Learning material`,
              completed: data.material_read,
            },
            {
              name: "Quiz questions",
              type: "questions",
              slug: "questions",
              description: "Answer quiz questions",
              completed: data.quiz_completed,
            },
            {
              name: "Complete Tasks",
              type: "complete",
              slug: "complete",
              description: "Finish this week's materials",
              completed: data.material_read && data.quiz_completed,
            },
          ];
        }

        setParts(currentParts);
        
        // Calculate completion stats
        const completed = currentParts.filter(part => part.completed && part.type !== 'complete').length;
        const total = currentParts.filter(part => part.type !== 'complete').length;
        setCompletedTasks(completed);
        setTotalTasks(total);
      } catch (error) {
        console.error("Failed to load sidebar:", error);
      }
    }

    fetchSidebar();
  }, [slug, weekNumber]);

  async function finishWeek() {
    try {
      const res = await api.get(
        `/courses/${slug}/weeks/${weekNumber}/get_completion/`
      );
      const data = res.data;
      console.log(data);
      const res1 = await api.get(
        `/courses/${slug}/weeks/${weekNumber}/codes/`
      );
      const data1 = res1.data;
      let allCompleted = false;
      
      if (data1.length !== 0) {
        allCompleted = data.material_read && data.quiz_completed && data.code_completed;
      } else {
        allCompleted = data.material_read && data.quiz_completed;
      }

      if (allCompleted) {
        // Mark week as complete
        await api.post(`/courses/${slug}/weeks/${weekNumber}/complete/`);
        
        // Navigate to next week or course completion
        const nextWeek = weekNumber + 1;
        const courseRes = await api.get(`/courses/${slug}`);
        const courseData = courseRes.data;
        
        if (nextWeek <= courseData.duration_weeks) {
          router.push(`/courses/${slug}/week/${nextWeek}`);
        } else {
          router.push(`/courses/${slug}`);
        }
      } else {
        setShowIncompleteMessage(true);
        setTimeout(() => setShowIncompleteMessage(false), 3000);
      }
    } catch (error) {
      console.error("Failed to complete week:", error);
    }
  }

  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
            <div className="max-w-4xl mx-auto">
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
                  <FaGraduationCap className="text-indigo-600 text-3xl" />
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Week {weekNumber} Complete
                  </h1>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Complete all materials for this week and continue your learning journey.
                </p>
              </motion.div>

              {/* Progress Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20 mb-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <FaCheckCircle className="text-green-600 text-2xl" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Week Progress
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                    <div className="text-3xl font-bold text-indigo-600 mb-2">
                      {completedTasks}
                    </div>
                    <div className="text-sm text-gray-600">Tasks Completed</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {totalTasks}
                    </div>
                    <div className="text-sm text-gray-600">Total Tasks</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {progressPercent}%
                    </div>
                    <div className="text-sm text-gray-600">Progress</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-gray-200 rounded-full h-4 mb-6">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                    className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 h-4 rounded-full"
                  />
                </div>

                {/* Task List */}
                <div className="space-y-3">
                  {parts.filter(part => part.type !== 'complete').map((part, index) => (
                    <motion.div
                      key={part.slug}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                      className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                        part.completed 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-orange-50 border border-orange-200'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        part.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-orange-500 text-white'
                      }`}>
                        {part.completed ? <FaCheck className="text-xs" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{part.name}</h3>
                        <p className="text-sm text-gray-600">{part.description}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        part.completed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {part.completed ? 'Completed' : 'Pending'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Complete Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="text-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group flex items-center gap-3 px-8 py-4 mx-auto rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={finishWeek}
                >
                  <FaCheck className="text-lg group-hover:scale-110 transition-transform" />
                  Mark Week as Complete
                  <FaArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Incomplete Message */}
      {showIncompleteMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-sm text-orange-800 px-6 py-4 rounded-2xl border border-orange-200 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-orange-500"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25Zm.75 13.5a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5Zm0-9a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 1.5 0v-6Z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Please complete all required materials before proceeding.</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
