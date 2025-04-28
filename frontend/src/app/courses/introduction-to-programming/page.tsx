import React from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/src/components/Header";

const courses = [
  {
    id: 1,
    title: "Introduction to Programming",
    courseName: "introduction-to-programming",
    description: "Build a strong foundation in programming using Java.",
    level: "Beginner",
    image: "/courses/programming.jpg",
  },
  {
    id: 2,
    title: "Problem Solving",
    courseName: "problem-solving",
    description:
      "Master solving problems using algorithms and data structures.",
    level: "Intermediate",
    image: "/courses/problem-solving.jpg",
  },
  {
    id: 3,
    title: "Databases - 1",
    courseName: "databases-1",
    description:
      "Understand relational databases, SQL, and data modeling for efficient data management.",
    level: "Intermediate",
    image: "/courses/databases.jpg",
  },
  {
    id: 4,
    title: "Scripting Languages",
    courseName: "scripting-languages",
    description:
      "Explore scripting with Python and JavaScript to automate tasks and build practical tools.",
    level: "Intermediate",
    image: "/courses/scripting.jpg",
  },
  {
    id: 5,
    title: "Backend Development",
    courseName: "backend-development",
    description:
      "Master server-side development, APIs, and databases to power web applications.",
    level: "Advanced",
    image: "/courses/backend.jpg",
  },
];

export default function introduction_to_programming() {
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
              <Link
                key={course.id}
                href={`introduction-to-programming/week/1`}
                className="group"
              >
                <div className="bg-white rounded-2xl shadow overflow-hidden transition-transform transform group-hover:scale-105 duration-300 ease-in-out cursor-pointer">
                  <Image
                    src={course.image}
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
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
