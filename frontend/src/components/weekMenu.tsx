"use client";

import {
  forwardRef,
  useImperativeHandle,
  useState,
  Fragment,
  ForwardedRef,
  useEffect,
} from "react";
import Link from "next/link";
import { Transition } from "@headlessui/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  BookOpenIcon,
  QuestionMarkCircleIcon,
  CodeBracketIcon,
  Bars3Icon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import api from "../lib/axios";

interface Part {
  name: string;
  type: "reading" | "questions" | "coding" | "complete";
  slug: string;
  description: string;
  completed: boolean;
}

type WeekDropdownProps = {
  parts: Part[];
};

export type WeekMenuHandle = {
  goToNextPart: () => void;
};

const WeekMenu = forwardRef<WeekMenuHandle, WeekDropdownProps>(
  function WeekMenu({ parts }, ref: ForwardedRef<WeekMenuHandle>) {
    const [open, setOpen] = useState(true);
    const params = useParams();
    const slug = params?.slug as string;
    const weekNumber = parseInt(params?.weekNumber as string);
    const pathname = usePathname(); // e.g. "/courses/ai/weeks/2/questions"
    const router = useRouter();

    const currentMaterial = pathname.split("/").pop();

    // Derive base path like `/courses/ai/weeks/2`
    const basePath = pathname
      .split("/")
      .slice(0, -1) // remove the last segment (e.g., "questions")
      .join("/");

    const goToNextPart = () => {
      const currentIndex = parts.findIndex(
        (part) => part.slug === currentMaterial
      );
      if (currentIndex === -1) return;

      const nextPart = parts[currentIndex + 1];
      if (nextPart) {
        router.push(`${basePath}/${nextPart.slug}`);
      } else {
        router.push(`${basePath}/complete`); // or whatever fallback you use
      }
    };

    useImperativeHandle(
      ref,
      (): WeekMenuHandle => ({
        goToNextPart,
      })
    );

    const getIcon = (type: Part["type"], completed: Part["completed"]) => {
      return completed ? (
        <div className="rounded-full bg-gray-200 mr-2 p-1">
          <CheckCircleIcon className="h-4 w-4 bg-green-600 rounded-full text-white" />
        </div>
      ) : (
        <div className="rounded-full bg-gray-200 mr-2 p-1">
          {type === "reading" && <BookOpenIcon className="h-4 w-4" />}
          {type === "questions" && (
            <QuestionMarkCircleIcon className="h-4 w-4" />
          )}
          {type === "coding" && <CodeBracketIcon className="h-4 w-4" />}
          {type === "complete" && <CheckCircleIcon className="h-4 w-4" />}
        </div>
      );
    };

    return (
      <div
        className={`bg-white h-screen max-w-[240px] flex flex-col border border-indigo-600 border-l-transparent border-t-transparent ${
          open ? "w-64" : "w-16"
        } transition-all duration-300`}
      >
        {/* Top Button */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center p-2 rounded-md text-indigo-600 hover:text-indigo-800 mx-2 my-4 transition-all duration-300"
        >
          <Bars3Icon className="h-6 w-6" />
          {open && <span className="ml-2 text-sm">Hide Menu</span>}
        </button>

        {/* Menu Items */}
        <Transition
          as={Fragment}
          show={open}
          enter="transition-all duration-300 ease-out"
          enterFrom="transform opacity-0 -translate-x-5"
          enterTo="transform opacity-100 translate-x-0"
          leave="transition-all duration-200 ease-in"
          leaveFrom="transform opacity-100 translate-x-0"
          leaveTo="transform opacity-0 -translate-x-5"
        >
          <div className="overflow-hidden w-[240px] flex flex-col space-y-1 rounded-t-none px-5 py-2">
            {parts.map((part) => (
              <Link
                key={part.slug}
                href={`${basePath}/${part.slug}`}
                className={`py-2 flex items-center text-sm transition-colors p-2 rounded-xs border-l-4 ${
                  currentMaterial === part.slug
                    ? "border-indigo-600 bg-gray-200"
                    : part.completed
                    ? "border-green-500 bg-green-50 hover:bg-green-100 text-green-700"
                    : "border-transparent hover:border-indigo-600 text-indigo-600 hover:text-indigo-800 hover:bg-gray-200"
                }`}
              >
                {getIcon(part.type, part.completed)}
                <div className="ml-3">
                  <div className={part.completed ? "font-medium" : ""}>{part.name}</div>
                  <div className={part.completed ? "text-green-600" : "text-gray-700"}>{part.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </Transition>
      </div>
    );
  }
);

export default WeekMenu;
