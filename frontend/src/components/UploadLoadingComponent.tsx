"use client";

import { Fragment } from "react";
import { Transition } from "@headlessui/react";

export default function LoadingComponent({
  show = true,
  message = "Loading...",
}: {
  show?: boolean;
  message?: string;
}) {
  return (
    <Transition show={show} as={Fragment}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-lg text-indigo-700">{message}</p>
          </div>
        </Transition.Child>
      </div>
    </Transition>
  );
}
