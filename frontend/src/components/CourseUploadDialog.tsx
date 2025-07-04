"use client";

import { Dialog, Listbox, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
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
                    Upload Course
                  </Dialog.Title>

                  <div className="mt-4 space-y-4">
                    {error && (
                      <div className="text-red-600 text-sm">{error}</div>
                    )}
                    <input
                      type="text"
                      placeholder="Course Title"
                      className="w-full rounded border px-3 py-2"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                    />
                    <textarea
                      placeholder="Description"
                      className="w-full rounded border px-3 py-2"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    <input
                      type="number"
                      min={1}
                      placeholder="Duration (weeks)"
                      className="w-full rounded border px-3 py-2"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                    />
                    <div>
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer inline-block text-indigo-600 hover:underline"
                      >
                        Choose Image
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      {image && (
                        <p className="mt-2 text-sm text-gray-600">
                          Selected: {image.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <div>
                        <label className="flex items-center space-x-2 text-sm text-gray-700 mb-2">
                          <input
                            type="checkbox"
                            checked={isProgrammingCourse}
                            onChange={(e) =>
                              setIsProgrammingCourse(e.target.checked)
                            }
                            className="h-4 w-4 rounded border-gray-300 accent-indigo-600"
                          />
                          <span>Include coding tasks?</span>
                        </label>
                      </div>

                      {isProgrammingCourse && (
                        <div className="mb-2">
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Choose Programming Language
                          </label>
                          <Listbox
                            value={programmingLanguage}
                            onChange={setProgrammingLanguage}
                          >
                            <div className="relative">
                              <Listbox.Button className="relative w-full cursor-pointer rounded border bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                                <span className="block truncate">
                                  {programmingLanguage || "Select language"}
                                </span>
                              </Listbox.Button>
                              <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded  bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                  {[
                                    "JavaScript",
                                    "Python",
                                    "Java",
                                    "C++",
                                    "TypeScript",
                                    "SQL",
                                  ].map((lang) => (
                                    <Listbox.Option
                                      key={lang}
                                      value={lang}
                                      className={({ active }) =>
                                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                          active
                                            ? "bg-indigo-100 text-indigo-700"
                                            : "text-gray-900"
                                        }`
                                      }
                                    >
                                      {({ selected }) => (
                                        <>
                                          <span
                                            className={`block truncate ${
                                              selected
                                                ? "font-medium"
                                                : "font-normal"
                                            }`}
                                          >
                                            {lang}
                                          </span>
                                          {selected && (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="size-4"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  d="m4.5 12.75 6 6 9-13.5"
                                                />
                                              </svg>
                                            </span>
                                          )}
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </Listbox>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleCourseUpload}
                      className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
                    >
                      Upload Course
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
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
                    {error && (
                      <div className="text-red-600 text-sm">{error}</div>
                    )}
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
