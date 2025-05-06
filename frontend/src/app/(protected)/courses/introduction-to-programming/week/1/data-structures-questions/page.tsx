"use client";
import Header from "@/src/components/Header";
import WeekMenu from "@/src/components/weekMenu";
import Breadcrumbs from "@/src/components/Breadcrumbs";
import MultipleChoiceQuestion from "@/src/components/MultipleChoiceQuestion";
import OpenEndedQuestion from "@/src/components/OpenEndedQuestion";
import FillInTheBlankQuestion from "@/src/components/FillInTheBlankQuestion";

export default function Week1Questions() {
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
                slug: "data-structures-reading",
                description: "Reading - 5 min",
                completed: false,
              },
              {
                name: "Practice Questions",
                type: "questions",
                slug: "data-structures-questions",
                description: "quiz - 3 min",
                completed: false,
              },
              {
                name: "Coding Exercise 1",
                type: "coding",
                slug: "data-structures-coding",
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

                <MultipleChoiceQuestion
                  question="Which of the following best defines Computer Science?"
                  options={[
                    "The study of computer brands and their pricing",
                    "The study of computers and computational systems",
                    "The repair and assembly of computer hardware",
                    "Using computers for social media and entertainment",
                  ]}
                  name="q1"
                  difficulty="Beginner"
                />

                <MultipleChoiceQuestion
                  question="Which programming language is often recommended for beginners?"
                  options={["Python", "Assembly", "COBOL", "Brainfuck"]}
                  name="q2"
                  difficulty="Beginner"
                />

                <OpenEndedQuestion
                  question="In your own words, what is an algorithm?"
                  difficulty="Intermediate"
                />

                <FillInTheBlankQuestion
                  prompt="A _____ is a step-by-step procedure or formula for solving a problem."
                  difficulty="Beginner"
                />
                <div className="flex flex-row justify-start">
                  <button
                    className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded"
                    onClick={() => {}}
                  >
                    submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
