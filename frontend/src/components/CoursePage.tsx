"use client";

import { useEffect, useState } from "react";
import Header from "@/src/components/Header";
import Breadcrumbs from "@/src/components/Breadcrumbs";
import Image from "next/image";
import Link from "next/link";
import { StarIcon, HandThumbUpIcon } from "@heroicons/react/24/solid";
import api from "@/src/lib/axios";
import { useRouter } from "next/navigation";
import UploadWeekDialog from "./WeekUploadDialog";
import LoadingPage from "./LoadingPage";

interface CourseInfo {
  title: string;
  image: string;
  description: string;
  weeks: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  estimatedTime: string;
  rating: number;
  likePercentage: number;
  slug: string;
  modules: string[];
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

        const transformed: CourseInfo = {
          title: data.title || "",
          image: data.image || "",
          description: data.description || "",
          weeks: data.duration_weeks || 0,
          difficulty: "Beginner", // You can replace this if your API provides difficulty
          estimatedTime: `${data.duration_weeks * 5 || 0} hours`,
          rating: 5,
          likePercentage: 95,
          slug,
          modules:
            data.weeks?.map(
              (week: any) =>
                `Week ${week.week_number}: ${
                  week.materials?.[0]?.title || "No title"
                }`
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

  // From here on: your original JSX with `course` available
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
                  // window.location.href = "courses";
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
      </div>
      <div className="w-[calc(100%-260px)] mx-auto mb-6 z-10 relative border rounded-lg border-gray-200">
        {/* About / Modules Content */}
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
