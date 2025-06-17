"use client";

import { useState, Fragment, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Dialog, Transition, Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import api from "../lib/axios";

const languages = [
  { name: "JavaScript", value: "javascript" },
  { name: "Python", value: "python" },
  { name: "C++", value: "cpp" },
  { name: "Java", value: "java" },
];

export default function LeetCodeEditor({
  defaultCode = "// Write your code here",
  onSubmit,
  slug,
  weekNumber,
  id,
  templateCode,
  problem_statement,
  solution,
  onEvaluate,
}: {
  defaultCode?: string;
  onSubmit: (code: string, language: string) => void;
  slug: string;
  weekNumber: number;
  id: number | undefined;
  templateCode: string;
  problem_statement: string | undefined;
  solution: string | undefined;
  onEvaluate: (args: {
    slug: string;
    weekNumber: number;
    id: number;
    problem_statement: string;
    solution: string;
    user_solution: string;
    programming_language: string;
  }) => void;
}) {
  const [code, setCode] = useState(defaultCode);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const codeRef = useRef(code);

  // const handleRun = async () => {
  //   setIsLoading(true);
  //   try {
  //     await onSubmit(code, selectedLanguage.value);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleRun = async () => {
    setIsLoading(true);
    try {
      await onEvaluate({
        slug,
        weekNumber,
        id: id!,
        problem_statement: problem_statement!,
        solution: solution!,
        user_solution: codeRef.current,
        programming_language: selectedLanguage.value,
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function handleSaveCode() {
    try {
      const payload = { user_code: codeRef.current };

      console.log("Saving:", codeRef.current);

      await api.put(
        `/courses/${slug}/weeks/${weekNumber}/codes/${id}/set_user_code/`,
        payload
      );

      console.log("Code saved successfully");

      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 1000);
    } catch (error) {
      console.error("Failed to save code:", error);
    }
  }
  async function handleRefreshCode() {
    try {
      const payload = { user_code: templateCode };

      // Save to backend
      await api.put(
        `/courses/${slug}/weeks/${weekNumber}/codes/${id}/set_user_code/`,
        payload
      );

      // Update editor UI and ref
      setCode(templateCode);
      codeRef.current = templateCode;

      console.log("Code refreshed and saved successfully");
    } catch (error) {
      console.error("Failed to refresh code:", error);
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (id !== undefined) {
          handleSaveCode();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-[85vh] w-full bg-[#1e1e1e] text-white rounded-lg overflow-hidden shadow-lg">
      {showSavedMessage && (
        <div className="flex flex-row fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#252526] text-sm text-white px-6 py-2 rounded-lg border border-gray-700 shadow-md animate-fade-in-out">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5 mr-2 text-green-600"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
              clipRule="evenodd"
            />
          </svg>
          Your code is saved
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#252526] border-b border-gray-700">
        <div className="flex items-center gap-2">
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
                d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
              />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-gray-200">Code</h2>
        </div>
        <button
          onClick={handleRun}
          className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded text-sm font-medium disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Running..." : "Run"}
        </button>
      </div>

      {/* Language Selector */}
      <div className="flex flex-row justify-between px-4 py-2 bg-[#1e1e1e] border-b border-gray-700">
        <Listbox value={selectedLanguage} onChange={setSelectedLanguage}>
          <div className="relative mt-1 w-48">
            <Listbox.Button className="relative w-full cursor-default rounded bg-gray-800 py-2 pl-3 pr-10 text-left text-white shadow-md text-sm border border-gray-600">
              <span className="block truncate">{selectedLanguage.name}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded bg-gray-800 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-600">
                {languages.map((lang, index) => (
                  <Listbox.Option
                    key={index}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? "bg-gray-700 text-white" : "text-gray-300"
                      }`
                    }
                    value={lang}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {lang.name}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-400">
                            <CheckIcon className="h-4 w-4" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
        <div className="mt-2">
          <button className="cursor-pointer" onClick={handleRefreshCode}>
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
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={selectedLanguage.value}
          value={code}
          theme="vs-dark"
          onChange={(value) => {
            setCode(value || "");
            codeRef.current = value || "";
          }}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
          }}
        />
      </div>
    </div>
  );
}
