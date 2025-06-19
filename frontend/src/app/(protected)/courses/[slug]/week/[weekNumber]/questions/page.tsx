"use client";
import Header from "@/src/components/Header";
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
    <>
      <div className="flex flex-col">
        <Header />
        <div className="flex flex-row justify-start mt-16 bg-white ">
          <WeekMenu ref={menuRef} parts={parts} />
          <div className="flex flex-row justify-start ml-8 mt-8">
            <div className="flex flex-col justify-start">
              <Breadcrumbs />
              <div className="px-[150px] py-[80px] space-y-8">
                <h2 className="text-2xl font-bold text-indigo-700 mb-6">
                  Quiz: Introduction to Computer Science
                </h2>

                {!startedQuiz && (
                  <div className="">
                    <div className="rounded-md border border-gray-600 bg-indigo-50 p-6 shadow-sm space-y-4 max-w-md mx-auto mb-4 ">
                      <div className="flex flex-row justify-between">
                        <h2 className="text-xl font-semibold text-indigo-700">
                          Quiz Overview
                        </h2>
                        <div className="">
                          <button onClick={() => setIsSettingsOpen(true)}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="size-6 hover:text-indigo-600 hover:cursor-pointer"
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
                          </button>
                          <Transition
                            appear
                            show={isSettingsOpen}
                            as={Fragment}
                          >
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
                                <div className="fixed inset-0 bg-gray-700/50" />
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
                                    <Dialog.Panel className="relative w-full max-w-md transform overflow-visible rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all space-y-4">
                                      <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-indigo-700"
                                      >
                                        Quiz Settings
                                      </Dialog.Title>

                                      {/* Difficulty Select */}
                                      <div className="">
                                        <label className="block text-sm font-medium text-gray-700">
                                          Difficulty
                                        </label>
                                        <DifficultySelect
                                          quizDifficulty={quizDifficulty}
                                          setQuizDifficulty={setQuizDifficulty}
                                        />
                                      </div>

                                      {/* Randomization Choice */}
                                      {/* <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700 mt-8">
                                          Randomize Questions?
                                        </label>
                                        <div className="flex gap-3">
                                          <button
                                            className={`px-4 py-2 rounded ${
                                              randomizeQuestions
                                                ? "bg-indigo-600 text-white"
                                                : "bg-gray-200"
                                            }`}
                                            onClick={() =>
                                              setRandomizeQuestions(true)
                                            }
                                          >
                                            Yes
                                          </button>
                                          <button
                                            className={`px-4 py-2 rounded ${
                                              randomizeQuestions === false
                                                ? "bg-indigo-600 text-white"
                                                : "bg-gray-200"
                                            }`}
                                            onClick={() =>
                                              setRandomizeQuestions(false)
                                            }
                                          >
                                            No
                                          </button>
                                        </div>
                                      </div> */}
                                      {/* explanations */}
                                      <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
                                          Show explataions?
                                        </label>
                                        <div className="flex gap-3">
                                          <button
                                            className={`px-4 py-2 rounded ${
                                              showExplanations
                                                ? "bg-indigo-600 text-white"
                                                : "bg-gray-200"
                                            }`}
                                            onClick={() =>
                                              setShowExplanations(true)
                                            }
                                          >
                                            Yes
                                          </button>
                                          <button
                                            className={`px-4 py-2 rounded ${
                                              showExplanations === false
                                                ? "bg-indigo-600 text-white"
                                                : "bg-gray-200"
                                            }`}
                                            onClick={() =>
                                              setShowExplanations(false)
                                            }
                                          >
                                            No
                                          </button>
                                        </div>
                                      </div>

                                      {/* Actions */}
                                      <div className="mt-8 flex justify-end gap-2">
                                        <button
                                          type="button"
                                          className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                                          onClick={() =>
                                            setIsSettingsOpen(false)
                                          }
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="button"
                                          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                                          onClick={() =>
                                            setIsSettingsOpen(false)
                                          }
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </Dialog.Panel>
                                  </Transition.Child>
                                </div>
                              </div>
                            </Dialog>
                          </Transition>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-indigo-700 font-medium">
                          Difficulty
                        </span>
                        <span className="text-indigo-900">
                          {quiz.difficulty_display}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-indigo-700 font-medium">
                          Passing Score
                        </span>
                        <span className="text-indigo-900">
                          {quiz.passing_requirement_display}%
                        </span>
                      </div>

                      {true && (
                        <div className="flex items-center justify-between">
                          <span className="text-indigo-700 font-medium">
                            Your Previous Score
                          </span>
                          <span className="text-indigo-900">
                            {quiz.user_score}%
                          </span>
                        </div>
                      )}
                      {/* Requirement message */}
                      <button
                        onClick={() => setShowRequirements((prev) => !prev)}
                        className="text-sm text-indigo-700 hover:cursor-pointer"
                      >
                        {showRequirements
                          ? "Hide requirements"
                          : "Show requirements"}
                      </button>
                      {showRequirements && (
                        <div className="text-center mt-4 text-sm text-gray-600 max-w-md mx-auto px-2">
                          To complete this section, you must pass the quiz at{" "}
                          <span className="font-medium text-indigo-700">
                            Intermediate
                          </span>{" "}
                          difficulty or higher.
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row justify-between">
                      <button
                        className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 px-4 ml-2 rounded hover:cursor-pointer"
                        onClick={async () => {
                          await fetchCourse(quizDifficulty);
                          setStartedQuiz(true);
                        }}
                      >
                        start the quiz
                      </button>
                      <button
                        className="hover:bg-indigo-500 bg-indigo-600 text-white p-2 rounded hover:cursor-pointer"
                        onClick={() => {
                          menuRef.current?.goToNextPart();
                        }}
                      >
                        Move to the next section
                      </button>
                    </div>
                  </div>
                )}

                {startedQuiz &&
                  questions.map((q) => {
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

                    const difficulty =
                      difficultyMap[q.difficulty] || "Beginner";

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
                            answer={q.answer}
                            isSubmitted={finishedQuiz}
                            explanation={q.explanation}
                            showExplanations={showExplanations}
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
                            answer={q.answer}
                            isSubmitted={finishedQuiz}
                            explanation={q.explanation}
                            showExplanations={showExplanations}
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
                      );
                    }

                    if (q.question_type === "open") {
                      return (
                        <OpenEndedQuestion
                          key={q.id}
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
                      );
                    }

                    return null;
                  })}

                {startedQuiz && (
                  <div className="flex flex-col justify-start">
                    <div className="">
                      {!finishedQuiz && (
                        <button
                          className="bg-indigo-500 hover:bg-indigo-600 text-white py-1 px-4 rounded"
                          onClick={() => {
                            handleSubmit();
                            setFinishedQuiz(true);
                          }}
                        >
                          Submit
                        </button>
                      )}
                      <div className="">
                        {finishedQuiz && (
                          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm  mb-4">
                            <div className="text-xl font-semibold text-gray-800">
                              Your Score: {score.toFixed(2)} / 100
                            </div>

                            {score >= quiz.passing_requirement_display ? (
                              <div className="text-gray-700">
                                Great job! You've successfully passed the quiz.
                              </div>
                            ) : (
                              <div className="text-gray-700">
                                You did not pass this time. Review the material
                                and try again!
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {finishedQuiz && (
                        <div className="flex flex-row justify-between">
                          <div className="">
                            <button
                              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-1 pl-2 pr-4 rounded"
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
                                className="size-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                                />
                              </svg>
                              <span>retake the quiz</span>
                            </button>
                          </div>
                          <div className="">
                            {score >= quiz.passing_requirement_display &&
                              quizDifficulty != "A" && (
                                <button
                                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-1 pl-2 pr-4 rounded"
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
                                    setQuizDifficulty(
                                      getHigherDifficulty(quizDifficulty)
                                    );
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="size-4"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                                    />
                                  </svg>
                                  <span>Increase difficulty</span>
                                </button>
                              )}
                            {score < quiz.passing_requirement_display &&
                              quizDifficulty != "N" && (
                                <button
                                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-1 pl-2 pr-4 rounded"
                                  onClick={async () => {
                                    setStartedQuiz(false);
                                    setFinishedQuiz(false);
                                    setAnswerResults({});
                                    setUserAnswers({});
                                    setAnswerExplanations({});
                                    window.scrollTo({ top: 0 });
                                    await fetchCourse(
                                      getLowerDifficulty(quizDifficulty)
                                    );
                                    setQuizDifficulty(
                                      getLowerDifficulty(quizDifficulty)
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
                                      d="m4.5 4.5 15 15m0 0V8.25m0 11.25H8.25"
                                    />
                                  </svg>
                                  <span>Decrease difficulty</span>
                                </button>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
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
