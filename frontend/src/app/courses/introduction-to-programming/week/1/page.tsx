"use client";
import Header from "@/src/components/Header";
import SidebarDropdown from "@/src/components/SidebarDropdown";
import WeekDropdown from "@/src/components/WeekDropdown";
import Image from "next/image";
import Timeline from "@/src/components/TimeLine";

const course = {
  id: 1,
  title: "Introduction to Programming",
  courseName: "introduction-to-programming",
  description: "Build a strong foundation in programming using Java.",
  level: "Beginner",
  image: "/courses/programming.jpg",
};

export default function Week1Learning() {
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
                <div className="mt-8 mb-8">{course.courseName}</div>
              </div>
              <SidebarDropdown />
            </div>
            <div className="flex-1 ml-6 mt-[20px]">
              <div className="space-y-4">
                <WeekDropdown
                  weekTitle="Week 1: Introduction to Programming"
                  parts={[
                    {
                      name: "Reading Material",
                      type: "reading",
                      slug: "data-structures-reading",
                      description: "Reading - 5 min",
                      completed: false,
                    },
                    {
                      name: "Practice Questions",
                      type: "questions",
                      slug: "data-structures-questions",
                      description: "quiz - 3 min",
                      completed: false,
                    },
                    {
                      name: "Coding Exercise 1",
                      type: "coding",
                      slug: "data-structures-coding",
                      description: "Practical Assesment - 30 min",
                      completed: false,
                    },
                  ]}
                  weekNumber={1}
                  description="Welcome to Algorithms, Part I."
                />
              </div>
            </div>
            <div className="ml-10 bg-gray-50">
              <Timeline startDate="2025-01-01" weeks={3} timePerWeek={7} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
