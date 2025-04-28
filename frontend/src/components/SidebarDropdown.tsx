"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import { Transition } from "@headlessui/react";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";

const weeks = [1, 2, 3, 4, 5];

export default function SidebarDropdown() {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();

  // Get current week from the pathname
  const currentWeek = parseInt(pathname.split("/").pop() || "0");

  return (
    <div className="w-[200px] rounded-md border border-transparent hover:border-indigo-600">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center w-full text-left p-2 text-indigo-600 hover:text-indigo-800 border border-transparent hover:bg-gray-200 hover:border rounded-md"
      >
        {open ? (
          <ChevronDownIcon className="h-5 w-5 mr-2" />
        ) : (
          <ChevronRightIcon className="h-5 w-5 mr-2" />
        )}
        <span>Course Materials</span>
      </button>

      <Transition
        as={Fragment}
        show={open}
        enter="transition-all duration-300 ease-out"
        enterFrom="max-h-0 opacity-0"
        enterTo="max-h-96 opacity-100"
        leave="transition-all duration-200 ease-in"
        leaveFrom="max-h-96 opacity-100"
        leaveTo="max-h-0 opacity-0"
      >
        <nav className="overflow-hidden flex flex-col space-y-1 mt-2 px-2 pb-3">
          {weeks.map((week) => (
            <Link
              key={week}
              href={`${week}`} // maybe you want "/course/${week}" depending on your routing
              className={`text-sm hover:bg-gray-200 rounded-md py-2 px-2 transition-colors text-indigo-600${
                currentWeek === week
                  ? "border border-l-4 border-indigo-600 bg-gray-200"
                  : ""
              }`}
            >
              Week {week}
            </Link>
          ))}
        </nav>
      </Transition>
    </div>
  );
}
