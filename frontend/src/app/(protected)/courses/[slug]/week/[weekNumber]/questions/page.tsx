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
type Difficulty = (typeof difficultyOrder)[number];

export default function WeekQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const slug = params?.slug as string;
  const weekNumber = parseInt(params?.weekNumber as string);
  const [userAnswers, setUserAnswers] = useState<Record<number, string[]>>({});
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
          if (item.is_correct == "true") {
            correct += 1;
            results[item.id] = "correct";
          } else {
            results[item.id] = "incorrect";
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
    async function fetchQuizzes() {
      try {
        const res = await api.get(
          `/courses/${slug}/weeks/${weekNumber}/quizzes/${quizDifficulty}/`
        );
        const data = res.data;
        console.log(data);
        setQuiz(data);
        setQuestions(data.questions);
      } catch (error) {
        console.error("Failed to load Quizzes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuizzes();
  }, []);

  async function fetchCourse(difficulty: string) {
    console.log(`/courses/${slug}/weeks/${weekNumber}/quizzes/${difficulty}`);
    try {
      const res = await api.get(
        `/courses/${slug}/weeks/${weekNumber}/quizzes/${difficulty}`
      );
      const data = res.data;
      setQuiz(data);
      setQuestions(data.questions);
      console.log(data);
    } catch (error) {
      console.error("Failed to load course:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-10">Loading course...</div>;
  if (!questions) return <div className="p-10">Questions not found.</div>;
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

                {!startedQuiz && (
                  <div className="">
                    <div className="rounded-md border border-gray-600 bg-indigo-50 p-6 shadow-sm space-y-4 max-w-md mx-auto mb-4 ">
                      <h2 className="text-xl font-semibold text-indigo-700">
                        Quiz Overview
                      </h2>

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
                    </div>
                    <button
                      className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 px-4 ml-2 rounded"
                      onClick={async () => {
                        await fetchCourse(quizDifficulty);
                        setStartedQuiz(true);
                      }}
                    >
                      start the quiz
                    </button>
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
                            explanation={q.explanation}
                            isSubmitted={finishedQuiz}
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
                            explanation={q.explanation}
                            isSubmitted={finishedQuiz}
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
                          isSubmitted={finishedQuiz}
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
                          onChange={(answer) =>
                            handleAnswerChange(q.id, answer)
                          }
                          isCorrect={answerResults[q.id]}
                          value={userAnswers[q.id] || []}
                          isSubmitted={finishedQuiz}
                          answer={q.answer}
                          explanation={q.explanation}
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
