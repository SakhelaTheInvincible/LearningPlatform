"use client";
import { useEffect, useState, useRef } from "react";
import Header from "@/src/components/Header";
import WeekMenu, { WeekMenuHandle } from "@/src/components/weekMenu";
import Breadcrumbs from "@/src/components/Breadcrumbs";
import { useParams, useRouter } from "next/navigation";
import api from "@/src/lib/axios";
import LoadingPage from "@/src/components/LoadingPage";

interface WeekInfo {
  week_number: number;
  materials: Material[];
  // quizzes: Quiz[];
  // coding: Coding_Question[];
}
interface Material {
  title: string;
  description: string;
  summarized_material: string;
}
// interface Quiz {
//   id: number;
//   difficulty: "A" | "I" | "S" | "M" | "N";
//   user_score: number;
//   created_at: string;
//   questions: Question[];
// }
// interface Question {
//   id: number;
//   question_text: string;
//   difficulty: string;
//   question_type: "choice" | "multiple_choice" | "true_false" | "open";
//   answer: string;
//   explanation: string;
// }

// interface Coding_Question {
//   title: string;
// }

interface Part {
  name: string;
  type: "reading" | "questions" | "coding" | "complete";
  slug: string;
  description: string;
  completed: boolean;
}
interface Details {
  material_read: boolean;
  quiz_completed: boolean;
  code_completed: boolean;
}

export default function WeekReading() {
  const [completionDetails, setCompletionDetails] = useState<Details>({
    material_read: false,
    quiz_completed: false,
    code_completed: false,
  });
  const [material, setMaterial] = useState<WeekInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const slug = params?.slug as string;
  const weekNumber = parseInt(params?.weekNumber as string);
  const [duration, setDuration] = useState(0);
  const [parts, setParts] = useState<Part[]>([]);
  const [hasCoding, setHasCoding] = useState(false);
  const [showIncompleteMessage, setShowIncompleteMessage] = useState(false);
  const menuRef = useRef<WeekMenuHandle>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchSidebar() {
      try {
        const res = await api.get(
          `/courses/${slug}/weeks/${weekNumber}/get_completion/`
        );
        const data = res.data;
        setCompletionDetails(data);
        console.log(data);
        const res1 = await api.get(
          `/courses/${slug}/weeks/${weekNumber}/codes/`
        );
        const data1 = res1.data;
        if (data1.length != 0) {
          setHasCoding(true);
          setParts([
            {
              name: "Reading Material",
              type: "reading",
              slug: "reading",
              description: `Learning material`,
              completed: data.material_read,
            },
            {
              name: "Quiz questions",
              type: "questions",
              slug: "questions",
              description: "Answer quiz questions",
              completed: data.quiz_completed,
            },
            {
              name: "Coding Tasks",
              type: "coding",
              slug: "coding",
              description: "Complete coding challanges",
              completed: data.code_completed,
            },
            {
              name: "Complete Tasks",
              type: "complete",
              slug: "complete",
              description: "Finish this weeks materials",
              completed:
                data.material_read &&
                data.quiz_completed &&
                data.code_completed,
            },
          ]);
        } else {
          setParts([
            {
              name: "Reading Material",
              type: "reading",
              slug: "reading",
              description: `Learning material`,
              completed: data.material_read,
            },
            {
              name: "Quiz questions",
              type: "questions",
              slug: "questions",
              description: "Answer quiz questions",
              completed: data.quiz_completed,
            },
            {
              name: "Complete Tasks",
              type: "complete",
              slug: "complete",
              description: "Finish this weeks materials",
              completed: data.material_read && data.quiz_completed,
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to load sidebar:", error);
      }
    }
    fetchSidebar();
  }, []);

  const finishWeek = async () => {
    const { material_read, quiz_completed, code_completed } = completionDetails;

    const allComplete =
      material_read && quiz_completed && (hasCoding ? code_completed : true);

    if (allComplete) {
      const new_weekNumber = weekNumber + 1;
      await api.put(`/courses/${slug}/weeks/${weekNumber}/set_is_completed/`, {
        is_completed: true,
      });
      if (new_weekNumber > duration) {
        router.push(`/courses/${slug}`);
      } else {
        router.push(`/courses/${slug}/week/${new_weekNumber}`);
      }
    } else {
      setShowIncompleteMessage(true);
      setTimeout(() => setShowIncompleteMessage(false), 1000);
    }
  };

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await api.get(`/courses/${slug}`);
        const data = res.data;

        console.log(data);
        setDuration(data.duration_weeks);

        const week = data.weeks?.find((w: any) => w.week_number === weekNumber);
      } catch (error) {
        console.error("Failed to load course:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, []);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await api.get(`/courses/${slug}/weeks/${weekNumber}`);
        const data = res.data;
        setMaterial(data);
      } catch (error) {
        console.error("Failed to load course:", error);
      } finally {
        setLoading(false);
      }
    }

    if (slug && weekNumber) fetchCourse();
  }, [slug, weekNumber]);

  if (loading)
    return (
      <div className="p-10">
        <LoadingPage />
      </div>
    );
  if (!material) return <div className="p-10">Material not found.</div>;
  return (
    <>
      <div className="flex flex-col">
        <Header />
        <div className="flex flex-row justify-start mt-16 bg-white ">
          <WeekMenu ref={menuRef} parts={parts} />
          <div className="flex flex-row justify-start ml-8 mt-8">
            <div className="flex flex-col justify-start">
              <Breadcrumbs />
              <div className="px-[150px] py-[80px]">
                <div className="text-black text-xl">
                  Complete all materials for this week and continue learning.
                </div>
              </div>
              <div className="flex flex-row justify-start ml-[180px]">
                <button
                  className="hover:bg-indigo-500 bg-indigo-600 text-white p-2 rounded hover:cursor-pointer"
                  onClick={finishWeek}
                >
                  Mark as Completed
                </button>
              </div>
            </div>
          </div>
        </div>
        {showIncompleteMessage && (
          <div className="flex flex-row fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#252526] text-sm text-white px-6 py-2 rounded-lg border border-gray-700 shadow-md animate-fade-in-out">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5 mr-2 text-yellow-500"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25Zm.75 13.5a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5Zm0-9a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 1.5 0v-6Z"
                clipRule="evenodd"
              />
            </svg>
            Please complete all required materials before proceeding.
          </div>
        )}
      </div>
    </>
  );
}
