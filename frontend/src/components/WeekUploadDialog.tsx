"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaUpload, FaCheck, FaSpinner } from "react-icons/fa";
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
  const [checkingWeeks, setCheckingWeeks] = useState(false);

  function showTemporaryMessage(msg: string, duration = 1000) {
    setMessage(msg);
    setTimeout(() => setMessage(null), duration);
  }

  // Check which weeks already have any content (materials, questions, coding challenges, quizzes)
  const checkExistingMaterials = async () => {
    setCheckingWeeks(true);
    try {
      const existingWeeks = new Set<number>();
      
      // Check each week for any existing content
      for (let i = 1; i <= weeks; i++) {
        let hasContent = false;
        
        // Check for materials
        try {
          const materialsResponse = await api.get(`/courses/${slug}/weeks/${i}/materials/`);
          if (materialsResponse.data && materialsResponse.data.length > 0) {
            hasContent = true;
          }
        } catch (err) {
          // No materials, continue checking other content types
        }
        
        // Check for questions
        if (!hasContent) {
          try {
            const questionsResponse = await api.get(`/courses/${slug}/weeks/${i}/questions/`);
            if (questionsResponse.data && questionsResponse.data.length > 0) {
              hasContent = true;
            }
          } catch (err) {
            // No questions, continue checking
          }
        }
        
        // Check for coding challenges
        if (!hasContent) {
          try {
            const codesResponse = await api.get(`/courses/${slug}/weeks/${i}/codes/`);
            if (codesResponse.data && codesResponse.data.length > 0) {
              hasContent = true;
            }
          } catch (err) {
            // No coding challenges, continue checking
          }
        }
        
        // Check for quizzes
        if (!hasContent) {
          try {
            const quizzesResponse = await api.get(`/courses/${slug}/weeks/${i}/quizzes/`);
            if (quizzesResponse.data && quizzesResponse.data.length > 0) {
              hasContent = true;
            }
          } catch (err) {
            // No quizzes
          }
        }
        
        if (hasContent) {
          existingWeeks.add(i);
        }
      }
      
      setUploadedWeeks(existingWeeks);
    } catch (err) {
      console.error("Error checking existing content:", err);
    } finally {
      setCheckingWeeks(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkExistingMaterials();
    }
  }, [isOpen, slug, weeks]);

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
                <Dialog.Panel className="w-full max-w-md rounded-3xl bg-white/90 backdrop-blur-md p-6 shadow-2xl border border-white/20">
                  <Dialog.Title className="text-2xl font-bold text-gray-900 mb-6">
                    Upload Weekly Materials
                  </Dialog.Title>

                  {checkingWeeks ? (
                    <div className="flex items-center justify-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <FaSpinner className="text-2xl text-indigo-500" />
                      </motion.div>
                      <span className="ml-3 text-gray-600">Checking existing content...</span>
                    </div>
                  ) : (
                    <>
                      {/* Filter to only show weeks without any content (materials, questions, coding challenges, quizzes) */}
                      {(() => {
                        const weeksWithoutContent = Array.from({ length: weeks })
                          .map((_, index) => index + 1)
                          .filter(weekNum => !uploadedWeeks.has(weekNum));

                        if (weeksWithoutContent.length === 0) {
                          return (
                            <div className="text-center py-8">
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="bg-green-50 rounded-2xl p-6 border border-green-200"
                              >
                                <FaCheck className="text-3xl text-green-600 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-green-800 mb-2">
                                  All Content Created!
                                </h3>
                                <p className="text-green-600">
                                  All {weeks} weeks have content uploaded successfully.
                                </p>
                              </motion.div>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-3">
                            <div className="text-sm text-gray-600 mb-4">
                              Showing {weeksWithoutContent.length} of {weeks} weeks that need content
                            </div>
                            {weeksWithoutContent.map((weekNum, displayIndex) => (
                              <motion.div
                                key={weekNum}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: displayIndex * 0.1 }}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-600">
                                    <span className="text-sm font-semibold">{weekNum}</span>
                                  </div>
                                  <span className="font-medium text-gray-800">Week {weekNum}</span>
                                </div>
                                
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => openMaterialUpload(weekNum)}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
                                >
                                  <FaUpload className="text-sm" />
                                  <span>Upload</span>
                                </motion.button>
                              </motion.div>
                            ))}
                          </div>
                        );
                      })()}
                    </>
                  )}
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
                  <Dialog.Panel className="w-full max-w-md rounded-3xl bg-white/90 backdrop-blur-md p-8 shadow-2xl border border-white/20">
                    <Dialog.Title className="text-2xl font-bold text-gray-900 mb-6 text-center">
                      Upload Material for Week {selectedWeek}
                    </Dialog.Title>
                    
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Material Title
                        </label>
                        <input
                          type="text"
                          placeholder="Enter material title..."
                          className="w-full rounded-xl border-0 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 placeholder-gray-500 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 transition-all duration-200"
                          value={materialTitle}
                          onChange={(e) => setMaterialTitle(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Material Description
                        </label>
                        <textarea
                          placeholder="Enter material description..."
                          rows={3}
                          className="w-full rounded-xl border-0 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 placeholder-gray-500 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 transition-all duration-200 resize-none"
                          value={materialDescription}
                          onChange={(e) => setMaterialDescription(e.target.value)}
                        />
                      </div>

                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isCodeGeneration}
                            onChange={(e) => setIsCodeGeneration(e.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Generate coding tasks automatically
                          </span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload File
                        </label>
                        <div className="relative">
                          <label
                            htmlFor="material-upload"
                            className="cursor-pointer flex items-center justify-center w-full rounded-xl border-2 border-dashed border-gray-300 bg-white/50 backdrop-blur-sm p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-200"
                          >
                            <div className="space-y-2">
                              <FaUpload className="mx-auto text-2xl text-gray-400" />
                              <div className="text-sm text-gray-600">
                                <span className="font-medium text-indigo-600">Choose a file</span> or drag and drop
                              </div>
                              <p className="text-xs text-gray-500">
                                PDF, DOC, DOCX, TXT up to 10MB
                              </p>
                            </div>
                          </label>
                          <input
                            id="material-upload"
                            type="file"
                            accept=".txt,.pdf,.doc,.docx"
                            onChange={(e) => setMaterial(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </div>
                        {material && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200"
                          >
                            <FaCheck className="text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                              {material.name}
                            </span>
                          </motion.div>
                        )}
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-red-50 rounded-lg border border-red-200"
                        >
                          <div className="text-red-600 text-sm font-medium">{error}</div>
                        </motion.div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => setMaterialDialogOpen(false)}
                          className="flex-1 rounded-xl bg-gray-200 px-4 py-3 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={async () => {
                            await handleWeekUpload();
                            await handleMaterialUpload();
                          }}
                          disabled={!material || !materialTitle}
                          className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 text-white font-medium hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          Upload Material
                        </motion.button>
                      </div>
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
