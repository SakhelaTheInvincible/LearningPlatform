"use client";
import { useEffect, useState, useRef } from "react";
import Header from "@/src/components/Header";
import WeekMenu, { WeekMenuHandle } from "@/src/components/weekMenu";
import Breadcrumbs from "@/src/components/Breadcrumbs";
import { useParams } from "next/navigation";
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

export default function WeekReading() {
  const [completedReading, setCompletedReading] = useState(false);
  const [material, setMaterial] = useState<WeekInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const slug = params?.slug as string;
  const weekNumber = parseInt(params?.weekNumber as string);
  const [parts, setParts] = useState<Part[]>([]);
  const menuRef = useRef<WeekMenuHandle>(null);

  useEffect(() => {
    async function fetchSidebar() {
      try {
        const res = await api.get(
          `/courses/${slug}/weeks/${weekNumber}/get_completion/`
        );
        const data = res.data;
        console.log(data);
        const res1 = await api.get(
          `/courses/${slug}/weeks/${weekNumber}/codes/`
        );
        const data1 = res1.data;
        if (data1.length != 0) {
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

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await api.get(`/courses/${slug}/weeks/${weekNumber}`);
        const data = res.data;
        console.log("materials");
        console.log(data);
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
                {material.materials.length > 0 ? (
                  material.materials.map((m, index) => (
                    <div key={index} className="mb-12">
                      <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
                        {m.title}
                      </h2>
                      <p className="text-gray-700 mb-2">{m.description}</p>
                      <div className="bg-gray-100 p-4 rounded">
                        <p className="whitespace-pre-line">
                          {m.summarized_material}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">
                    No materials available for this week.
                  </div>
                )}
              </div>
              <div className="flex flex-row justify-start ml-[150px]">
                <button
                  className="hover:bg-indigo-500 bg-indigo-600 text-white p-2 rounded hover:cursor-pointer"
                  onClick={async () => {
                    const res = await api.put(
                      `/courses/${slug}/weeks/${weekNumber}/set_is_read/`,
                      { is_read: true }
                    );
                    console.log(res.data);
                    menuRef.current?.goToNextPart();
                  }}
                >
                  Mark as Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
