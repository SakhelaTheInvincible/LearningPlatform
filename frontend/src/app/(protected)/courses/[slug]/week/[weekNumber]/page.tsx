"use client";
import Header from "@/src/components/Header";
import SidebarDropdown from "@/src/components/SidebarDropdown";
import WeekDropdown from "@/src/components/WeekDropdown";
import Image from "next/image";
import Timeline from "@/src/components/TimeLine";
import { useEffect, useState } from "react";
import api from "@/src/lib/axios";
import { use } from "react";
import { useParams } from "next/navigation";

interface CourseInfo {
  title: string;
  description: string;
  image: string;
  duration_weeks: number;
  weeks: Weeks[];
  modules: string[];
  parts: Part[];
}
interface Weeks {
  week_number: number;
  materials: Material[];
}
interface Material {
  title: string;
}
interface Part {
  name: string;
  type: "reading" | "questions" | "coding";
  slug: string;
  description: string;
  completed: boolean;
  //   name: "Reading Material";
  //   type: "reading";
  //   slug: "data-structures-reading";
  //   description: "Reading - 5 min";
  //   completed: false;
}

export default function WeekLearning() {
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const slug = params?.slug as string;
  const weekNumber = parseInt(params?.weekNumber as string);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await api.get(`/courses/${slug}`);
        const data = res.data;

        const week = data.weeks?.find((w: any) => w.week_number === weekNumber);

        const parts: Part[] =
          week?.materials?.map((material: any, index: number) => ({
            name: material.title || `Part ${index + 1}`,
            type: "reading", // You can customize this if your material has a type
            slug: material.slug || `reading`,
            description: `Part ${index + 1} - 5 min`,
            completed: false,
          })) || [];

        const transformed: CourseInfo = {
          title: data.title || "",
          image: data.image || "",
          description: data.description || "",
          duration_weeks: data.duration_weeks || 0,
          weeks: data.weeks || [],
          modules: data.weeks?.map((week: any) => `Week ${week.week_number}`),
          parts,
        };

        setCourse(transformed);
      } catch (error) {
        console.error("Failed to load course:", error);
      } finally {
        setLoading(false);
      }
    }

    if (slug && weekNumber) fetchCourse();
  }, [slug, weekNumber]);

  if (loading) return <div className="p-10">Loading course...</div>;
  if (!course) return <div className="p-10">Course not found.</div>;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-row justify-between">
            <div className="">
              <div className="">
                <div className="mb-8">
                  <Image
                    src={course.image}
                    alt={course.title}
                    width={120}
                    height={120}
                    className="max-h-[120px] w-auto rounded"
                  />
                </div>
                <div className="mt-8 mb-8">{course.title}</div>
              </div>
              <SidebarDropdown duration_weeks={course.duration_weeks} />
            </div>
            <div className="flex-1 ml-6 mt-[20px]">
              <div className="space-y-4">
                <WeekDropdown
                  weekTitle={`Week ${weekNumber}: ${
                    course.parts[0]?.name || "Materials"
                  }`}
                  parts={course.parts}
                  weekNumber={weekNumber}
                  description={`Week ${weekNumber} learning materials`}
                />
              </div>
            </div>
            <div className="ml-10 bg-gray-50">
              <Timeline
                startDate="2025-01-01"
                weeks={course.duration_weeks}
                timePerWeek={7}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
