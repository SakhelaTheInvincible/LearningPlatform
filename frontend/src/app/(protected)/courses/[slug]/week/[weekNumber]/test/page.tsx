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
  difficulty: "N" | "M" | "S" | "I" | "A";
  difficulty_display: string;
  passing_requirement: string;
  passing_requirement_display: string;
  user_score: number;
  questions?: Question[];
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
  const [selectedDifficulty, setSelectedDifficulty] = useState<"N" | "M" | "S" | "I" | "A">("S");
  const [answerResults, setAnswerResults] = useState<Record<number, "correct" | "incorrect">>({});
  const [completedQuiz, setCompletedQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const difficultyOptions = [
    { value: "N", label: "Normal" },
    { value: "M", label: "Medium" },
    { value: "S", label: "Standard" },
    { value: "I", label: "Intermediate" },
    { value: "A", label: "Advanced" },
  ];

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

  const handleSubmit = async () => {
    if (!currentQuiz?.questions) return;

    const questions = currentQuiz.questions;
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
    
    try {
      await api.put(`/courses/${slug}/weeks/${weekNumber}/quizzes/set_user_score/`, {
        user_score: percentage
      });
      
      if (percentage >= parseInt(currentQuiz.passing_requirement)) {
        setCompletedQuiz(true);
      }
      setScore(percentage);
      setAnswerResults(results);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to update score:", error);
    }
  };

  const fetchQuiz = async (difficulty: string) => {
    try {
      const res = await api.get(`/courses/${slug}/weeks/${weekNumber}/quizzes/${difficulty}/`);
      setCurrentQuiz(res.data);
      setUserAnswers({});
      setAnswerResults({});
      setScore(null);
      setIsSubmitted(false);
    } catch (error) {
      console.error("Failed to load quiz:", error);
    }
  };

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await api.get(`/courses/${slug}/week/${weekNumber}`);
        const data = res.data;
        setMaterial(data);
        if (data.quizzes?.length > 0) {
          fetchQuiz(selectedDifficulty);
        }
      } catch (error) {
        console.error("Failed to load course:", error);
      } finally {
        setLoading(false);
      }
    }

    if (slug && weekNumber) fetchCourse();
  }, [slug, weekNumber]);

  useEffect(() => {
    if (material?.quizzes && material.quizzes.length > 0) {
      fetchQuiz(selectedDifficulty);
    }
  }, [selectedDifficulty]);

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
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-indigo-700">
                    Quiz: Introduction to Computer Science
                  </h2>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value as "N" | "M" | "S" | "I" | "A")}
                    className="border border-gray-300 rounded-md px-4 py-2"
                  >
                    {difficultyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {currentQuiz?.questions?.map((q) => {
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
                          selectedAnswers={userAnswers[q.id] || []}
                          isSubmitted={isSubmitted}
                          answer={q.answer}
                          explanation={q.explanation}
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
                          selectedAnswers={userAnswers[q.id] || []}
                          isSubmitted={isSubmitted}
                          answer={q.answer}
                          explanation={q.explanation}
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
                        isSubmitted={isSubmitted}
                        answer={q.answer}
                        explanation={q.explanation}
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
                        isCorrect={answerResults[q.id]}
                        value={userAnswers[q.id] || []}
                        isSubmitted={isSubmitted}
                        answer={q.answer}
                        explanation={q.explanation}
                      />
                    );
                  }
                })}

                {currentQuiz?.questions && (
                  <div className="flex justify-end mt-8">
                    <button
                      onClick={handleSubmit}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                    >
                      Submit
                    </button>
                  </div>
                )}

                {score !== null && (
                  <div className="mt-8 p-4 bg-gray-100 rounded-md">
                    <h3 className="text-lg font-semibold">Your Score: {score.toFixed(1)}%</h3>
                    <p className="text-sm text-gray-600">
                      Passing Requirement: {currentQuiz?.passing_requirement_display}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
