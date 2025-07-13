"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaClipboardCheck, FaCode, FaBrain, FaChartLine, FaRocket, FaTrophy } from "react-icons/fa";

export default function AssessmentPage() {
  const assessmentTypes = [
    {
      icon: <FaClipboardCheck className="text-4xl text-blue-500" />,
      title: "Knowledge Quiz",
      description: "Test your understanding of computer science fundamentals",
      difficulty: "Beginner",
      duration: "15 minutes",
      questions: "20 questions",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <FaCode className="text-4xl text-green-500" />,
      title: "Coding Challenge",
      description: "Solve programming problems to demonstrate your skills",
      difficulty: "Intermediate",
      duration: "45 minutes",
      questions: "5 problems",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <FaBrain className="text-4xl text-purple-500" />,
      title: "Logic Assessment",
      description: "Critical thinking and problem-solving evaluation",
      difficulty: "Advanced",
      duration: "30 minutes",
      questions: "15 scenarios",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <FaChartLine className="text-4xl text-orange-500" />,
      title: "Progress Evaluation",
      description: "Comprehensive review of your learning journey",
      difficulty: "All Levels",
      duration: "60 minutes",
      questions: "Mixed format",
      color: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { label: "Total Assessments", value: "1,250+", icon: <FaClipboardCheck /> },
    { label: "Success Rate", value: "87%", icon: <FaTrophy /> },
    { label: "Average Score", value: "92%", icon: <FaChartLine /> },
    { label: "Skill Improvement", value: "+156%", icon: <FaRocket /> }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful Background Patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Animated Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          {/* Large Background Circles */}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-25 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-20 -right-32 w-72 h-72 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full opacity-35 animate-pulse" style={{animationDelay: '0.5s'}}></div>
          
          {/* Geometric Patterns */}
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-indigo-300 rotate-45 opacity-30 animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-300 rotate-45 opacity-40 animate-bounce" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/3 left-1/3 w-5 h-5 bg-blue-300 rotate-45 opacity-25 animate-bounce" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-1/4 right-1/3 w-6 h-6 bg-cyan-300 rounded-full opacity-30 animate-ping" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99,102,241,0.3) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      {/* Assessment Content */}
      <div className="relative z-10 min-h-screen pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Assessment Center
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Measure your progress, identify strengths, and discover areas for improvement with our comprehensive assessment tools.
            </p>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-indigo-600 text-2xl">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-800">
                    {stat.value}
                  </div>
                </div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Assessment Types */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Choose Your Assessment
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {assessmentTypes.map((assessment, index) => (
                <motion.div
                  key={assessment.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ y: -8 }}
                  className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/20 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex items-center mb-6">
                    <div className="mr-4">
                      {assessment.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {assessment.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${assessment.color}`}>
                        {assessment.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {assessment.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-semibold mr-1">Duration:</span>
                      {assessment.duration}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-semibold mr-1">Format:</span>
                      {assessment.questions}
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-3 px-6 rounded-xl text-white font-semibold bg-gradient-to-r ${assessment.color} hover:shadow-xl transition-all duration-300`}
                  >
                    Start Assessment
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Test Your Skills?
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Take our comprehensive assessment to get personalized learning recommendations
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/test">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    Start Quick Test
                  </motion.button>
                </Link>
                <Link href="/courses">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-indigo-600 transition-all duration-200"
                  >
                    Browse Courses
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 