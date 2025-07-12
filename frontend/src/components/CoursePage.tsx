"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaPlay, FaTrash, FaClock, FaGraduationCap, FaLanguage, FaPlus, FaBook, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

import Breadcrumbs from "@/src/components/Breadcrumbs";
import Image from "next/image";
import Link from "next/link";
import api from "@/src/lib/axios";
import { useRouter } from "next/navigation";
import UploadWeekDialog from "./WeekUploadDialog";
import LoadingPage from "./LoadingPage";
import { HandThumbUpIcon } from "@heroicons/react/24/solid";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

interface CourseInfo {
  title: string;
  image: string;
  description: string;
  weeks: number;
  estimatedTime: string;
  slug: string;
  modules: string[];
  language?: string;
  completedWeeks: number;
}

export default function CoursePage({ slug }: { slug: string }) {
  const [activeTab, setActiveTab] = useState<"about" | "modules">("about");
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await api.get(`/courses/${slug}`);
        const data = res.data;

        const weeks = data.weeks || [];
        const completedWeeks = weeks.filter((w: any) => w.is_completed).length;

        const transformed: CourseInfo = {
          title: data.title || "",
          image: data.image || "",
          description: data.description || "",
          weeks: data.duration_weeks || 0,
          estimatedTime: `${data.duration_weeks * 5 || 0} hours`,
          slug,
          language: data.language || "",
          completedWeeks,
          modules:
            weeks.map(
              (week: any) =>
                `Week ${week.week_number}: ${
                  week.materials?.[0]?.title || "No title"
                }${week.is_completed ? " (completed)" : ""}`
            ) || [],
        };

        setCourse(transformed);
      } catch (error) {
        console.error("Failed to load course:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [slug]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingPage />
      </div>
    );
  if (!course) return <div className="min-h-screen flex items-center justify-center text-gray-500">Course not found.</div>;

  const progressPercent = Math.round(
    (course.completedWeeks / course.weeks) * 100
  );

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

      <div className="relative z-10 pt-28">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Breadcrumbs />
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Course Image */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
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
                    width={300}
                    height={200}
                    className="object-cover rounded-2xl shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                </div>
              </motion.div>

              {/* Course Info */}
              <div className="flex-1 text-center lg:text-left">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6"
                >
                  {course.title}
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                >
                  <Link href={`${course.slug}/week/1`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <FaPlay className="text-sm group-hover:scale-110 transition-transform" />
                      Start Learning
                    </motion.button>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={async () => {
                      if (
                        !window.confirm(
                          "Are you sure you want to delete this course? This action cannot be undone."
                        )
                      )
                        return;
                      try {
                        await api.delete(`/courses/${course.slug}/`);
                        router.push("/courses");
                      } catch (err) {
                        console.error("Failed to delete course:", err);
                      }
                    }}
                  >
                    <FaTrash className="text-sm group-hover:scale-110 transition-transform" />
                    Delete Course
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="max-w-7xl mx-auto px-6 -mt-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 text-center">
              {/* Duration */}
              <div className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <FaClock className="text-indigo-600 text-2xl" />
                </div>
                <div className="font-bold text-2xl text-gray-800">
                  {course.weeks}
                </div>
                <div className="text-sm text-gray-500">
                  Week{course.weeks > 1 ? "s" : ""}
                </div>
              </div>

              {/* Estimated Time */}
              <div className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <FaGraduationCap className="text-purple-600 text-2xl" />
                </div>
                <div className="font-bold text-2xl text-gray-800">
                  {course.estimatedTime}
                </div>
                <div className="text-sm text-gray-500">Estimated Time</div>
              </div>

              {/* Language */}
              {course.language && course.language.toLowerCase() !== "none" && (
                <div className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <FaLanguage className="text-pink-600 text-2xl" />
                  </div>
                  <div className="font-bold text-2xl text-gray-800">
                    {course.language}
                  </div>
                  <div className="text-sm text-gray-500">Language</div>
                </div>
              )}

              {/* Progress */}
              <div className="p-4">
                <div className="flex items-center justify-center mb-1 h-8">
                  <div className="relative mt-3" style={{ width: '65px', height: '65px' }}>
                    {/* Background circle */}
                    <svg style={{ width: '65px', height: '65px' }} className="transform -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="url(#progressGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercent / 100)}`}
                        className="transition-all duration-1000 ease-in-out"
                      />
                      <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="50%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    {/* Percentage in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-700">{progressPercent}%</span>
                    </div>
                  </div>
                </div>
                <div className="font-bold text-3xl text-gray-800 opacity-0 pointer-events-none mb-1">
                  {progressPercent}%
                </div>
                <div className="text-sm text-gray-500 -mt-3">Progress</div>
              </div>

              {/* Completion Status */}
              <div className="p-4">
                <div className="flex items-center justify-center mb-2">
                  {course.completedWeeks === course.weeks ? (
                    <FaCheckCircle className="text-green-600 text-2xl" />
                  ) : (
                    <FaExclamationCircle className="text-yellow-600 text-2xl" />
                  )}
                </div>
                <div className="font-bold text-lg text-gray-800">
                  {course.completedWeeks === course.weeks ? (
                    "Completed"
                  ) : (
                    `${course.weeks - course.completedWeeks} Left`
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {course.completedWeeks === course.weeks ? "Course Status" : "Weeks"}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex gap-2 bg-white/80 backdrop-blur-lg rounded-2xl p-2 shadow-xl border border-white/20 w-fit"
          >
            <button
              onClick={() => setActiveTab("about")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "about"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              <FaBook className="text-sm" />
              About
            </button>
            <button
              onClick={() => setActiveTab("modules")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "modules"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              <FaGraduationCap className="text-sm" />
              Modules
            </button>
          </motion.div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20"
          >
            {activeTab === "about" ? (
              <div>
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  About this Course
                </h2>
                <div className="text-gray-700 leading-relaxed text-lg">
                  {course.description}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Course Modules
                </h2>
                <div className="space-y-4 mb-8">
                  {course.modules.map((module, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 font-medium">{module}</span>
                    </motion.div>
                  ))}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  onClick={() => setOpenDialog(true)}
                >
                  <FaPlus className="text-sm group-hover:rotate-90 transition-transform duration-300" />
                  Upload Weekly Material
                </motion.button>

                <UploadWeekDialog
                  isOpen={openDialog}
                  onClose={() => setOpenDialog(false)}
                  slug={slug}
                  weeks={course.weeks}
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
