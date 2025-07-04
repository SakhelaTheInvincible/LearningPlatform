"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import api from "@/src/lib/axios";
import LoadingComponent from "./UploadLoadingComponent";

interface UploadWeekDialogProps {
  isOpen: boolean;
  onClose: () => void;
  weeks: number;
  slug: string;
}

export default function UploadWeekDialog({
  isOpen,
  onClose,
  weeks,
  slug,
}: UploadWeekDialogProps) {
  const [isMaterialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [material, setMaterial] = useState<File | null>(null);
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialDescription, setMaterialDescription] = useState("");
  const [uploadedWeeks, setUploadedWeeks] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");
  const [isCodeGeneration, setIsCodeGeneration] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");

  function showTemporaryMessage(msg: string, duration = 1000) {
    setMessage(msg);
    setTimeout(() => setMessage(null), duration);
  }

  const openMaterialUpload = (weekNumber: number) => {
    setSelectedWeek(weekNumber);
    setMaterialDialogOpen(true);
  };

  const handleWeekUpload = async () => {
    if (!material || selectedWeek === null) return;

    const formData = new FormData();
    formData.append("week_number", `${selectedWeek}`);

    try {
      // First try to get the week to check if it exists
      try {
        await api.get(`/courses/${slug}/weeks/${selectedWeek}/`);
        // Week exists, update it
        await api.put(`/courses/${slug}/weeks/${selectedWeek}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (err) {
        // Week doesn't exist, create it
        await api.post(`/courses/${slug}/weeks/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
    } catch (err) {
      console.error("Error uploading material:", err);
    }
  };

  const handleMaterialUpload = async () => {
    setError("");
    if (!material || selectedWeek === null) return;

    const formData = new FormData();
    formData.append("material", material);
    formData.append("title", materialTitle);
    formData.append("description", materialDescription);

    try {
      setIsLoading(true);
      setLoadingMessage("Uploading material...");
      await api.post(
        `/courses/${slug}/weeks/${selectedWeek}/materials/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setLoadingMessage("Generating quiz questions...");
      await api.post(`/courses/${slug}/weeks/${selectedWeek}/questions/`);
      setLoadingMessage("Creating quizes...");
      await api.post(
        `/courses/${slug}/weeks/${selectedWeek}/quizzes/create_quizzes/`
      );

      if (isCodeGeneration) {
        try {
          setLoadingMessage("Generating coding challanges...");
          const response = await api.post(
            `/courses/${slug}/weeks/${selectedWeek}/codes/create_coding_problems/`,
            {}
          );
          const { problems, distribution } = response.data;

          console.log(`Generated ${problems.length} coding problems`);
          console.log("Difficulty distribution:", distribution);
        } catch (codeErr: any) {
          const errorMessage =
            codeErr?.response?.data?.error ||
            codeErr?.response?.data?.detail ||
            "Error generating coding problems";
          setError(errorMessage);
          return;
        }
      }

      setMaterialDialogOpen(false);
      setMaterial(null);
      setMaterialTitle("");
      setMaterialDescription("");
      setIsCodeGeneration(false);
      setUploadedWeeks((prev) => new Set(prev).add(selectedWeek));
      showTemporaryMessage("Material uploaded successfully");
      setIsLoading(false);
      setLoadingMessage("Loading...");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error uploading material.");
    }
  };

  const resetAndClose = () => {
    setUploadedWeeks(new Set());
    onClose();
  };

  return (
    <>
      {/* Message */}
      {message && (
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
          {message}
        </div>
      )}
      {/* Weeks Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={resetAndClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm"></div>
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    Upload Weekly Materials
                  </Dialog.Title>

                  <div className="mt-4 space-y-2">
                    {Array.from({ length: weeks }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span>Week {index + 1}</span>
                        <button
                          onClick={() => openMaterialUpload(index + 1)}
                          disabled={uploadedWeeks.has(index + 1)}
                          className={`rounded px-3 py-1 text-white w-[100px] ${
                            uploadedWeeks.has(index + 1)
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-indigo-500 hover:bg-indigo-400"
                          }`}
                        >
                          {uploadedWeeks.has(index + 1) ? "Uploaded" : "Upload"}
                        </button>
                      </div>
                    ))}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Material Upload Modal */}
      <Transition appear show={isMaterialDialogOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setMaterialDialogOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm"></div>
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                {isLoading ? (
                  // ⏳ Show loading spinner
                  <LoadingComponent message={loadingMessage} />
                ) : (
                  <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                    <Dialog.Title className="text-lg font-medium text-gray-900">
                      Upload Material for Week {selectedWeek}
                    </Dialog.Title>
                    <input
                      type="text"
                      placeholder="Material Title"
                      className="w-full mt-4 rounded border px-3 py-2"
                      value={materialTitle}
                      onChange={(e) => setMaterialTitle(e.target.value)}
                    />
                    <textarea
                      placeholder="Material Description"
                      className="w-full mt-4 mb-2 rounded border px-3 py-2"
                      value={materialDescription}
                      onChange={(e) => setMaterialDescription(e.target.value)}
                    />

                    <div className="mt-4 mb-4">
                      <label className="flex items-center space-x-2 text-md text-gray-700 mb-2">
                        <input
                          type="checkbox"
                          checked={isCodeGeneration}
                          onChange={(e) =>
                            setIsCodeGeneration(e.target.checked)
                          }
                          className="h-4 w-4 rounded border-gray-300 accent-indigo-600"
                        />
                        <span>Gernerate coding tasks?</span>
                      </label>
                    </div>

                    <label
                      htmlFor="material-upload"
                      className="cursor-pointer inline-block text-indigo-600 hover:underline"
                    >
                      Choose File
                    </label>

                    <input
                      id="material-upload"
                      type="file"
                      accept=".txt,.pdf,.doc,.docx"
                      onChange={(e) => setMaterial(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    {material && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {material.name}
                      </p>
                    )}
                    <div className="mt-6">
                      {error && (
                        <div className="text-red-600 text-sm mb-2">{error}</div>
                      )}
                      <button
                        onClick={async () => {
                          await handleWeekUpload();
                          await handleMaterialUpload();
                        }}
                        className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
                      >
                        Upload Material
                      </button>
                    </div>
                  </Dialog.Panel>
                )}
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
