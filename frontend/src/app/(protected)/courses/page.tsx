"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/src/components/Header";
import CourseCard from "@/src/components/CourseCard";
import UploadCourseDialog from "@/src/components/CourseUploadDialog";
import api from "@/src/lib/axios";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

interface Course {
  id: number;
  title: string;
  title_slug: string;
  description: string;
  level: string;
  image: string;
  duration_weeks: number;
  estimated_time: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState("title");
  const [error, setError] = useState("");
  const [courseNumber, setCourseNumber] = useState(0);

  const sortOptions = [
    { label: "Title", value: "title" },
    { label: "Created at", value: "created_at" },
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses/");
        console.log(res.data);
        setCourses(res.data);
        setCourseNumber(res.data.length);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
    setSearch("");
    setOrderBy("title");
  }, [openDialog]);

  const fetchFilteredCourses = async (title: string, order_by: string) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/courses/filter/?title=${title}&order_by=-${order_by}`
      );
      setCourses(res.data);
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="min-h-screen mt-10 bg-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-10">
            Explore Our Courses
          </h1>

          {courseNumber > 1 && (
            <div className="flex flex-row items-center mb-8">
              {/* Search Input */}
              <input
                type="text"
                placeholder="Search course"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    fetchFilteredCourses(search, orderBy);
                  }
                }}
                className="border border-gray-500 px-4 py-[10px] rounded-md w-full max-w-xs text-sm"
              />

              {/* Order By Dropdown */}
              <div className="ml-4 w-full max-w-xs">
                <Listbox
                  value={orderBy}
                  onChange={(val) => {
                    setOrderBy(val);
                    fetchFilteredCourses(search, val);
                  }}
                >
                  <div className="relative">
                    {/* Button */}
                    <Listbox.Button className="relative w-full cursor-default rounded-md bg-indigo-600 py-[10px] pl-4 pr-10 text-left text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm">
                      <span className="block truncate">
                        Order by:{" "}
                        {sortOptions.find((o) => o.value === orderBy)?.label}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-indigo-200"
                          aria-hidden="true"
                        />
                      </span>
                    </Listbox.Button>

                    {/* Options */}
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/10 focus:outline-none sm:text-sm z-50">
                      {sortOptions.map((option) => (
                        <Listbox.Option
                          key={option.value}
                          value={option.value}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-4 pr-10 ${
                              active
                                ? "bg-indigo-100 text-indigo-900"
                                : "text-gray-900"
                            }`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? "font-medium" : "font-normal"
                                }`}
                              >
                                {option.label}
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 right-2 flex items-center text-indigo-600">
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
            </div>
          )}

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}

              <div>
                <button
                  className="group w-full h-full text-left p-0 bg-transparent border-none"
                  onClick={() => setOpenDialog(true)}
                >
                  <div className="bg-indigo-600 rounded-2xl shadow overflow-hidden transition-transform transform group-hover:scale-105 duration-300 ease-in-out cursor-pointer h-full flex flex-col">
                    <div className="flex-1 flex items-center justify-center h-48">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="white"
                        className="w-16 h-16 mt-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                    </div>
                    <div className="p-6 text-center">
                      <h2 className="text-white font-semibold text-xl">
                        Add Your Own Course
                      </h2>
                    </div>
                  </div>
                </button>

                <UploadCourseDialog
                  isOpen={openDialog}
                  onClose={() => setOpenDialog(false)}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
