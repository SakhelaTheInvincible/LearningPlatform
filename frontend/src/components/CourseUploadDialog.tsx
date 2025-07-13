"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { motion } from "framer-motion";
import { FaUpload, FaCheck, FaSpinner, FaCode, FaGraduationCap, FaImage } from "react-icons/fa";
import api from "@/src/lib/axios";
import LoadingComponent from "./UploadLoadingComponent";

interface UploadCourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadCourseDialog({
  isOpen,
  onClose,
}: UploadCourseDialogProps) {
  const [isWeeksDialogOpen, setWeeksDialogOpen] = useState(false);
  const [isMaterialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [weeks, setWeeks] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(1);
  const [image, setImage] = useState<File | null>(null);
  const [isProgrammingCourse, setIsProgrammingCourse] = useState(false);
  const [programmingLanguage, setProgrammingLanguage] = useState("");
  const [material, setMaterial] = useState<File | null>(null);
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialDescription, setMaterialDescription] = useState("");
  const [isCodeGeneration, setIsCodeGeneration] = useState(false);
  const [uploadedWeeks, setUploadedWeeks] = useState<Set<number>>(new Set());
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");

  function showTemporaryMessage(msg: string, duration = 1000) {
    setMessage(msg);
    setTimeout(() => setMessage(null), duration);
  }



  const handleCourseUpload = async () => {
    const formData = new FormData();
    formData.append("title", courseTitle);
    formData.append("duration_weeks", duration.toString());
    formData.append("description", description);
    if (image) formData.append("image", image);
    if (isProgrammingCourse) {
      formData.append("language", programmingLanguage);
    }

    setError("");
    try {
      const res = await api.post("/courses/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setWeeks(duration);
      setWeeksDialogOpen(true);
      setSlug(res.data.title_slug);
      showTemporaryMessage("Course created successfully");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error uploading course.");
    }
  };

  const openMaterialUpload = (weekNumber: number) => {
    setSelectedWeek(weekNumber);
    setMaterialDialogOpen(true);
  };

  const handleWeekUpload = async () => {
    setError("");
    if (!material || selectedWeek === null) return;

    const formData = new FormData();
    formData.append("week_number", `${selectedWeek}`);

    try {
      await api.post(`/courses/${slug}/weeks/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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

      // Start both question generation and code generation in parallel
      setLoadingMessage("Generating quiz questions and coding challenges...");
      
      // Create promises for both operations
      const questionsPromise = api.post(`/courses/${slug}/weeks/${selectedWeek}/questions/`);
      const codePromise = isCodeGeneration 
        ? api.post(`/courses/${slug}/weeks/${selectedWeek}/codes/create_coding_problems/`, {})
        : Promise.resolve(null);

      // Wait for question generation to complete (but code generation continues in background)
      await questionsPromise;
      
      // Now start quiz creation while code generation might still be running
      setLoadingMessage("Creating quizzes...");
      const quizPromise = api.post(
        `/courses/${slug}/weeks/${selectedWeek}/quizzes/create_quizzes/`
      );

      // Wait for both quiz creation and code generation to complete
      const [quizResponse, codeResponse] = await Promise.all([
        quizPromise,
        codePromise
      ]);

      // Process code generation results if it was enabled
      if (isCodeGeneration && codeResponse) {
        const { problems, distribution } = codeResponse.data;
        console.log(`Generated ${problems.length} coding problems`);
        console.log("Difficulty distribution:", distribution);
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
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    setCourseTitle("");
    setDescription("");
    setWeeks(0);
    setDuration(1);
    setImage(null);
    setIsProgrammingCourse(false);
    setProgrammingLanguage("");
    setUploadedWeeks(new Set());
    setWeeksDialogOpen(false);
    setError("");
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

      {/* Course Dialog */}
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
              <div className="w-full max-w-lg my-8">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-h-[80vh] overflow-y-auto scrollbar-hide rounded-3xl bg-white/90 backdrop-blur-md p-6 pb-12 shadow-2xl border border-white/20">
                  <div className="text-center mb-4">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 mb-3"
                    >
                      <FaGraduationCap className="text-xl text-white" />
                    </motion.div>
                    <Dialog.Title className="text-xl font-bold text-gray-900">
                      Create New Course
                    </Dialog.Title>
                    <p className="text-gray-600 text-sm mt-1">Build your learning experience</p>
                  </div>

                  <div className="space-y-4">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 rounded-lg border border-red-200"
                      >
                        <div className="text-red-600 text-sm font-medium">{error}</div>
                      </motion.div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Title
                      </label>
                      <input
                        type="text"
                        placeholder="Enter course title..."
                        className="w-full rounded-xl border-0 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 placeholder-gray-500 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 transition-all duration-200"
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        placeholder="Enter course description..."
                        rows={3}
                        className="w-full rounded-xl border-0 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 placeholder-gray-500 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 transition-all duration-200 resize-none"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (weeks)
                      </label>
                      <input
                        type="number"
                        min={1}
                        placeholder="Enter duration in weeks..."
                        className="w-full rounded-xl border-0 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 placeholder-gray-500 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 transition-all duration-200"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Image
                      </label>
                      <div className="relative">
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer flex items-center justify-center w-full rounded-xl border-2 border-dashed border-gray-300 bg-white/50 backdrop-blur-sm p-4 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-200"
                        >
                          <div className="space-y-1">
                            <FaImage className="mx-auto text-xl text-gray-400" />
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-indigo-600">Choose an image</span>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        </label>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setImage(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </div>
                      {image && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200"
                        >
                          <FaCheck className="text-green-600 text-sm" />
                          <span className="text-sm font-medium text-green-800">{image.name}</span>
                        </motion.div>
                      )}
                    </div>

                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-200">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isProgrammingCourse}
                          onChange={(e) => setIsProgrammingCourse(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                        />
                        <div className="flex items-center space-x-2">
                          <FaCode className="text-indigo-600 text-sm" />
                          <span className="text-sm font-medium text-gray-700">
                            Include coding tasks
                          </span>
                        </div>
                      </label>

                      {isProgrammingCourse && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Programming Language
                          </label>
                          <select
                            value={programmingLanguage}
                            onChange={(e) => setProgrammingLanguage(e.target.value)}
                            className="w-full rounded-xl border-0 bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-sm py-2.5 pl-3 pr-8 text-left shadow-sm ring-1 ring-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 transition-all duration-200 text-sm text-gray-900 hover:ring-indigo-300 cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUgOEwxMCAxM0wxNSA4IiBzdHJva2U9IiM2MzY2RjEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')] bg-no-repeat bg-[length:16px] bg-[right_12px_center]"
                          >
                            <option value="" className="text-gray-400">Select language</option>
                            <option value="JavaScript" className="text-gray-900">JavaScript</option>
                            <option value="Python" className="text-gray-900">Python</option>
                            <option value="Java" className="text-gray-900">Java</option>
                            <option value="C++" className="text-gray-900">C++</option>
                            <option value="TypeScript" className="text-gray-900">TypeScript</option>
                            <option value="SQL" className="text-gray-900">SQL</option>
                          </select>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={resetAndClose}
                        className="flex-1 rounded-xl bg-gray-200 px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCourseUpload}
                        disabled={!courseTitle || !description || duration < 1}
                        className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-white font-medium hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Create Course
                      </motion.button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>

          {/* Weeks Modal */}
      <Transition appear show={isWeeksDialogOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setWeeksDialogOpen(false)}
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
              <div className="w-full max-w-md my-8">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-h-[80vh] overflow-y-auto scrollbar-hide rounded-3xl bg-white/90 backdrop-blur-md p-6 pb-8 shadow-2xl border border-white/20">
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 mb-3"
                      >
                        <FaUpload className="text-xl text-white" />
                      </motion.div>
                      <Dialog.Title className="text-xl font-bold text-gray-900">
                        Upload Weekly Materials
                      </Dialog.Title>
                      <p className="text-gray-600 text-sm mt-1">Add content to each week of your course</p>
                    </div>

                    <div className="space-y-3">
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-red-50 rounded-lg border border-red-200"
                        >
                          <div className="text-red-600 text-sm font-medium">{error}</div>
                        </motion.div>
                      )}
                      
                      {Array.from({ length: weeks }).map((_, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-indigo-300 transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600">
                              <span className="text-sm font-semibold">{index + 1}</span>
                            </div>
                            <span className="font-medium text-gray-800">Week {index + 1}</span>
                          </div>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openMaterialUpload(index + 1)}
                            disabled={uploadedWeeks.has(index + 1)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-sm ${
                              uploadedWeeks.has(index + 1)
                                ? "bg-green-100 text-green-700 cursor-not-allowed border border-green-200"
                                : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
                            }`}
                          >
                            {uploadedWeeks.has(index + 1) ? (
                              <>
                                <FaCheck className="text-sm" />
                                <span>Uploaded</span>
                              </>
                            ) : (
                              <>
                                <FaUpload className="text-sm" />
                                <span>Upload</span>
                              </>
                            )}
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setWeeksDialogOpen(false)}
                        className="w-full rounded-xl bg-gray-200 px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200"
                      >
                        Close
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
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
              <div className="w-full max-w-md my-8">
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
                    <Dialog.Panel className="w-full max-h-[80vh] overflow-y-auto scrollbar-hide rounded-3xl bg-white/90 backdrop-blur-md p-6 pb-8 shadow-2xl border border-white/20">
                      <div className="text-center mb-6">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 mb-3"
                        >
                          <FaUpload className="text-xl text-white" />
                        </motion.div>
                        <Dialog.Title className="text-xl font-bold text-gray-900">
                          Upload Material for Week {selectedWeek}
                        </Dialog.Title>
                        <p className="text-gray-600 text-sm mt-1">Add learning materials and generate content</p>
                      </div>

                      <div className="space-y-4">
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

                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-200">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isCodeGeneration}
                              onChange={(e) => setIsCodeGeneration(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                            />
                            <div className="flex items-center space-x-2">
                              <FaCode className="text-indigo-600 text-sm" />
                              <span className="text-sm font-medium text-gray-700">
                                Generate coding tasks automatically
                              </span>
                            </div>
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload File
                          </label>
                          <div className="relative">
                            <label
                              htmlFor="material-upload"
                              className="cursor-pointer flex items-center justify-center w-full rounded-xl border-2 border-dashed border-gray-300 bg-white/50 backdrop-blur-sm p-4 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-200"
                            >
                              <div className="space-y-1">
                                <FaUpload className="mx-auto text-xl text-gray-400" />
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium text-indigo-600">Choose a file</span>
                                </div>
                                <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT up to 10MB</p>
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
                              className="mt-2 flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200"
                            >
                              <FaCheck className="text-green-600 text-sm" />
                              <span className="text-sm font-medium text-green-800">{material.name}</span>
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

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => setMaterialDialogOpen(false)}
                            className="flex-1 rounded-xl bg-gray-200 px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200"
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
                            className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-white font-medium hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
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
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
