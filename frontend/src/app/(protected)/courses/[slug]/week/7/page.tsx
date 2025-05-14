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
                  weekTitle="Week 2: Data Structures"
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
                  weekNumber={2}
                  description="The basis of our approach for analyzing the performance of algorithms is the scientific method. We begin by performing computational experiments to measure the running times of our programs. We use these measurements to develop hypotheses about performance. Next, we create mathematical models to explain their behavior. Finally, we consider analyzing the memory usage of our Java programs.
Learning Objectives
Define tilde and order-of-growth notations.
Determine the order of growth of the running time of a program as a function of the input size.
Formulate a hypothesis for the running time of a program as a function of the input size by performing computational experiments.
Calculate the amount of memory that a Java program uses a function of the input size.
Describe the binary search algorithm.
Analyze the running time of binary search."
                />
              </div>
              {/* <h2 className="text-3xl font-semibold text-indigo-600 mb-4">
                Week 1: Task
              </h2>
              <p className="text-gray-700 mb-8">
                Welcome to Week 1! This week you &apos;ll learn about variables,
                data types, and basic control flow in JavaScript.
              </p> */}

              {/* <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Code Editor
                </h3>
                <CodeEditor language="javascript" defaultValue={initialCode} />
              </div> */}

              {/* <button
                onClick={handleRunCode}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md"
              >
                Run Code
              </button> */}

              {/* {error && (
                <div className="mt-6 text-red-600">
                  <h3 className="font-semibold">Error:</h3>
                  <pre>{error}</pre>
                </div>
              )} */}

              {/* <div className="mt-6">
                <h3 className="font-semibold text-gray-800">Output:</h3>
                <pre className="bg-gray-100 p-4 rounded-md">{output}</pre>
              </div> */}
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
