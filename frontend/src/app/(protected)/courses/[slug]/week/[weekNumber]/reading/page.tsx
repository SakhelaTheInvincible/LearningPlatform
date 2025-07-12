"use client";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaBook, FaCheck, FaArrowRight, FaLightbulb } from "react-icons/fa";

import WeekMenu, { WeekMenuHandle } from "@/src/components/weekMenu";
import Breadcrumbs from "@/src/components/Breadcrumbs";
import { useParams } from "next/navigation";
import api from "@/src/lib/axios";
import LoadingPage from "@/src/components/LoadingPage";

interface WeekInfo {
  week_number: number;
  materials: Material[];
}

interface Material {
  title: string;
  description: string;
  summarized_material: string;
}

interface Part {
  name: string;
  type: "reading" | "questions" | "coding" | "complete";
  slug: string;
  description: string;
  completed: boolean;
}

export default function WeekReading() {
  const [loading, setLoading] = useState(true);
  const [parts, setParts] = useState<Part[]>([]);
  const [material, setMaterial] = useState<WeekInfo>({
    week_number: 1,
    materials: [],
  });
  const params = useParams();
  const slug = params?.slug as string;
  const weekNumber = parseInt(params?.weekNumber as string);
  const menuRef = useRef<WeekMenuHandle>(null);

  useEffect(() => {
    async function fetchSidebar() {
      try {
        const data = await api.get(
          `/courses/${slug}/weeks/${weekNumber}/get_completion/`
        );
        const data1 = await api.get(
          `/courses/${slug}/weeks/${weekNumber}/codes/`
        );

        if (data1.data.length != 0) {
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
        } else {
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
              name: "Complete Tasks",
              type: "complete",
              slug: "complete",
              description: "Finish this week's materials",
              completed: data.data.material_read && data.data.quiz_completed,
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to load sidebar:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSidebar();
  }, [slug, weekNumber]);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await api.get(`/courses/${slug}/weeks/${weekNumber}`);
        const data = res.data;
        setMaterial(data);
      } catch (error) {
        console.error("Failed to load course:", error);
      } finally {
        setLoading(false);
      }
    }

    if (slug && weekNumber) fetchCourse();
  }, [slug, weekNumber]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingPage />
      </div>
    );

  if (!material) return <div className="min-h-screen flex items-center justify-center text-gray-500">Material not found.</div>;

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

      <div className="relative z-10 min-h-screen pt-24">
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0 p-6">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 sticky top-24">
              <WeekMenu ref={menuRef} parts={parts} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-3">
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

              {/* Reading Materials */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20 mb-8"
              >
                <div className="flex items-center gap-3 mb-8">
                  <FaBook className="text-indigo-600 text-2xl" />
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Week {weekNumber} Reading Materials
                  </h1>
                </div>

                {material.materials.length > 0 ? (
                  <div className="space-y-8">
                    {material.materials.map((m, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 + index * 0.2 }}
                        className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-2xl p-6 border border-gray-200/50"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">
                              {m.title}
                            </h2>
                            <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                              {m.description}
                            </p>
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                              <div className="flex items-center gap-2 mb-4">
                                <FaLightbulb className="text-yellow-500 text-lg" />
                                <h3 className="font-semibold text-gray-800">Content</h3>
                              </div>
                              <div className="prose prose-lg max-w-none">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                  {m.summarized_material}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-center py-16"
                  >
                    <FaBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No Materials Available</h3>
                    <p className="text-gray-500">
                      No reading materials have been uploaded for this week yet.
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* Mark as Complete Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group flex items-center gap-3 px-8 py-4 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  onClick={async () => {
                    try {
                      const res = await api.put(
                        `/courses/${slug}/weeks/${weekNumber}/set_is_read/`,
                        { is_read: true }
                      );
                      console.log(res.data);
                      menuRef.current?.goToNextPart();
                    } catch (error) {
                      console.error("Failed to mark as complete:", error);
                    }
                  }}
                >
                  <FaCheck className="text-lg group-hover:scale-110 transition-transform" />
                  Mark as Completed
                  <FaArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
