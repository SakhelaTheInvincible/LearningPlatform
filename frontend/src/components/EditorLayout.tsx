"use client";

import { useRef, useState, useEffect, JSX } from "react";
import LeetCodeEditor from "@/src/components/LeetCodeEditor";
import api from "@/src/lib/axios";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Code {
  difficulty_display: string;
  id: number;
  problem_statement: string;
  solution: string;
  template_code: string;
  user_code: string;
  user_score: number;
}

interface CodeEditorProps {
  task_id: string;
}

export default function EditorLayout() {
  const [leftWidth, setLeftWidth] = useState(45);
  const [activeTab, setActiveTab] = useState<"description" | "submissions">(
    "description"
  );
  const [templateCode, setTemplateCode] = useState("");
  const [activePanel, setActivePanel] = useState<
    "left" | "editor" | "output" | null
  >(null);
  const [codeData, setCodeData] = useState<{
    code: string;
    language: string;
    problem: Code | null;
  }>({
    code: "",
    language: "javascript",
    problem: null,
  });
  const [evaluation, setEvaluation] = useState<{
    user_score: number;
    hint: string;
  } | null>(null);
  const [userScore, setUserScore] = useState(0);
  const [language, setLanguage] = useState("javascript");

  const params = useParams();
  const slug = params?.slug as string;
  const weekNumber = parseInt(params?.weekNumber as string);
  const taskNumber = parseInt(params?.taskNumber as string);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const newLeftWidth = (e.clientX / containerWidth) * 100;
    if (newLeftWidth > 20 && newLeftWidth < 80) {
      setLeftWidth(newLeftWidth);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const parseTemplateCode = (template_code: string) => {
    const [langLine, ...codeLines] = template_code.split(/[\r\n\u21B5]+/);
    const language = langLine.trim().toLowerCase();
    const code = codeLines.join("\n");
    return { code, language };
  };

  function cleanProblemStatement(text: string) {
    // Strip markdown-like artifacts
    text = text.replace(/\*+/g, ""); // remove asterisks
    text = text.replace(/:\s*$/, ""); // remove trailing colon if present

    // Split lines, remove empty, trim all
    let lines = text
      .split(/\r?\n|\s{2,}/)
      .map((line) => line.trim())
      .filter(Boolean);

    // Remove the first line if it's "Problem Statement" or similar
    if (
      lines[0]?.toLowerCase().startsWith("problem statement") ||
      lines[0] === ":"
    ) {
      lines = lines.slice(1);
    }

    const result: React.ReactNode[] = [];
    let listItems: string[] = [];

    for (const line of lines) {
      if (/^\d+\.\s+/.test(line)) {
        // numbered list item
        listItems.push(line.replace(/^\d+\.\s+/, ""));
      } else {
        // flush list
        if (listItems.length > 0) {
          result.push(
            <ol
              className="list-decimal ml-6 mb-2 text-gray-300"
              key={Math.random()}
            >
              {listItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          );
          listItems = [];
        }
        result.push(
          <p key={Math.random()} className="mb-2">
            {line}
          </p>
        );
      }
    }

    // Final flush
    if (listItems.length > 0) {
      result.push(
        <ol
          className="list-decimal ml-6 mb-2 text-gray-300"
          key={Math.random()}
        >
          {listItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    }

    return <div className="space-y-2 text-sm text-gray-300">{result}</div>;
  }

  useEffect(() => {
    async function fetchCode() {
      try {
        const res1 = await api.get(`/courses/${slug}`);
        if (res1) {
          setLanguage(res1.data.language);
        }
        console.log(res1.data);

        const res = await api.get(
          `/courses/${slug}/weeks/${weekNumber}/codes/${taskNumber}`
        );
        const data = res.data;
        console.log(data);

        if (data) {
          const problem = data;
          const parsed = parseTemplateCode(problem.template_code);
          console.log(parsed);
          setTemplateCode(parsed.code);
          setCodeData({
            code: problem.user_code,
            language: parsed.language,
            problem,
          });
          setUserScore(problem.user_score);
        }
      } catch (error) {
        console.error("Failed to load coding challenges:", error);
      }
    }

    fetchCode();
  }, []);

  async function evaluateSolution({
    slug,
    weekNumber,
    id,
    problem_statement,
    solution,
    user_solution,
    programming_language,
  }: {
    slug: string;
    weekNumber: number;
    id: number;
    problem_statement: string;
    solution: string;
    user_solution: string;
    programming_language: string;
  }) {
    try {
      const res = await api.post(
        `/courses/${slug}/weeks/${weekNumber}/codes/${id}/evaluate_coding_solution/`,
        {
          problem_statement,
          solution,
          user_solution,
          programming_language,
        }
      );
      console.log("Evaluation Result:", res.data);
      await api.put(
        `/courses/${slug}/weeks/${weekNumber}/codes/${id}/set_user_score/`,
        {
          user_score: res.data.user_score,
        }
      );
      setEvaluation({
        user_score: res.data.user_score,
        hint: res.data.hint,
      });
      setUserScore(res.data.user_score);
    } catch (error) {
      console.error("Error evaluating code:", error);
      throw error;
    }
  }

  function parseProblemStatement(raw: string): JSX.Element {
    // 1. Clean the raw text
    let text = raw.trim();

    // Remove leading "Problem Statement", "*", "**", and ":".
    text = text.replace(/^Problem Statement\s*[:\*]*/i, "");
    text = text.replace(/\*+/g, ""); // Remove any stray asterisks

    // 2. Split into lines and clean each line
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // 3. Highlight inline content in `backticks` or 'single quotes'
    const formatLine = (line: string, index: number) => {
      const parts: React.ReactNode[] = [];

      let regex = /(`[^`]+`|'[^']+')/g;
      let lastIndex = 0;

      for (const match of line.matchAll(regex)) {
        const [token] = match;
        const matchStart = match.index ?? 0;

        // Add normal text before match
        if (matchStart > lastIndex) {
          parts.push(line.slice(lastIndex, matchStart));
        }

        // Add formatted token
        parts.push(
          <code
            key={index + "-" + matchStart}
            className="text-indigo-400 font-mono"
          >
            {token.slice(1, -1)}
          </code>
        );

        lastIndex = matchStart + token.length;
      }

      // Add remaining text
      if (lastIndex < line.length) {
        parts.push(line.slice(lastIndex));
      }

      return (
        <p key={index} className="mb-2 text-gray-300 text-sm">
          {parts}
        </p>
      );
    };

    return <div className="space-y-1">{lines.map(formatLine)}</div>;
  }

  return (
    <div
      ref={containerRef}
      className="flex w-full h-screen bg-black overflow-hidden"
    >
      {/* Left Panel: Problem */}
      <div
        style={{ width: `${leftWidth}%`, minWidth: "20%" }}
        className={`bg-[#1e1e1e] p-4 text-white rounded-lg overflow-auto flex flex-col border mt-2 mb-2 ${
          activePanel === "left" ? "border-gray-600" : "border-transparent"
        }`}
        onClick={() => setActivePanel("left")}
      >
        {/* Tabs */}
        <div className="flex flex-row justify-between border-b border-gray-700 mb-4">
          <div className="flex space-x-4">
            <button
              className={`py-2 text-sm font-medium ${
                activeTab === "description"
                  ? "border-b-2 border-indigo-500 text-indigo-400"
                  : "text-gray-400"
              }`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`py-2 text-sm font-medium ${
                activeTab === "submissions"
                  ? "border-b-2 border-indigo-500 text-indigo-400"
                  : "text-gray-400"
              }`}
              onClick={() => setActiveTab("submissions")}
            >
              Submissions
            </button>
          </div>
          <div className="flex">
            <Link
              href={`/courses/${slug}/week/${weekNumber}/coding`}
              title="Go back to coding tasks"
              className="py-2 text-sm font-medium hover:text-indigo-500 text-gray-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.49 12 3.74 8.248m0 0 3.75-3.75m-3.75 3.75h16.5V19.5"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "description" ? (
          <div className="text-sm text-gray-300 space-y-2">
            {/* <h1 className="text-lg font-bold text-white">
              {codeData.problem?.id}. {codeData.problem?.difficulty_display}
            </h1> */}
            {codeData.problem?.problem_statement && (
              <>
                <h1 className="text-lg font-bold text-white">
                  Problem Statement
                </h1>
                {parseProblemStatement(codeData.problem.problem_statement)}
              </>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-300">
            <h2 className="text-lg font-semibold mb-2 text-white">
              Your Score
            </h2>
            {codeData.problem?.user_score !== null ? (
              <div className="bg-gray-800 p-4 rounded text-white">
                ✅ You scored{" "}
                <span className="font-bold text-indigo-400">{userScore}%</span>{" "}
                on this challenge.
              </div>
            ) : (
              <div className="bg-gray-800 p-4 rounded text-gray-400">
                ❌ You haven’t submitted this challenge yet.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div
        onMouseDown={handleMouseDown}
        className="w-2 bg-black text-white flex items-center justify-center cursor-col-resize select-none"
      >
        <span className="text-sm opacity-50">|</span>
      </div>

      {/* Right Panel: Editor and Output */}
      <div className="flex flex-col flex-1 space-y-2 pr-2 py-2 overflow-hidden">
        {/* Code Editor */}
        <div
          className={`flex-1 rounded-lg overflow-hidden border ${
            activePanel === "editor" ? "border-gray-600" : "border-transparent"
          }`}
          onClick={() => setActivePanel("editor")}
        >
          {codeData.code ? (
            <LeetCodeEditor
              slug={slug}
              weekNumber={weekNumber}
              id={codeData.problem?.id}
              defaultCode={codeData.code}
              templateCode={templateCode}
              onSubmit={(code, language) => {
                console.log("Submitted:", { code, language });
              }}
              problem_statement={codeData.problem?.problem_statement}
              solution={codeData.problem?.solution}
              onEvaluate={evaluateSolution}
              language={language}
            />
          ) : (
            <div className="text-white p-4">Loading editor...</div>
          )}
        </div>

        {/* Output Panel */}
        <div
          className={`bg-[#1e1e1e] text-white rounded-lg p-4 text-sm border ${
            activePanel === "output" ? "border-gray-600" : "border-transparent"
          }`}
          onClick={() => setActivePanel("output")}
        >
          <div className="">
            <div className="flex items-center gap-2 mb-2">
              <div className="">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 text-indigo-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-gray-200">Output:</h2>
            </div>
          </div>

          {evaluation ? (
            <div
              className={`
      bg-gray-900 rounded p-2 font-mono text-sm space-y-1
      ${
        Number(userScore) === 100
          ? "text-green-400"
          : Number(userScore) >= 60
          ? "text-yellow-400"
          : "text-red-400"
      }
    `}
            >
              <div className="font-semibold">
                {Number(userScore) === 100 ? "✅ " : ""}
                You just scored{" "}
                <span className="font-bold text-indigo-400">
                  {userScore}%
                </span>{" "}
                on this run.
              </div>
              <div>{evaluation.hint}</div>
            </div>
          ) : (
            <div className="bg-gray-900 rounded p-2 text-yellow-400 font-mono text-sm">
              💡 Run your code to see feedback and score here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
