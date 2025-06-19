"use client";

import React, { JSX, useEffect } from "react";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import api from "../lib/axios";

type TimelineCheckpoint = {
  title: string;
  date: string;
  icon: JSX.Element;
};

type CourseTimelineProps = {
  startDate: string; // Start date of the course
  weeks: number; // Total number of weeks
  timePerWeek: number; // Estimated time per week (in days or weeks, depending on your system)
};

const Timeline = ({ startDate, weeks, timePerWeek }: CourseTimelineProps) => {
  const params = useParams();
  const slug = params?.slug as string;
  const weekNumber = parseInt(params?.weekNumber as string);
  // Calculate the estimated end date
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate() + weeks * timePerWeek); // Adjust end date based on weeks

  const checkpoints: TimelineCheckpoint[] = [
    {
      title: "Course Start",
      date: startDate,
      icon: <CalendarIcon className="h-6 w-6 " />,
    },
  ];
  useEffect(() => {
    async function fetchSidebar() {
      try {
        const res = await api.get(`/courses/${slug}/get_completions/`);
        const data = res.data;
        console.log(data);
      } catch (error) {
        console.error("Failed to load sidebar:", error);
      }
    }
    fetchSidebar();
  }, []);

  // Add checkpoints for each week
  for (let i = 1; i <= weeks; i++) {
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + i * timePerWeek); // Adjust each week's start date
    checkpoints.push({
      title: `Week ${i}`,
      date: weekStart.toDateString(),
      icon: <CheckCircleIcon className="h-6 w-6" />,
    });
  }

  // Add estimated end date as final checkpoint
  checkpoints.push({
    title: "Estimated End",
    date: end.toDateString(),
    icon: <ClockIcon className="h-6 w-6" />,
  });

  return (
    <div className="w-72 shadow-lg p-4 rounded-lg space-y-4">
      <h2 className="text-xl font-semibold">Course Timeline</h2>

      <div className="relative">
        <div className="absolute left-[15px]  w-1 h-full border border-1 border-transparent border-l-indigo-600 border-dashed h-full"></div>

        <div className="space-y-4">
          {checkpoints.map((checkpoint, index) => (
            <div key={index} className="relative flex items-center">
              {/* Icon */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white">
                {checkpoint.icon}
              </div>

              {/* Checkpoint Info */}
              <div className="ml-12">
                <p className="font-medium text-indigo-600">
                  {checkpoint.title}
                </p>
                <p className="text-sm text-gray-600">{checkpoint.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
