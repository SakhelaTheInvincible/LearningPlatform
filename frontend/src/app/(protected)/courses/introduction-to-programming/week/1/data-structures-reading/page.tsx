"use client";
import { useState } from "react";
import Header from "@/src/components/Header";
import WeekMenu from "@/src/components/weekMenu";
import Breadcrumbs from "@/src/components/Breadcrumbs";

export default function Week1Reading() {
  const [completedReading, setCompletedReading] = useState(false);
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
                completed: completedReading,
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
              <div className="px-[150px] py-[80px]">
                <div className="text-xl text-center mt-[50px] mb-[100px]">
                  Welcome to Algorithms, Part I
                </div>
                <div className="text-xl"></div>
                Thanks for enrolling in our course Algorithms, Part I. You can
                review the syllabus for an overview of the course components.
                The course is based on a variety of material that we have
                prepared over many years: The lecture videos, lecture slides,
                programming assignments, and `&#34;`job interview`&#34;`
                questions will be released weekly on the course website. Our
                textbook Algorithms, 4th edition is the basic reference for the
                material we will be covering. Although the lectures are designed
                to be self-contained, we will assign optional readings for
                students who wish more extensive coverage of the material. Our
                booksite , which is open to everyone and contains a wealth of
                supplementary information, including synopses of the textbook
                and Java code that you will be using throughout the course. To
                maximize your chance of success in this course, you should get
                in the mindset of being an active participant who writes and
                debugs code, solves problems, studies the available resources,
                and engages in the discussion forums, as opposed to a passive
                participant who just watches the lectures. You`&#39;`ll get a
                good feeling for the spirit and pace of the course when you work
                on the first programming assignment, which will introduce you to
                our Java programming model in the context of an important
                scientific application.
              </div>
              <div className="flex flex-row justify-start ml-[150px]">
                <button
                  className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded"
                  onClick={() => {
                    setCompletedReading((prev) => !prev);
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
