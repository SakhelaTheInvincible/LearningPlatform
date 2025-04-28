"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import { Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  CodeBracketIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

type Part = {
  name: string;
  type: "reading" | "questions" | "coding";
  slug: string; // URL part
  description: string;
  completed: boolean;
};

type WeekDropdownProps = {
  weekTitle: string;
  parts: Part[];
  weekNumber: number;
  description: string;
};

export default function WeekDropdown({
  weekTitle,
  parts,
  weekNumber,
  description,
}: WeekDropdownProps) {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const limit = 200; // character limit for preview

  const isLong = description.length > limit;
  const preview = isLong ? description.slice(0, limit) + "..." : description;

  const getIcon = (type: Part["type"], completed: Part["completed"]) => {
    switch (type) {
      case "reading":
        return completed ? (
          <div className=" rounded-full bg-gray-200 mr-2 p-1">
            <CheckCircleIcon className="h-4 w-4 bg-green-600 rounded-full text-white" />
          </div>
        ) : (
          <div className=" rounded-full bg-gray-200 mr-2 p-1">
            <BookOpenIcon className="h-4 w-4" />
          </div>
        );
      case "questions":
        return completed ? (
          <div className=" rounded-full bg-gray-200 mr-2 p-1">
            <CheckCircleIcon className="h-4 w-4 bg-green-600 rounded-full text-white" />
          </div>
        ) : (
          <div className=" rounded-full bg-gray-200 mr-2 p-1">
            <QuestionMarkCircleIcon className="h-4 w-4" />
          </div>
        );

      case "coding":
        return completed ? (
          <div className=" rounded-full bg-gray-200 mr-2 p-1">
            <CheckCircleIcon className="h-4 w-4 bg-green-600 rounded-full text-white" />
          </div>
        ) : (
          <div className=" rounded-full bg-gray-200 mr-2 p-1">
            <CodeBracketIcon className="h-4 w-4" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full p-2 border rounded-md text-left text-indigo-600 hover:text-indigo-800 ${
          open ? "rounded-b-none" : ""
        }`}
      >
        <div className="flex items-center">
          {open ? (
            <ChevronDownIcon className="h-5 w-5 mr-2" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 mr-2" />
          )}
          <span>{weekTitle}</span>
        </div>
      </button>

      <Transition
        as={Fragment}
        show={open}
        enter="transition-all duration-300 ease-out"
        enterFrom="transform opacity-0 -translate-y-5"
        enterTo="transform opacity-100 translate-y-0"
        leave="transition-all duration-200 ease-in"
        leaveFrom="transform opacity-100 translate-y-0"
        leaveTo="transform opacity-0 -translate-y-5"
      >
        <div className="overflow-hidden flex flex-col space-y-1 border border-t-[0] border-indigo-700 rounded rounded-t-none px-5 py-2">
          <div className="text-sm px-3 py-2">
            {expanded ? description : preview}
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-indigo-600 ml-2"
              >
                {expanded ? "Show Less" : "Show More"}
              </button>
            )}
          </div>
          {parts.map((part) => (
            <Link
              key={part.slug}
              href={`${weekNumber}/${part.slug}`}
              className="py-2 flex items-center text-sm text-indigo-600 hover:text-indigo-800 hover:bg-gray-200 transition-colors p-2 rounded-xs"
            >
              {getIcon(part.type, part.completed)}
              <div className="ml-3 ">
                <div className="">{part.name}</div>
                <div className="text-gray-700">{part.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </Transition>
    </div>
  );
}
