import CoursePage from "@/src/components/CoursePage"; // or correct path

export default function IntroductionToProgrammingPage() {
  const courseInfo = {
    title: "Introduction to Programming in Java",
    image: "/courses/programming.jpg",
    description:
      "This course is designed to build a strong foundation in programming using Java. Learn core principles, algorithmic thinking, and problem-solving skills.",
    weeks: 6,
    difficulty: "Beginner" as const,
    estimatedTime: "30 hours",
    rating: 5,
    likePercentage: 95,
    slug: "introduction-to-programming",
    modules: [
      "Week 1: Introduction to Programming Concepts",
      "Week 2: Variables, Data Types, and Operators",
      "Week 3: Control Structures and Loops",
      "Week 4: Functions and Methods",
      "Week 5: Object-Oriented Programming Basics",
      "Week 6: Final Project",
    ],
  };

  return <CoursePage course={courseInfo} />;
}
