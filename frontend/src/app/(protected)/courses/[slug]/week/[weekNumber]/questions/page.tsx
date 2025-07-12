"use client";

import WeekMenu, { WeekMenuHandle } from "@/src/components/weekMenu";
import Breadcrumbs from "@/src/components/Breadcrumbs";
import MultipleChoiceQuestion from "@/src/components/MultipleChoicQuestion";
import OpenEndedQuestion from "@/src/components/OpenEndedQuestion";
import { Fragment, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/src/lib/axios";
import ChoiceQuestion from "@/src/components/ChoiceQuestion";
import TrueFalseQuestion from "@/src/components/TrueFalseQuestion";
import { Dialog, Transition, Listbox } from "@headlessui/react";
import DifficultySelect from "@/src/components/DifficultySelect";
import LoadingPage from "@/src/components/LoadingPage";
import { motion } from "framer-motion";

interface Question {
  id: number;
  question_text: string;
  difficulty: "B" | "K" | "I" | "A" | "E";
  question_type: "choice" | "multiple_choice" | "true_false" | "open";
  answer: string;
  explanation: string;
}
interface Quiz {
  id: number;
  difficulty: "A" | "I" | "S" | "M" | "N";
  difficulty_display: string;
  passing_requirement_display: number;
  user_score: number;
}
const difficultyOrder = ["A", "I", "S", "M", "N"] as const;
const difficultyLabels: Record<(typeof difficultyOrder)[number], string> = {
  A: "Advanced",
  I: "Intermediate",
  S: "Standard",
  M: "Medium",
  N: "Normal",
};
type Difficulty = (typeof difficultyOrder)[number];

interface Part {
  name: string;
  type: "reading" | "questions" | "coding" | "complete";
  slug: string;
  description: string;
  completed: boolean;
}

export default function WeekQuestions() {
  const [completedQuestions, setCompletedQuestions] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const slug = params?.slug as string;
  const weekNumber = parseInt(params?.weekNumber as string);
  const [userAnswers, setUserAnswers] = useState<Record<number, string[]>>({});
  const [correctAnswers, setCorrectAnswers] = useState<
    Record<number, string[]>
  >({});
  const [score, setScore] = useState(0);
  const [quizDifficulty, setQuizDifficulty] = useState<Difficulty>("S");
  const [answerResults, setAnswerResults] = useState<
    Record<number, "correct" | "incorrect">
  >({});
  const [completedQuiz, setCompletedQuiz] = useState(false);
  const [startedQuiz, setStartedQuiz] = useState(false);
  const [finishedQuiz, setFinishedQuiz] = useState(false);
  const [quiz, setQuiz] = useState<Quiz>({
    id: 0,
    difficulty: "S",
    difficulty_display: "Standard",
    passing_requirement_display: 50,
    user_score: 0,
  });
  const [answerExplanations, setAnswerExplanations] = useState<
    Record<number, string>
  >({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [randomizeQuestions, setRandomizeQuestions] = useState<boolean | null>(
    null
  );
  const [showExplanations, setShowExplanations] = useState(true);
  const menuRef = useRef<WeekMenuHandle>(null);

  function getHigherDifficulty(current: Difficulty): Difficulty {
    const index = difficultyOrder.indexOf(current);
    return index > 0 ? difficultyOrder[index - 1] : current; // Higher is earlier in the list
  }

  function getLowerDifficulty(current: Difficulty): Difficulty {
    const index = difficultyOrder.indexOf(current);
    return index < difficultyOrder.length - 1
      ? difficultyOrder[index + 1]
      : current;
  }

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
    let correct = 0;
    const results: Record<number, "correct" | "incorrect"> = {};

    const openQuestions = [];
    const newExplanations: Record<number, string> = {};

    for (const q of questions) {
      if (q.question_type === "open") {
        openQuestions.push({
          id: q.id,
          user_answer: userAnswers[q.id] || "",
          answer: q.answer,
        });
      } else {
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
    }

    console.log(openQuestions);

    if (openQuestions.length > 0) {
      try {
        setLoading(true);
        const response = await api.post(
          `/courses/${slug}/weeks/${weekNumber}/quizzes/evaluate_open_questions/`,
          openQuestions
        );

        console.log(response.data);

        const openResults = await response.data;
        for (const item of openResults) {
          console.log(item.is_correct);
          if (item.is_correct == "true") {
            correct += 1;
            results[item.id] = "correct";
            console.log("correct");
          } else {
            results[item.id] = "incorrect";
            console.log("incorrect");
          }
          if (item.explanation) {
            newExplanations[item.id] = item.explanation;
          }
        }
      } catch (error) {
        console.error("Error evaluating open questions:", error);
      }
    }

    const total = questions.length;
    const percentage = (correct / total) * 100;
    if (percentage > 60) {
      setCompletedQuiz(true);
    }
    setScore(percentage);
    setAnswerResults(results);
    setAnswerExplanations((prev) => ({ ...prev, ...newExplanations }));
    console.log(results);
    setLoading(false);
    console.log({ user_score: percentage });
    try {
      await api.put(
        `/courses/${slug}/weeks/${weekNumber}/quizzes/${quizDifficulty}/set_user_score/`,
        { user_score: percentage }
      );
      console.log("Score saved successfully");
    } catch (err) {
      console.error("Failed to save score:", err);
    }
  };
  useEffect(() => {
    async function fetchSidebar() {
      try {
        const res = await api.get(
          `/courses/${slug}/weeks/${weekNumber}/get_completion/`
        );
        const data = res.data;
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
  }, [slug, weekNumber]);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const res = await api.get(
          `/courses/${slug}/weeks/${weekNumber}/quizzes/${quizDifficulty}/`
        );
        const data = res.data;
        // console.log(data);
        setQuiz(data);
        setQuestions(data.questions);
      } catch (error) {
        console.error("Failed to load Quizzes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuizzes();
  }, [quizDifficulty]);

  async function fetchCourse(difficulty: string) {
    // console.log(`/courses/${slug}/weeks/${weekNumber}/quizzes/${difficulty}`);
    try {
      if (randomizeQuestions) {
        const res = await api.put(
          `/courses/${slug}/weeks/${weekNumber}/quizzes/${difficulty}/`
        );
        const data = res.data;
        setQuiz(data.quiz);
        setQuestions(data.quiz.questions);
        for (const q of data.quiz.questions) {
          setCorrectAnswers((prev) => ({ ...prev, [q.id]: q.answer }));
        }
        // console.log(data);
        // console.log(correctAnswers);
      } else {
        const res = await api.get(
          `/courses/${slug}/weeks/${weekNumber}/quizzes/${difficulty}/`
        );
        const data = res.data;
        setQuiz(data);
        setQuestions(data.questions);
        for (const q of data.questions) {
          setCorrectAnswers((prev) => ({ ...prev, [q.id]: q.answer }));
        }
        console.log(data);
      }
    } catch (error) {
      console.error("Failed to load course:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingPage />;
  if (!questions) return <div className="p-10">Questions not found.</div>;
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Animated Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-20 -right-32 w-72 h-72 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full opacity-25 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99,102,241,0.3) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      <div className="relative z-10 pt-20">
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0 p-6">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 sticky top-24">
              <WeekMenu ref={menuRef} parts={parts} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumbs */}
              <div className="mb-6">
                <Breadcrumbs />
              </div>

              {/* Quiz Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20 mb-8"
              >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Quiz: Introduction to Computer Science
                </h1>
                <p className="text-gray-600">Test your knowledge from this week's materials</p>
              </motion.div>

              {/* Quiz Overview Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20 mb-8"
              >
                {!startedQuiz && (
                  <div className="text-center">
                    {/* Quiz Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </motion.div>

                    {/* Quiz Overview Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className={`rounded-xl p-6 shadow-lg backdrop-blur-sm max-w-md mx-auto mb-6 ${
                        quiz.user_score >= quiz.passing_requirement_display
                          ? "bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50"
                          : "bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h2 className={`text-xl font-bold ${
                          quiz.user_score >= quiz.passing_requirement_display
                            ? "text-green-800"
                            : "text-indigo-800"
                        }`}>
                          Quiz Overview
                        </h2>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setIsSettingsOpen(true)}
                          className={`p-2 rounded-full transition-colors ${
                            quiz.user_score >= quiz.passing_requirement_display
                              ? "bg-green-100 hover:bg-green-200"
                              : "bg-indigo-100 hover:bg-indigo-200"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className={`w-5 h-5 ${
                              quiz.user_score >= quiz.passing_requirement_display
                                ? "text-green-600"
                                : "text-indigo-600"
                            }`}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                          </svg>
                        </motion.button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${
                            quiz.user_score >= quiz.passing_requirement_display
                              ? "text-green-700"
                              : "text-indigo-700"
                          }`}>
                            Difficulty
                          </span>
                          <span className={`font-semibold ${
                            quiz.user_score >= quiz.passing_requirement_display
                              ? "text-green-900"
                              : "text-indigo-900"
                          }`}>
                            {quiz.difficulty_display}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${
                            quiz.user_score >= quiz.passing_requirement_display
                              ? "text-green-700"
                              : "text-indigo-700"
                          }`}>
                            Passing Score
                          </span>
                          <span className={`font-semibold ${
                            quiz.user_score >= quiz.passing_requirement_display
                              ? "text-green-900"
                              : "text-indigo-900"
                          }`}>
                            {quiz.passing_requirement_display}%
                          </span>
                        </div>

                        {quiz.user_score > 0 && (
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${
                              quiz.user_score >= quiz.passing_requirement_display
                                ? "text-green-700"
                                : "text-indigo-700"
                            }`}>
                              Your Previous Score
                            </span>
                            <span className={`font-semibold ${
                              quiz.user_score >= quiz.passing_requirement_display
                                ? "text-green-900"
                                : "text-indigo-900"
                            }`}>
                              {quiz.user_score}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Completion Requirement Notice */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="p-1 bg-amber-100 rounded-full mt-0.5">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-4 h-4 text-amber-600"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-amber-800 mb-1">
                              Completion Requirement
                            </p>
                            <p className="text-xs text-amber-700">
                              To complete this section, you must pass the quiz at{" "}
                              <span className="font-semibold text-amber-900">
                                Intermediate
                              </span>{" "}
                              difficulty or higher.
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Settings Modal */}
                      <Transition appear show={isSettingsOpen} as={Fragment}>
                        <Dialog
                          as="div"
                          className="relative z-50"
                          onClose={() => setIsSettingsOpen(false)}
                        >
                          <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                          </Transition.Child>

                          <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4">
                              <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                              >
                                <Dialog.Panel className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-lg p-8 text-left shadow-2xl transition-all border border-white/30">
                                  {/* Header */}
                                  <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-center justify-between mb-6"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          strokeWidth={2}
                                          stroke="currentColor"
                                          className="w-5 h-5 text-white"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                                          />
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                          />
                                        </svg>
                                      </div>
                                      <div>
                                        <Dialog.Title
                                          as="h3"
                                          className="text-xl font-bold text-gray-900"
                                        >
                                          Quiz Settings
                                        </Dialog.Title>
                                        <p className="text-sm text-gray-600">
                                          Customize your quiz experience
                                        </p>
                                      </div>
                                    </div>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => setIsSettingsOpen(false)}
                                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-4 h-4 text-gray-600"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                    </motion.button>
                                  </motion.div>

                                  {/* Settings Content */}
                                  <div className="space-y-6">
                                    {/* Difficulty Select */}
                                    <motion.div
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.4, delay: 0.1 }}
                                      className="space-y-3"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                                        <label className="text-sm font-semibold text-gray-800">
                                          Difficulty Level
                                        </label>
                                      </div>
                                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                                        <DifficultySelect
                                          quizDifficulty={quizDifficulty}
                                          setQuizDifficulty={setQuizDifficulty}
                                        />
                                        
                                        {/* Requirement Notice in Settings */}
                                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                          <div className="flex items-start space-x-2">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              strokeWidth={2}
                                              stroke="currentColor"
                                              className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                                              />
                                            </svg>
                                            <div>
                                              <p className="text-xs font-semibold text-amber-800 mb-1">
                                                Section Requirement
                                              </p>
                                              <p className="text-xs text-amber-700">
                                                You must pass at <span className="font-semibold">Intermediate</span> difficulty or higher to complete this section.
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>

                                    {/* Show Explanations Toggle */}
                                    <motion.div
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.4, delay: 0.2 }}
                                      className="space-y-3"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                                        <label className="text-sm font-semibold text-gray-800">
                                          Show Explanations
                                        </label>
                                      </div>
                                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                                        <p className="text-xs text-purple-700 mb-3">
                                          Display detailed explanations after completing the quiz
                                        </p>
                                        <div className="flex space-x-2">
                                          <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                                              showExplanations
                                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105"
                                                : "bg-white/80 text-gray-700 hover:bg-white border border-gray-200"
                                            }`}
                                            onClick={() => setShowExplanations(true)}
                                          >
                                            <div className="flex items-center justify-center space-x-2">
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="w-4 h-4"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                              </svg>
                                              <span>Yes</span>
                                            </div>
                                          </motion.button>
                                          <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                                              !showExplanations
                                                ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg transform scale-105"
                                                : "bg-white/80 text-gray-700 hover:bg-white border border-gray-200"
                                            }`}
                                            onClick={() => setShowExplanations(false)}
                                          >
                                            <div className="flex items-center justify-center space-x-2">
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="w-4 h-4"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  d="M6 18L18 6M6 6l12 12"
                                                />
                                              </svg>
                                              <span>No</span>
                                            </div>
                                          </motion.button>
                                        </div>
                                      </div>
                                    </motion.div>

                                    {/* Quiz Tips */}
                                    <motion.div
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.4, delay: 0.3 }}
                                      className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200"
                                    >
                                      <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                                        <span className="text-sm font-semibold text-emerald-800">
                                          Quiz Tips
                                        </span>
                                      </div>
                                      <ul className="text-xs text-emerald-700 space-y-1">
                                        <li>• Read each question carefully before answering</li>
                                        <li>• You can change your answers before submitting</li>
                                        <li>• Higher difficulty levels offer more challenging questions</li>
                                        <li>• Take your time - there's no time limit</li>
                                      </ul>
                                    </motion.div>
                                  </div>

                                  {/* Action Buttons */}
                                  <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.4 }}
                                    className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200"
                                  >
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      type="button"
                                      className="px-6 py-3 rounded-xl border-2 border-gray-200 bg-white/80 text-gray-700 font-medium hover:bg-white hover:border-gray-300 transition-all duration-200"
                                      onClick={() => setIsSettingsOpen(false)}
                                    >
                                      Cancel
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      type="button"
                                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                      onClick={() => setIsSettingsOpen(false)}
                                    >
                                      <div className="flex items-center space-x-2">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          strokeWidth={2}
                                          stroke="currentColor"
                                          className="w-4 h-4"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                          />
                                        </svg>
                                        <span>Save Settings</span>
                                      </div>
                                    </motion.button>
                                  </motion.div>
                                </Dialog.Panel>
                              </Transition.Child>
                            </div>
                          </div>
                        </Dialog>
                      </Transition>
                    </motion.div>

                    {/* Requirement Message */}
                    {showRequirements && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className="text-center mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 max-w-md mx-auto"
                      >
                        To complete this section, you must pass the quiz at{" "}
                        <span className="font-semibold text-amber-900">
                          Intermediate
                        </span>{" "}
                        difficulty or higher.
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="flex flex-col sm:flex-row justify-center gap-4"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                        onClick={async () => {
                          await fetchCourse(quizDifficulty);
                          setStartedQuiz(true);
                        }}
                      >
                        Start Quiz
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 rounded-xl bg-white border-2 border-indigo-200 text-indigo-700 font-semibold hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                        onClick={() => {
                          menuRef.current?.goToNextPart();
                        }}
                      >
                        Skip to Next Section
                      </motion.button>
                    </motion.div>
                  </div>
                )}

                {/* Quiz Questions */}
                {startedQuiz && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                  >
                    {questions.map((q, index) => {
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

                      return (
                        <motion.div
                          key={q.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 overflow-hidden"
                        >
                          {q.question_type === "choice" ||
                          q.question_type === "multiple_choice" ? (
                            (() => {
                              const { question, options } = parseChoiceQuestion(
                                q.question_text
                              );

                              if (q.question_type === "choice") {
                                return (
                                  <ChoiceQuestion
                                    question={question}
                                    options={options}
                                    name={`q${q.id}`}
                                    difficulty={difficulty}
                                    onChange={(answer) =>
                                      handleAnswerChange(q.id, answer)
                                    }
                                    isCorrect={answerResults[q.id]}
                                    selectedAnswers={userAnswers[q.id]}
                                    answer={q.answer}
                                    isSubmitted={finishedQuiz}
                                    explanation={q.explanation}
                                    showExplanations={showExplanations}
                                  />
                                );
                              } else {
                                return (
                                  <MultipleChoiceQuestion
                                    question={question}
                                    options={options}
                                    name={`q${q.id}`}
                                    difficulty={difficulty}
                                    onChange={(answer) =>
                                      handleAnswerChange(q.id, answer)
                                    }
                                    isCorrect={answerResults[q.id]}
                                    selectedAnswers={userAnswers[q.id]}
                                    answer={q.answer}
                                    isSubmitted={finishedQuiz}
                                    explanation={q.explanation}
                                    showExplanations={showExplanations}
                                  />
                                );
                              }
                            })()
                          ) : q.question_type === "true_false" ? (
                            <TrueFalseQuestion
                              question={q.question_text}
                              name={`q${q.id}`}
                              difficulty={difficulty}
                              onChange={(answer) =>
                                handleAnswerChange(q.id, answer)
                              }
                              isCorrect={answerResults[q.id]}
                              selectedAnswer={userAnswers[q.id]?.[0]}
                              answer={q.answer}
                              isSubmitted={finishedQuiz}
                              explanation={q.explanation}
                              showExplanations={showExplanations}
                            />
                          ) : q.question_type === "open" ? (
                            <OpenEndedQuestion
                              question={q.question_text}
                              difficulty={difficulty}
                              onChange={(answer) =>
                                handleAnswerChange(q.id, answer)
                              }
                              isCorrect={answerResults[q.id]}
                              value={userAnswers[q.id] || []}
                              isSubmitted={finishedQuiz}
                              answer={q.answer}
                              explanation={answerExplanations[q.id]}
                              showExplanations={showExplanations}
                            />
                          ) : null}
                        </motion.div>
                      );
                    })}

                    {/* Submit Button and Results */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="text-center pt-6"
                    >
                      {!finishedQuiz && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                          onClick={() => {
                            handleSubmit();
                            setFinishedQuiz(true);
                          }}
                        >
                          Submit Quiz
                        </motion.button>
                      )}

                      {finishedQuiz && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20 mb-6"
                        >
                          <div className="text-center">
                            {/* Celebration Animation for Passing */}
                            {score >= quiz.passing_requirement_display && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="mb-6"
                              >
                                <motion.div
                                  animate={{ 
                                    rotate: [0, 360],
                                    scale: [1, 1.2, 1]
                                  }}
                                  transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                  className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-10 h-10 text-white"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </motion.div>
                              </motion.div>
                            )}

                            {/* Score Display */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              className="mb-4"
                            >
                              <div className="text-3xl font-bold text-gray-900 mb-2">
                                Your Score: {score.toFixed(1)}%
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${score}%` }}
                                  transition={{ duration: 1, delay: 0.5 }}
                                  className={`h-3 rounded-full ${
                                    score >= quiz.passing_requirement_display
                                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                      : "bg-gradient-to-r from-amber-500 to-orange-500"
                                  }`}
                                />
                              </div>
                            </motion.div>

                            {/* Success/Failure Message */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.4 }}
                              className="mb-6"
                            >
                              {score >= quiz.passing_requirement_display ? (
                                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                  <div className="text-green-800 font-semibold text-lg mb-2">
                                    🎉 Congratulations! Quiz Passed!
                                  </div>
                                  <p className="text-green-700">
                                    You've successfully passed the quiz with a score of {score.toFixed(1)}%!
                                    <br />
                                    Required: {quiz.passing_requirement_display}%
                                  </p>
                                </div>
                              ) : (
                                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                                  <div className="text-amber-800 font-semibold text-lg mb-2">
                                    📚 Keep Learning!
                                  </div>
                                  <p className="text-amber-700">
                                    You scored {score.toFixed(1)}% - you need {quiz.passing_requirement_display}% to pass.
                                    <br />
                                    Review the material and try again!
                                  </p>
                                </div>
                              )}
                            </motion.div>

                            {/* Action Buttons */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.6 }}
                              className="flex flex-col sm:flex-row justify-center gap-4"
                            >
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg"
                                onClick={async () => {
                                  setStartedQuiz(false);
                                  setFinishedQuiz(false);
                                  setAnswerResults({});
                                  setUserAnswers({});
                                  setAnswerExplanations({});
                                  window.scrollTo({ top: 0 });
                                  await fetchCourse(quizDifficulty);
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-4 h-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                                  />
                                </svg>
                                Retake Quiz
                              </motion.button>

                              {score >= quiz.passing_requirement_display && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all shadow-lg"
                                  onClick={() => {
                                    menuRef.current?.goToNextPart();
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-4 h-4"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M13.5 4.5L21 12l-7.5 7.5M3 12h16.5"
                                    />
                                  </svg>
                                  Continue to Next Section
                                </motion.button>
                              )}

                              {score >= quiz.passing_requirement_display &&
                                quizDifficulty !== "A" && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all shadow-lg"
                                    onClick={async () => {
                                      setStartedQuiz(false);
                                      setFinishedQuiz(false);
                                      setAnswerResults({});
                                      setUserAnswers({});
                                      setAnswerExplanations({});
                                      window.scrollTo({ top: 0 });
                                      await fetchCourse(
                                        getHigherDifficulty(quizDifficulty)
                                      );
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="w-4 h-4"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4.5 15.75l7.5-7.5 7.5 7.5"
                                      />
                                    </svg>
                                    Try Higher Difficulty
                                  </motion.button>
                                )}
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
