"use client";
import { useState } from "react";
import Header from "@/src/components/Header";
import Breadcrumbs from "@/src/components/Breadcrumbs";
import Image from "next/image";
import Link from "next/link";
import { StarIcon, HandThumbUpIcon } from "@heroicons/react/24/solid";

interface CourseInfo {
  title: string;
  image: string;
  description: string;
  weeks: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  estimatedTime: string;
  rating: number; // 1 to 5
  likePercentage: number; // 0 to 100
  slug: string; // for "Go to Course" link
  modules: string[];
}




export default function CoursePage({ course }: { course: CourseInfo }) {
  const [activeTab, setActiveTab] = useState<"about" | "modules">("about");

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="mt-[70px] w-full pl-[140px] pb-4 pt-2">
        <Breadcrumbs />
      </div>

      {/* Course Banner */}
      <div className="relative bg-gray-200 h-[400px] flex items-center justify-start pl-[130px]">
        <div className="max-w-[200px] mb-[220px]">
          <Image
            src={course.image}
            alt={course.title}
            width={200}
            height={100}
            className="object-cover rounded-lg shadow-md"
          />
        </div>

        <div className="absolute text-center">
          <h1 className=" text-4xl font-bold mb-4 drop-shadow-lg mt-[150px]">
            {course.title}
          </h1>
          <div className="flex flex-row justify-start mb-[50px]">
            <Link href={`${course.slug}/week/1`}>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-indigo-700 transition">
                Go to Course
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay Card */}
      <div className="w-[calc(100%-260px)] mx-auto -mt-16 z-10 relative border rounded-lg border-gray-200">
        <div className="bg-white rounded-lg shadow-lg p-6 divide-y divide-black">
          <div className="flex justify-between py-1">
            <div className="text-left px-3">
              <div className="font-semibold">{course.weeks} Weeks</div>
              <div className="text-sm text-gray-500 ">
                Gain insight into a topic and learn the fundamentals.
              </div>
            </div>
            <div className="border-l border-gray-300"></div>
            <div className="text-left px-3">
              <div className="flex flex-row">
                <div className="">4.5</div>
                <StarIcon className="w-5 h-5 text-indigo-600 ml-2" />
              </div>
              <div className="text-sm text-gray-500 ">(11,797 reviews)</div>
            </div>
            <div className="border-l border-gray-300"></div>
            <div className="text-left px-3">
              <div className="font-semibold">{course.difficulty} Level</div>
              <div className="text-sm text-gray-500 ">
                Some related experience required
              </div>
            </div>
            <div className="border-l border-gray-300"></div>
            <div className="text-left px-3">
              <div className="font-semibold">Est. Time</div>
              <div className="text-sm text-gray-500 ">
                {course.estimatedTime}
              </div>
            </div>
            <div className="border-l border-gray-300"></div>
            <div className="text-left px-3">
              <div className="flex flex-row">
                <HandThumbUpIcon className="w-5 h-5 text-indigo-600 mr-2" />
                <div className="font-semibold">{course.likePercentage}%</div>
              </div>
              <div className="text-sm text-gray-500 ">
                Most learners liked this course
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="ml-[130px] mx-auto mt-10">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("about")}
            className={`px-6 py-2 rounded-md font-semibold ${
              activeTab === "about"
                ? "bg-indigo-600 text-white"
                : "bg-indigo-100 text-indigo-700"
            } transition`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab("modules")}
            className={`px-6 py-2 rounded-md font-semibold ${
              activeTab === "modules"
                ? "bg-indigo-600 text-white"
                : "bg-indigo-100 text-indigo-700"
            } transition`}
          >
            Modules
          </button>
        </div>

        {/* About / Modules Content */}
        {activeTab === "about" ? (
          <div className="bg-white p-6 w-[calc(100%-130px)] rounded-lg shadow ">
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">
              About this Course
            </h2>
            <div className="text-gray-700 leading-relaxed">
              {course.description}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 w-[calc(100%-130px)] rounded-lg shadow ">
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">
              Course Modules
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              {course.modules.map((module, index) => (
                <li key={index}>{module}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
