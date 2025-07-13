"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaSearch, FaFilter, FaPlus, FaGraduationCap } from "react-icons/fa";

import CourseCard from "@/src/components/CourseCard";
import UploadCourseDialog from "@/src/components/CourseUploadDialog";
import api from "@/src/lib/axios";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import LoadingPage from "@/src/components/LoadingPage";

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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState("title");
  const [error, setError] = useState("");
  const [courseNumber, setCourseNumber] = useState(0);

  const sortOptions = [
    { label: "Title", value: "title" },
    { label: "Created at", value: "created_at" },
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses/");
        console.log(res.data);
        setCourses(res.data);
        setCourseNumber(res.data.length);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
    setSearch("");
    setOrderBy("title");
  }, [openDialog]);

  const fetchFilteredCourses = async (title: string, order_by: string) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/courses/filter/?title=${title}&order_by=-${order_by}`
      );
      setCourses(res.data);
    } catch (err) {
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

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
          
          {/* Floating Geometric Shapes */}
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-indigo-300 rotate-45 opacity-30 animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-300 rotate-45 opacity-40 animate-bounce" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/3 left-1/3 w-5 h-5 bg-blue-300 rotate-45 opacity-25 animate-bounce" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-1/4 right-1/3 w-6 h-6 bg-cyan-300 rounded-full opacity-30 animate-ping" style={{animationDelay: '1.5s'}}></div>
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
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Explore Our Courses
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover world-class learning experiences designed to elevate your skills
            </p>
          </motion.div>

          {/* Search and Filter Section */}
          {courseNumber > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8 border border-white/20"
            >
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Search Input */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        fetchFilteredCourses(search, orderBy);
                      }
                    }}
                    className="block w-full pl-10 pr-4 py-3 border-0 rounded-xl bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-300"
                  />
                </div>

                {/* Sort Dropdown */}
                <div className="relative w-full sm:w-64">
                  <Listbox
                    value={orderBy}
                    onChange={(val) => {
                      setOrderBy(val);
                      fetchFilteredCourses(search, val);
                    }}
                  >
                    <div className="relative">
                      <Listbox.Button className="relative w-full cursor-default rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 pl-4 pr-10 text-left text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm hover:from-indigo-700 hover:to-purple-700 transition-all duration-300">
                        <div className="flex items-center gap-2">
                          <FaFilter className="h-4 w-4" />
                          <span className="block truncate">
                            {sortOptions.find((o) => o.value === orderBy)?.label}
                          </span>
                        </div>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon className="h-5 w-5 text-white/70" />
                        </span>
                      </Listbox.Button>

                      <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white/95 backdrop-blur-lg py-1 text-base shadow-2xl ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">
                        {sortOptions.map((option) => (
                          <Listbox.Option
                            key={option.value}
                            value={option.value}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-4 pr-10 ${
                                active
                                  ? "bg-indigo-100 text-indigo-900"
                                  : "text-gray-900"
                              } transition-colors duration-200`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                  {option.label}
                                </span>
                                {selected && (
                                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-indigo-600">
                                    <CheckIcon className="h-5 w-5" />
                                  </span>
                                )}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
              </div>
            </motion.div>
          )}

          {/* Course Grid */}
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <LoadingPage />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}

              {/* Add Course Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 + courses.length * 0.1 }}
                className="group"
              >
                <button
                  className="w-full h-full text-left p-0 bg-transparent border-none"
                  onClick={() => setOpenDialog(true)}
                >
                  <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-3xl cursor-pointer h-full flex flex-col min-h-[380px] border border-white/20">
                    <div className="flex-1 flex items-center justify-center relative">
                      {/* Floating background elements */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-4 right-4 w-8 h-8 bg-white/30 rounded-full animate-pulse"></div>
                        <div className="absolute bottom-6 left-4 w-6 h-6 bg-white/20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                        <div className="absolute top-1/2 left-1/2 w-12 h-12 bg-white/10 rounded-full animate-ping"></div>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10"
                      >
                        <FaPlus className="w-16 h-16 text-white drop-shadow-lg" />
                      </motion.div>
                    </div>
                    <div className="p-6 text-center bg-white/10 backdrop-blur-sm">
                      <h2 className="text-white font-bold text-xl mb-2 drop-shadow-lg">
                        Create New Course
                      </h2>
                      <p className="text-white/90 text-sm drop-shadow-md">
                        Build your own learning experience
                      </p>
                    </div>
                  </div>
                </button>

                <UploadCourseDialog
                  isOpen={openDialog}
                  onClose={() => setOpenDialog(false)}
                />
              </motion.div>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && courses.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center py-16"
            >
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-12 border border-white/20 max-w-lg mx-auto">
                <FaGraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No courses found</h3>
                <p className="text-gray-600 mb-6">
                  {search ? "Try adjusting your search terms" : "Start your learning journey by creating your first course"}
                </p>
                <button
                  onClick={() => setOpenDialog(true)}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Create Course
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
