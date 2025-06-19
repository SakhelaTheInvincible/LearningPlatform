"use client";

import React, { JSX, useEffect, useState } from "react";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  MinusCircleIcon,
} from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import api from "../lib/axios";

type TimelineCheckpoint = {
  title: string;
  date?: string;
  icon: JSX.Element;
  completed?: boolean;
};

type WeekData = {
  week_number: number;
  is_completed: boolean;
  updated_at: string;
  materials: { title: string }[];
};

type CourseTimelineProps = {
  startDate: string;
  weeks: number;
  timePerWeek: number;
};

const Timeline = ({ startDate, weeks, timePerWeek }: CourseTimelineProps) => {
  const params = useParams();
  const slug = params?.slug as string;

  const [checkpoints, setCheckpoints] = useState<TimelineCheckpoint[]>([]);

  useEffect(() => {
    async function fetchTimeline() {
      try {
        const res = await api.get(`/courses/${slug}`);
        const startDate = res.data.created_at;
        const weekData: WeekData[] = res.data.weeks;

        const allWeeksCompleted =
          weekData.length === weeks &&
          weekData.every((week) => week.is_completed);

        let latestUpdate: Date | null = null;
        if (allWeeksCompleted) {
          latestUpdate = weekData.reduce((latest, week) => {
            const updated = new Date(week.updated_at);
            return updated > latest ? updated : latest;
          }, new Date(weekData[0].updated_at));
        }

        const timeline: TimelineCheckpoint[] = [
          {
            title: "Course Start",
            date: new Date(startDate).toDateString(),
            icon: <CalendarIcon className="h-5 w-5 text-green-600" />,
            completed: true,
          },
        ];

        for (let i = 1; i <= weeks; i++) {
          const week = weekData.find((w) => w.week_number === i);

          if (week?.is_completed) {
            timeline.push({
              title: `Week ${i}`,
              date: new Date(week.updated_at).toDateString(),
              icon: <CheckCircleIcon className="h-5 w-5 text-green-600" />,
              completed: true,
            });
          } else {
            timeline.push({
              title: `Week ${i}`,
              date: "Not finished",
              icon: <MinusCircleIcon className="h-5 w-5 text-indigo-600" />,
              completed: false,
            });
          }
        }

        timeline.push({
          title: "Course End",
          date:
            allWeeksCompleted && latestUpdate
              ? latestUpdate.toDateString()
              : "Not finished",
          icon: (
            <ClockIcon
              className={`h-5 w-5 ${
                allWeeksCompleted ? "text-green-600" : "text-indigo-600"
              }`}
            />
          ),
          completed: allWeeksCompleted,
        });

        setCheckpoints(timeline);
      } catch (error) {
        console.error("Failed to load timeline:", error);
      }
    }

    fetchTimeline();
  }, [slug, startDate, weeks, timePerWeek]);

  return (
    <div className="w-80 border border-indigo-500 bg-white shadow-md rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-xl text-gray-800">Course Timeline</h2>
        <hr className="mt-2 border-indigo-500" />
      </div>

      <div className="relative">
        <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-indigo-300 border-dashed border-l-2 z-0" />

        <div className="space-y-6 relative z-10">
          {checkpoints.map((checkpoint, index) => (
            <div key={index} className="relative flex items-start space-x-4">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full shadow-sm ring-1 ring-white ${
                  checkpoint.completed ? "bg-green-100" : "bg-indigo-100"
                }`}
              >
                {checkpoint.icon}
              </div>

              <div>
                <p
                  className={`text-sm font-medium ${
                    checkpoint.completed ? "text-green-600" : "text-indigo-600"
                  }`}
                >
                  {checkpoint.title}
                </p>
                {checkpoint.date && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {checkpoint.date}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
