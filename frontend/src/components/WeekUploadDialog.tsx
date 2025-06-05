"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import api from "@/src/lib/axios";

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


  const openMaterialUpload = (weekNumber: number) => {
    setSelectedWeek(weekNumber);
    setMaterialDialogOpen(true);
  };

  const handleWeekUpload = async () => {
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
    if (!material || selectedWeek === null) return;

    const formData = new FormData();
    formData.append("material", material);
    formData.append("title", materialTitle);
    formData.append("description", materialDescription);

    try {
      await api.post(
        `/courses/${slug}/weeks/${selectedWeek}/materials/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      await api.post(`/courses/${slug}/weeks/${selectedWeek}/questions/`);

      setMaterialDialogOpen(false);
      setMaterial(null);
      setMaterialTitle("");
      setMaterialDescription("");
      setUploadedWeeks((prev) => new Set(prev).add(selectedWeek));
    } catch (err) {
      console.error("Error uploading material:", err);
    }
  };

  const resetAndClose = () => {
    setUploadedWeeks(new Set());
    onClose();
  };

  return (
    <>
      {/* Weeks Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={resetAndClose}
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
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
