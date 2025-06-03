"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/src/components/Header";
import CourseCard from "@/src/components/CourseCard";
import UploadCourseDialog from "@/src/components/CourseUploadDialog";
import api from "@/src/lib/axios";

interface Course {
  id: number;
  title: string;
  title_slug: string;
  description: string;
  level: string;
  image: string;
  duration_weeks: number;
  estimated_time: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses/");
        console.log(res.data);
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="min-h-screen mt-10 bg-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-10">
            Explore Our Courses
          </h1>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}

              <div>
                <button
                  className="group w-full h-full text-left p-0 bg-transparent border-none"
                  onClick={() => setOpenDialog(true)}
                >
                  <div className="bg-indigo-600 rounded-2xl shadow overflow-hidden transition-transform transform group-hover:scale-105 duration-300 ease-in-out cursor-pointer h-full flex flex-col">
                    <div className="flex-1 flex items-center justify-center h-48">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="white"
                        className="w-16 h-16 mt-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                    </div>
                    <div className="p-6 text-center">
                      <h2 className="text-white font-semibold text-xl">
                        Add Your Own Course
                      </h2>
                    </div>
                  </div>
                </button>

                <UploadCourseDialog
                  isOpen={openDialog}
                  onClose={() => setOpenDialog(false)}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
