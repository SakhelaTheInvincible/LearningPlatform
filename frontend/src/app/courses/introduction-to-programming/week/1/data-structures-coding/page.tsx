"use client";
import { useState } from "react";
import CodeEditor from "@/src/components/CodeEditor";
import Header from "@/src/components/Header";
import WeekMenu from "@/src/components/weekMenu";
import Breadcrumbs from "@/src/components/Breadcrumbs";

export default function Week1Coding() {
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

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
          />
          <div className="flex flex-row justify-start ml-8 mt-8">
            <div className="flex flex-col justify-start">
              <Breadcrumbs />
              <div className="px-[150px] py-[80px]">
                <div className=""></div>
                <h2 className="text-3xl font-semibold text-indigo-600 mb-4">
                  Week 1: Task
                </h2>
                <p className="text-gray-700 mb-8">
                  Welcome to Week 1! This week you &apos;ll learn about
                  variables, data types, and basic control flow in JavaScript.
                </p>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Code Editor
                  </h3>
                  <CodeEditor
                    language="javascript"
                    defaultValue={initialCode}
                  />
                </div>

                <button
                  onClick={handleRunCode}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md"
                >
                  Run Code
                </button>

                {/* Show error if there is one */}
                {error && (
                  <div className="mt-6 text-red-600">
                    <h3 className="font-semibold">Error:</h3>
                    <pre>{error}</pre>
                  </div>
                )}

                {/* Show output */}
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-800">Output:</h3>
                  <pre className="bg-gray-100 p-4 rounded-md">{output}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
