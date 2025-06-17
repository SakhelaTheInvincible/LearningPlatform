"use client";
import { useEffect, useState } from "react";
import CodeEditor from "@/src/components/CodeEditor";
import Header from "@/src/components/Header";
import WeekMenu from "@/src/components/weekMenu";
import Breadcrumbs from "@/src/components/Breadcrumbs";
import LeetCodeEditor from "@/src/components/LeetCodeEditor";
import EditorLayout from "@/src/components/EditorLayout";
import api from "@/src/lib/axios";
import { useParams } from "next/navigation";
import CodingTaskCard from "@/src/components/CodingTaskCard";

interface Code {
  difficulty_display: string;
  id: number;
  problem_statement: string;
  solution: string;
  template_code: string;
  user_code: string;
  user_score: number;
}

export default function Week1Coding() {
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [codeTasks, setCodeTasks] = useState<Code[]>([]);

  const params = useParams();
  const slug = params?.slug as string;
  const weekNumber = parseInt(params?.weekNumber as string);

  const initialCode = `// Write your code here
console.log('Hello, World!');`;

  const handleRunCode = () => {
    try {
      // Use eval to run JavaScript code (be cautious with eval)
      // eval can return a value, so handle that and set it to output
      const result: unknown = eval(initialCode); // eval returns unknown, so we cast it
      if (result !== undefined) {
        setOutput(String(result)); // If there is a result, convert it to string
      } else {
        setOutput("Code executed successfully but no return value.");
      }
      setError(null); // Clear any previous errors
    } catch (err) {
      // Handle errors, type the error as a generic Error type
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      setOutput(""); // Clear output when there is an error
    }
  };

  useEffect(() => {
    async function fetchCode() {
      try {
        const res = await api.get(
          `/courses/${slug}/weeks/${weekNumber}/codes/`
        );
        const data = res.data;
        console.log(data);

        if (data.length > 0) {
          setCodeTasks(data);
        }
      } catch (error) {
        console.error("Failed to load coding challenges:", error);
      }
    }

    fetchCode();
  }, []);

  return (
    <>
      <div className="flex flex-col">
        <Header />
        <div className="flex flex-row justify-start mt-16 bg-white ">
          <WeekMenu
            parts={[
              {
                name: "Reading Material",
                type: "reading",
                slug: "reading",
                description: "Reading - 5 min",
                completed: false,
              },
              {
                name: "Practice Questions",
                type: "questions",
                slug: "questions",
                description: "quiz - 3 min",
                completed: false,
              },
              {
                name: "Coding Exercise 1",
                type: "coding",
                slug: "coding",
                description: "Practical Assesment - 30 min",
                completed: false,
              },
            ]}
          />
          <div className="flex flex-row justify-start ml-8 mt-8">
            <div className="flex flex-col justify-start">
              <Breadcrumbs />
              <div className="px-[150px] py-[80px]">
                <div className=""></div>
                <h2 className="text-3xl font-semibold text-indigo-600 mb-4">
                  Week {weekNumber}: Coding Challenge
                </h2>
                <p className="text-gray-700 mb-8">
                  Each week’s coding challenge is carefully crafted from the
                  material you've just studied. These tasks are designed to help
                  you apply what you’ve learned in a practical way, reinforce
                  your understanding, and build confidence in solving real-world
                  programming problems.
                </p>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Coding Tasks
                  </h3>
                  {/* <CodeEditor
                    language="javascript"
                    defaultValue={initialCode}
                  /> */}
                  {/* <LeetCodeEditor
                    onSubmit={function (code: string): void {
                      throw new Error("Function not implemented.");
                    }}
                  /> */}
                  <div className="space-y-4">
                    {codeTasks.map((task, index) => (
                      <CodingTaskCard
                        key={task.id}
                        taskNumber={index + 1}
                        taskId={task.id}
                        description={task.problem_statement}
                        difficulty={task.difficulty_display}
                        userScore={task.user_score}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
