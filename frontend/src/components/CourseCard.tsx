"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaClock, FaCalendarAlt, FaStar, FaArrowRight, FaCheckCircle } from "react-icons/fa";

interface Course {
  id: number;
  title: string;
  title_slug: string;
  description: string;
  level: string;
  image: string;
  duration_weeks: number;
  estimated_time: number;
  is_completed: boolean;
}

interface CourseCardProps {
  course: Course;
  index?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, index = 0 }) => {
  const getLevelColor = (level: string) => {
    if (!level) return "from-gray-400 to-gray-500";
    
    switch (level.toLowerCase()) {
      case "beginner":
        return "from-green-400 to-emerald-500";
      case "intermediate":
        return "from-blue-400 to-indigo-500";
      case "advanced":
        return "from-purple-400 to-pink-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <Link
        href={`/courses/${course.title_slug}`}
        className="group block h-full"
      >
        <motion.div
          whileHover={{ y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 ease-in-out cursor-pointer flex flex-col h-full border ${
            course.is_completed 
              ? 'border-green-300 bg-green-50/50' 
              : 'border-white/20'
          }`}
        >
          {/* Image Container */}
          <div className="relative overflow-hidden">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={
                  course.image && course.image.trim() !== ""
                    ? course.image
                    : "/courses/default-course-thumbnail.png"
                }
                alt={course.title}
                width={400}
                height={200}
                className="w-full h-48 object-cover"
              />
            </motion.div>
            
            {/* Completion Badge */}
            {course.is_completed && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-lg">
                <FaCheckCircle className="text-xs" />
                Completed
              </div>
            )}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          <div className="p-6 flex flex-col justify-between flex-1">
            {/* Title */}
            <motion.h2
              className={`text-xl font-bold mb-2 transition-colors duration-200 ${
                course.is_completed 
                  ? 'text-green-700 group-hover:text-green-600' 
                  : 'text-gray-800 group-hover:text-indigo-600'
              }`}
              title={course.title}
            >
              {course.title}
            </motion.h2>

            {/* Description */}
            <div className="relative mb-4 flex-1">
              <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Course Stats */}
            <div className="flex items-center justify-center mb-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <FaCalendarAlt className="text-xs" />
                <span>{course.duration_weeks} week{course.duration_weeks !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Action Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center justify-between text-white px-4 py-3 rounded-xl font-medium shadow-lg group-hover:shadow-xl transition-all duration-200 ${
                course.is_completed 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600'
              }`}
            >
              <span>{course.is_completed ? 'Review Course' : 'Start Learning'}</span>
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                {course.is_completed ? (
                  <FaCheckCircle className="text-sm" />
                ) : (
                  <FaArrowRight className="text-sm" />
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Hover effect glow */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl ${
            course.is_completed 
              ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10' 
              : 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10'
          }`} />
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default CourseCard;
