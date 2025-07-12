"use client";

import { motion } from "framer-motion";
import { FaBook, FaClock, FaCalendarAlt } from "react-icons/fa";
import SidebarDropdown from "@/src/components/SidebarDropdown";
import WeekDropdown from "@/src/components/WeekDropdown";
import Image from "next/image";
import Timeline from "@/src/components/TimeLine";
import { useEffect, useState } from "react";
import api from "@/src/lib/axios";
import { use } from "react";
import { useParams } from "next/navigation";
import LoadingPage from "@/src/components/LoadingPage";

interface CourseInfo {
  title: string;
  description: string;
  image: string;
  duration_weeks: number;
  weeks: Weeks[];
  modules: string[];
  parts: Part[];
}
interface Weeks {
  week_number: number;
  materials: Material[];
}
interface Material {
  title: string;
}
interface Part {
  name: string;
  type: "reading" | "questions" | "coding" | "complete";
  slug: string;
  description: string;
  completed: boolean;
}

export default function WeekLearning() {
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const slug = params?.slug as string;
  const weekNumber = parseInt(params?.weekNumber as string);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res5 = await api.get(`/courses/${slug}/weeks/${weekNumber}/`);
        console.log(res5.data);

        const res = await api.get(`/courses/${slug}`);
        const data = res.data;

        console.log(data);

        const week = data.weeks?.find((w: any) => w.week_number === weekNumber);

        const res2 = await api.get(
          `/courses/${slug}/weeks/${weekNumber}/get_completion/`
        );
        const data2 = res2.data;
        const res1 = await api.get(
          `/courses/${slug}/weeks/${weekNumber}/codes/`
        );
        const data1 = res1.data;

        const parts: Part[] =
          week?.materials?.map((material: any, index: number) => ({
            name: material.title || `Part ${index + 1}`,
            type: "reading", // You can customize this if your material has a type
            slug: material.slug || `reading`,
            description: `Learning material`,
            completed: data2.material_read,
          })) || [];

        console.log(data1);
        if (parts.length != 0) {
          parts.push({
            name: "Quiz questions",
            type: "questions",
            slug: "questions",
            description: "Answer quiz questions",
            completed: data2.quiz_completed,
          });
        }

        if (data1.length != 0) {
          parts.push({
            name: "Coding Tasks",
            type: "coding",
            slug: "coding",
            description: "Complete coding challanges",
            completed: data2.code_completed,
          });
        }

        const transformed: CourseInfo = {
          title: data.title || "",
          image: data.image || "",
          description: data.description || "",
          duration_weeks: data.duration_weeks || 0,
          weeks: data.weeks || [],
          modules: data.weeks?.map((week: any) => `Week ${week.week_number}`),
          parts,
        };

        setCourse(transformed);
        console.log(transformed);
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
  if (!course) return <div className="min-h-screen flex items-center justify-center text-gray-500">Course not found.</div>;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Animated Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          {/* Large Background Circles */}
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

      <div className="relative z-10 min-h-screen pt-28 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Course Image */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex-shrink-0"
              >
                <div className="relative">
                  <Image
                    src={
                      course.image && course.image.trim() !== ""
                        ? course.image
                        : "/courses/default-course-thumbnail.png"
                    }
                    alt={course.title}
                    width={120}
                    height={120}
                    className="w-32 h-32 object-cover rounded-2xl shadow-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                </div>
              </motion.div>

              {/* Course Title */}
              <div className="flex-1">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
                >
                  {course.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-gray-600 text-lg"
                >
                  Week {weekNumber} Learning Materials
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="lg:col-span-3"
            >
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                  <FaBook className="text-indigo-600 text-lg" />
                  <h3 className="font-semibold text-gray-800">Course Navigation</h3>
                </div>
                <SidebarDropdown duration_weeks={course.duration_weeks} />
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="lg:col-span-6"
            >
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <FaClock className="text-purple-600 text-lg" />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Week {weekNumber} Materials
                    </h2>
                  </div>
                  <WeekDropdown
                    weekTitle={`Week ${weekNumber}: ${
                      course.parts[0]?.name || "Materials"
                    }`}
                    parts={course.parts}
                    weekNumber={weekNumber}
                    description={`Week ${weekNumber} learning materials`}
                  />
                </div>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="lg:col-span-3"
            >
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                  <FaCalendarAlt className="text-pink-600 text-lg" />
                  <h3 className="font-semibold text-gray-800">Course Timeline</h3>
                </div>
                <Timeline
                  startDate="2025-01-01"
                  weeks={course.duration_weeks}
                  timePerWeek={7}
                />
              </div>
            </motion.div>
          </div>

          {/* Course Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="mt-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Course Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-indigo-600">
                  {course.parts.filter(part => part.completed).length}
                </div>
                <div className="text-sm text-gray-600">Completed Tasks</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">
                  {course.parts.length}
                </div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-pink-50 to-red-50 rounded-xl">
                <div className="text-2xl font-bold text-pink-600">
                  {Math.round((course.parts.filter(part => part.completed).length / course.parts.length) * 100) || 0}%
                </div>
                <div className="text-sm text-gray-600">Week Progress</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
