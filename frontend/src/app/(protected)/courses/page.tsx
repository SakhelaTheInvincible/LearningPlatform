import React from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/src/components/Header";

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  level: string;
  image: string;
  duration_weeks: number;
  estimated_time: number;
}

async function getCourses(): Promise<Course[]> {
  const res = await fetch("http://127.0.0.1:8000/api/courses/");
  if (!res.ok) {
    throw new Error("Failed to fetch courses");
  }
  return res.json();
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Courses Section */}
      <section className="min-h-screen mt-10 h-max bg-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-10">
            Explore Our Courses
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div className="" key={course.id}>
                <Link href={`/courses/${course.title}`} className="group">
                  <div className="bg-white rounded-2xl shadow overflow-hidden transition-transform transform group-hover:scale-105 duration-300 ease-in-out cursor-pointer">
                    <Image
                      src={course.image || "/courses/default.jpg"}
                      alt={course.title}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-indigo-600">
                        {course.title}
                      </h2>
                      <p className="text-gray-600 mt-2">{course.description}</p>
                      <span className="inline-block mt-4 px-3 py-1 bg-indigo-100 text-indigo-600 text-sm font-medium rounded-full">
                        {course.level}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
