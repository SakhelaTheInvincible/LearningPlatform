import React from "react";
import ChoiceQuestion from "@/src/components/ChoiceQuestion";
import MultipleChoiceQuestion from "@/src/components/MultipleChoicQuestion";
import OpenEndedQuestion from "@/src/components/OpenEndedQuestion";

// Define a Question type for demonstration
interface Question {
  type: "choice" | "multiple_choice" | "open";
  text: string;
  options?: string[];
  difficulty: "Beginner" | "Base Knowledge" | "Intermediate" | "Advanced" | "Expert";
  isCorrect?: "correct" | "incorrect";
  selectedAnswer?: string;
  selectedAnswers?: string[];
  userAnswer?: string;
  answer: string;
  explanation?: string;
}

// Dummy data for demonstration; replace with real data source as needed
const quiz = {
  questions: [
    {
      type: "choice",
      text: "What is 2 + 2?",
      options: ["3", "4", "5"],
      difficulty: "Beginner",
      isCorrect: undefined,
      selectedAnswer: undefined,
      answer: "4",
      explanation: "2 + 2 equals 4.",
    },
  ] as Question[],
};

export default function TestPage() {
  // Replace with real logic to fetch quiz/questions
  // const quiz = ...
  const isSubmitted = false;
  const handleAnswerChange = (index: number, answer: string | string[]) => {};

  return (
    <div>
      {quiz.questions.map((question, index) => {
        if (question.type === "choice") {
          return (
            <ChoiceQuestion
              key={index}
              question={question.text}
              options={question.options || []}
              name={`question-${index}`}
              difficulty={question.difficulty}
              onChange={(answer) => handleAnswerChange(index, answer)}
              isCorrect={question.isCorrect}
              selectedAnswers={question.selectedAnswers}
              isSubmitted={isSubmitted}
              answer={question.answer}
              explanation={question.explanation}
            />
          );
        } else if (question.type === "multiple_choice") {
          return (
            <MultipleChoiceQuestion
              key={index}
              question={question.text}
              options={question.options || []}
              name={`question-${index}`}
              difficulty={question.difficulty}
              onChange={(answers) => handleAnswerChange(index, answers)}
              isCorrect={question.isCorrect}
              selectedAnswers={question.selectedAnswers}
              isSubmitted={isSubmitted}
              answer={question.answer}
              explanation={question.explanation}
            />
          );
        } else {
          return (
            <OpenEndedQuestion
              key={index}
              question={question.text}
              difficulty={question.difficulty}
              onChange={(answer) => handleAnswerChange(index, answer)}
              isCorrect={question.isCorrect}
              value={question.selectedAnswers || []}
              isSubmitted={isSubmitted}
              answer={question.answer}
              explanation={question.explanation}
            />
          );
        }
      })}
    </div>
  );
} 