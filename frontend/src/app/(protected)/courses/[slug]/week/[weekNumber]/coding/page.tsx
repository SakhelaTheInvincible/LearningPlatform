"use client";
import { useEffect, useRef, useState } from "react";
import CodeEditor from "@/src/components/CodeEditor";
import Header from "@/src/components/Header";
import WeekMenu, { WeekMenuHandle } from "@/src/components/weekMenu";
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
interface Part {
  name: string;
  type: "reading" | "questions" | "coding" | "complete";
  slug: string;
  description: string;
  completed: boolean;
}

export default function Week1Coding() {
  const [completedCoding, setCompletedCoding] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [codeTasks, setCodeTasks] = useState<Code[]>([]);
  const menuRef = useRef<WeekMenuHandle>(null);

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
    async function fetchSidebar() {
      try {
        const res = await api.get(
          `/courses/${slug}/weeks/${weekNumber}/get_completion/`
        );
        const data = res.data;
        console.log(data);
        const res1 = await api.get(
          `/courses/${slug}/weeks/${weekNumber}/codes/`
        );
        const data1 = res1.data;
        if (data1.length != 0) {
          setParts([
            {
              name: "Reading Material",
              type: "reading",
              slug: "reading",
              description: `Learning material`,
              completed: data.material_read,
            },
            {
              name: "Quiz questions",
              type: "questions",
              slug: "questions",
              description: "Answer quiz questions",
              completed: data.quiz_completed,
            },
            {
              name: "Coding Tasks",
              type: "coding",
              slug: "coding",
              description: "Complete coding challanges",
              completed: data.code_completed,
            },
            {
              name: "Complete Tasks",
              type: "complete",
              slug: "complete",
              description: "Finish this weeks materials",
              completed:
                data.material_read &&
                data.quiz_completed &&
                data.code_completed,
            },
          ]);
        } else {
          setParts([
            {
              name: "Reading Material",
              type: "reading",
              slug: "reading",
              description: `Learning material`,
              completed: data.material_read,
            },
            {
              name: "Quiz questions",
              type: "questions",
              slug: "questions",
              description: "Answer quiz questions",
              completed: data.quiz_completed,
            },
            {
              name: "Complete Tasks",
              type: "complete",
              slug: "complete",
              description: "Finish this weeks materials",
              completed: data.material_read && data.quiz_completed,
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to load sidebar:", error);
      }
    }
    fetchSidebar();
  }, []);

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
          <WeekMenu ref={menuRef} parts={parts} />
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
                  <button
                    className="hover:bg-indigo-500 bg-indigo-600 text-white p-2 rounded hover:cursor-pointer"
                    onClick={() => {
                      menuRef.current?.goToNextPart();
                    }}
                  >
                    Complete coding challanges
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
