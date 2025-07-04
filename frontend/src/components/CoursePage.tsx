"use client";

import { useEffect, useState } from "react";
import Header from "@/src/components/Header";
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
      <div className="p-10">
        <LoadingPage />
      </div>
    );
  if (!course) return <div className="p-10">Course not found.</div>;

  const progressPercent = Math.round(
    (course.completedWeeks / course.weeks) * 100
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="mt-[70px] w-full pl-[140px] pb-4 pt-2">
        <Breadcrumbs />
      </div>

      {/* Banner */}
      <div className="relative bg-gray-200 h-[400px] flex items-center justify-start pl-[130px]">
        <div className="max-w-[200px] mb-[220px]">
          <Image
            src={
              course.image && course.image.trim() !== ""
                ? course.image
                : "/courses/default-course-thumbnail.png"
            }
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
          <div className="flex flex-row justify-start mb-[50px] space-x-4">
            <Link href={`${course.slug}/week/1`}>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-indigo-700 transition">
                Go to Course
              </button>
            </Link>
            <button
              className="bg-red-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-red-700 transition"
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
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Overlay Card */}
      <div className="w-[calc(100%-260px)] mx-auto -mt-16 z-10 relative border rounded-lg border-gray-200">
        <div className="bg-white rounded-lg shadow-lg p-6 flex justify-between items-center text-center flex-wrap md:flex-nowrap">
          {/* Section 1: Duration */}
          <div className="px-4">
            <div className="font-semibold text-lg">
              {course.weeks} Week{course.weeks > 1 ? "s" : ""}
            </div>
            <div className="text-sm text-gray-500">Course Duration</div>
          </div>

          <div className="hidden md:block border-l h-12 border-gray-300"></div>

          {/* Section 2: Estimated Time */}
          <div className="px-4">
            <div className="font-semibold text-lg">{course.estimatedTime}</div>
            <div className="text-sm text-gray-500">Estimated Time</div>
          </div>

          {/* Conditionally render language section */}
          {course.language && course.language.toLowerCase() !== "none" && (
            <>
              <div className="hidden md:block border-l h-12 border-gray-300"></div>
              <div className="px-4">
                <div className="font-semibold text-lg">{course.language}</div>
                <div className="text-sm text-gray-500">Language</div>
              </div>
            </>
          )}

          <div className="hidden md:block border-l h-12 border-gray-300"></div>

          {/* Section 4: Progress Bar */}
          <div className="px-4 w-full md:w-[240px]">
            <div className="text-sm font-medium text-indigo-700 mb-1">
              Progress
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
              <div
                className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.round(
                    (course.completedWeeks / course.weeks) * 100
                  )}%`,
                }}
              />
            </div>
            <div className="text-sm text-gray-600">
              {Math.round((course.completedWeeks / course.weeks) * 100)}%
            </div>
          </div>

          <div className="hidden md:block border-l h-12 border-gray-300"></div>

          {/* Section 5: Completion Status */}
          <div className="px-4 flex flex-col items-center justify-center space-y-1">
            {course.completedWeeks === course.weeks ? (
              <div className="flex items-center space-x-3 text-green-600">
                <CheckCircleIcon className="w-7 h-7" />
                <span className="text-base font-semibold">
                  Course Completed
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-600">
                {course.weeks - course.completedWeeks} week
                {course.weeks - course.completedWeeks !== 1 && "s"} remaining
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
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
      </div>

      {/* Tab Content */}
      <div className="w-[calc(100%-260px)] mx-auto mb-6 z-10 relative border rounded-lg border-gray-200">
        {activeTab === "about" ? (
          <div className="bg-white p-6 rounded-lg shadow ">
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">
              About this Course
            </h2>
            <div className="text-gray-700 leading-relaxed">
              {course.description}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow ">
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">
              Course Modules
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              {course.modules.map((module, index) => (
                <li key={index}>{module}</li>
              ))}
            </ul>
            <div>
              <button
                className="group h-full text-left p-0 bg-transparent border-none mt-4"
                onClick={() => setOpenDialog(true)}
              >
                <div className="bg-indigo-600 rounded-md shadow overflow-hidden transition-transform transform group-hover:scale-105 duration-300 ease-in-out cursor-pointer">
                  <div className="py-2 px-4 text-center">
                    <h2 className="text-white font-semibold">
                      upload weekly material
                    </h2>
                  </div>
                </div>
              </button>

              <UploadWeekDialog
                isOpen={openDialog}
                onClose={() => setOpenDialog(false)}
                slug={slug}
                weeks={course.weeks}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
