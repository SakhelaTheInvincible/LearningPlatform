"use client";
import Header from "@/src/components/Header";
import WeekMenu from "@/src/components/weekMenu";
import Breadcrumbs from "@/src/components/Breadcrumbs";
import MultipleChoiceQuestion from "@/src/components/MultipleChoicQuestion";
import OpenEndedQuestion from "@/src/components/OpenEndedQuestion";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/src/lib/axios";
import ChoiceQuestion from "@/src/components/ChoiceQuestion";
import TrueFalseQuestion from "@/src/components/TrueFalseQuestion";

interface WeekInfo {
  week_number: number;
  materials: Material[];
  quizzes: Quiz[];
  coding: Coding_Question[];
}
interface Material {
  title: string;
  description: string;
  summarized_material: string;
}
interface Quiz {
  id: number;
  difficulty: "B" | "K" | "I" | "A" | "E";
  user_score: number;
  created_at: string;
  questions: Question[];
}
interface Question {
  id: number;
  question_text: string;
  difficulty: "B" | "K" | "I" | "A" | "E";
  question_type: "choice" | "multiple_choice" | "true_false" | "open";
  answer: string;
  explanation: string;
}

interface Coding_Question {
  title: string;
}

export default function WeekQuestions() {
  const [material, setMaterial] = useState<WeekInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const slug = params?.slug as string;
  const weekNumber = parseInt(params?.weekNumber as string);
  const [userAnswers, setUserAnswers] = useState<Record<number, string[]>>({});
  const [score, setScore] = useState<number | null>(null);
  const [quizDifficulty, setQuizDifficulty] = useState("I");
  const [answerResults, setAnswerResults] = useState<
    Record<number, "correct" | "incorrect">
  >({});
  const [completedQuiz, setCompletedQuiz] = useState(false);

  function parseChoiceQuestion(rawText: string): {
    question: string;
    options: string[];
  } {
    const regex = /([a-z]\))/gi;
    const split = rawText.split(regex).filter(Boolean);

    let question = split[0].trim();
    const options: string[] = [];

    for (let i = 1; i < split.length - 1; i += 2) {
      const label = split[i]; // a), b), ...
      const text = split[i + 1];
      options.push(text.trim());
    }

    return { question, options };
  }
  const handleAnswerChange = (questionId: number, answer: string[]) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };
  const handleSubmit = () => {
    if (!material || !material.quizzes?.[0]) return;

    const questions = material.quizzes[0].questions;
    let correct = 0;
    const results: Record<number, "correct" | "incorrect"> = {};

    for (const q of questions) {
      const userAnswer = userAnswers[q.id] || [];
      const correctAnswer = q.answer;

      const normalizedUserAnswer = userAnswer
        .map((a) => a.trim().toLowerCase())
        .sort()
        .join(",");
      const normalizedCorrectAnswer = correctAnswer
        .split("|")
        .map((a) => a.trim().toLowerCase())
        .sort()
        .join(",");

      if (normalizedUserAnswer === normalizedCorrectAnswer) {
        correct += 1;
        results[q.id] = "correct";
      } else {
        results[q.id] = "incorrect";
      }
    }

    const total = questions.length;
    const percentage = (correct / total) * 100;
    if (percentage > 60) {
      setCompletedQuiz(true);
    }
    setScore(percentage);
    setAnswerResults(results);
  };

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await api.get(`/courses/${slug}/week/${weekNumber}`);
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

  if (loading) return <div className="p-10">Loading course...</div>;
  if (!material) return <div className="p-10">Questions not found.</div>;
  return (
    <>
      <div className="flex flex-col">
        <Header />
        <div className="flex flex-row justify-start mt-16 bg-white ">
          <WeekMenu
            parts={[
              {
                name: "Reading Material",
                type: "reading",
                slug: "reading",
                description: "Reading - 5 min",
                completed: false,
              },
              {
                name: "Practice Questions",
                type: "questions",
                slug: "questions",
                description: "quiz - 3 min",
                completed: completedQuiz,
              },
              {
                name: "Coding Exercise 1",
                type: "coding",
                slug: "coding",
                description: "Practical Assesment - 30 min",
                completed: false,
              },
            ]}
          />
          <div className="flex flex-row justify-start ml-8 mt-8">
            <div className="flex flex-col justify-start">
              <Breadcrumbs />
              <div className="px-[150px] py-[80px] space-y-8">
                <h2 className="text-2xl font-bold text-indigo-700 mb-6">
                  Quiz: Introduction to Computer Science
                </h2>

                {material.quizzes?.[0]?.questions.map((q) => {
                  const difficultyMap: Record<
                    string,
                    | "Beginner"
                    | "Base Knowledge"
                    | "Intermediate"
                    | "Advanced"
                    | "Expert"
                  > = {
                    B: "Beginner",
                    K: "Base Knowledge",
                    I: "Intermediate",
                    A: "Advanced",
                    E: "Expert",
                  };

                  const difficulty = difficultyMap[q.difficulty] || "Beginner";

                  if (
                    q.question_type === "choice" ||
                    q.question_type === "multiple_choice"
                  ) {
                    const { question, options } = parseChoiceQuestion(
                      q.question_text
                    );

                    if (q.question_type === "choice") {
                      return (
                        <ChoiceQuestion
                          key={q.id}
                          question={question}
                          options={options}
                          name={`q${q.id}`}
                          difficulty={difficulty}
                          onChange={(answer) =>
                            handleAnswerChange(q.id, answer)
                          }
                          isCorrect={answerResults[q.id]}
                          selectedAnswers={userAnswers[q.id]}
                        />
                      );
                    } else {
                      return (
                        <MultipleChoiceQuestion
                          key={q.id}
                          question={question}
                          options={options}
                          name={`q${q.id}`}
                          difficulty={difficulty}
                          onChange={(answer) =>
                            handleAnswerChange(q.id, answer)
                          }
                          isCorrect={answerResults[q.id]}
                          selectedAnswers={userAnswers[q.id]}
                        />
                      );
                    }
                  }

                  if (q.question_type === "true_false") {
                    return (
                      <TrueFalseQuestion
                        key={q.id}
                        question={q.question_text}
                        name={`q${q.id}`}
                        difficulty={difficulty}
                        onChange={(answer) => handleAnswerChange(q.id, answer)}
                        isCorrect={answerResults[q.id]}
                        selectedAnswer={userAnswers[q.id]?.[0]}
                      />
                    );
                  }

                  if (q.question_type === "open") {
                    return (
                      <OpenEndedQuestion
                        key={q.id}
                        question={q.question_text}
                        difficulty={difficulty}
                        onChange={(answer) => handleAnswerChange(q.id, answer)}
                      />
                    );
                  }

                  return null;
                })}

                <div className="flex flex-row justify-start">
                  <div className="flex flex-col justify-start">
                    <button
                      className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded"
                      onClick={handleSubmit}
                    >
                      Submit
                    </button>
                    <div className="">
                      {score !== null && (
                        <div className="mt-4 text-lg font-medium">
                          <div
                            className={
                              score >= 60 ? "text-green-600" : "text-red-600"
                            }
                          >
                            Your score: {score.toFixed(2)}%
                          </div>
                          {score >= 60 ? (
                            <div className="text-green-700 font-semibold">
                              You passed the quiz! 🎉
                            </div>
                          ) : (
                            <div className="text-red-600 font-semibold">
                              You failed the quiz. 😞
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
