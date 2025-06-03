import React from "react";
import Link from "next/link";
import Image from "next/image";

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

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className="h-full">
      <Link
        href={`/courses/${course.title_slug}`}
        className="group block h-full"
      >
        <div className="bg-white rounded-2xl shadow overflow-hidden transition-transform transform group-hover:scale-105 duration-300 ease-in-out cursor-pointer flex flex-col h-full">
          <Image
            src={course.image || "/courses/default.jpg"}
            alt={course.title}
            width={400}
            height={200}
            className="w-full h-48 object-cover"
          />
          <div className="p-6 flex flex-col justify-between flex-1">
            {/* Title with tooltip */}
            <h2
              className="text-xl font-semibold text-indigo-600 truncate"
              title={course.title}
            >
              {course.title}
            </h2>

            {/* Description clamped with fade */}
            <div className="relative mt-2 h-[3.2rem] overflow-hidden">
              <p
                className="text-gray-600 text-sm line-clamp-2"
                title={course.description}
              >
                {course.description}
              </p>
              {/* Fade overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            </div>

            {/* Level tag pinned at bottom */}
            <span className="mt-4 inline-block px-3 py-1 bg-indigo-100 text-indigo-600 text-sm font-medium rounded-full whitespace-nowrap">
              {course.level}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CourseCard;
