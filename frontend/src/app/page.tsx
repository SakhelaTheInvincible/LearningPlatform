"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import AnimatedWrapper from "../components/layout/AnimatedWrapper";
import Link from "next/link";
import Image from "next/image";
import { FaRocket, FaGraduationCap, FaBrain, FaCode, FaArrowRight, FaStar } from "react-icons/fa";

export default function Home() {
  const [message, setMessage] = useState("Loading...");
  const [error, setError] = useState("");

  // placeholder
  const backend = false;

  useEffect(() => {
    axios
      .get("http://localhost:8000/")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  const features = [
    {
      icon: <FaBrain className="text-3xl text-blue-500" />,
      title: "AI-Powered Learning",
      description: "Personalized learning paths adapted to your pace and style"
    },
    {
      icon: <FaCode className="text-3xl text-green-500" />,
      title: "Hands-on Coding",
      description: "Interactive coding challenges and real-world projects"
    },
    {
      icon: <FaGraduationCap className="text-3xl text-purple-500" />,
      title: "Interactive Assessments",
      description: "Test your knowledge with AI-powered quizzes and instant feedback"
    }
  ];

  return (
    <>
      {backend && (
        <AnimatedWrapper>
          <h1>Fullstack App</h1>
          <p>Backend says: {message}</p>
          {error && <p style={{ color: "red" }}>Error: {error}</p>}
        </AnimatedWrapper>
      )}

              {!backend && (
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



            {/* Hero Section */}
            <section className="relative z-10 min-h-screen flex items-center justify-center px-6 py-24 pt-32">
              <div className="max-w-5xl mx-auto text-center">
                {/* Logo with Animation */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="mb-8"
                >
                  <div className="relative inline-block">
                    <Image
                      alt="Logo"
                      src="/logo.png"
                      width={120}
                      height={120}
                      className="mx-auto filter drop-shadow-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-20 animate-ping"></div>
                  </div>
                </motion.div>

                {/* Main Title with Gradient */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-5xl md:text-7xl font-bold mb-6"
                >
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Welcome to Gradia
                  </span>
                </motion.h1>

                {/* Animated Subtitle */}
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-xl md:text-3xl font-semibold text-gray-700 mb-6"
                >
                  <span className="relative">
                    AI-Powered Learning Platform
                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
                  </span>
                </motion.h2>

                {/* Description with Animation */}
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
                >
                  Master any course with AI-powered learning. Personalized guidance, questions, and assessments to help you progress in any subject.
                </motion.p>

                {/* CTA Button with Animation */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="mb-16"
                >
                  <Link href="/courses">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(99, 102, 241, 0.3)" }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-10 py-5 rounded-2xl font-semibold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 group"
                    >
                      <FaRocket className="text-2xl group-hover:animate-bounce" />
                      <span>Start Your Journey</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <FaArrowRight className="text-lg" />
                      </motion.div>
                    </motion.button>
                  </Link>
                </motion.div>

                {/* Features Grid with Staggered Animation */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.2 + index * 0.2 }}
                      whileHover={{ 
                        scale: 1.05, 
                        y: -10,
                        boxShadow: "0 25px 50px rgba(0,0,0,0.1)"
                      }}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                    >
                      <motion.div 
                        className="mb-6 flex justify-center"
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {feature.icon}
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </section>
          </div>
        )}
    </>
  );
}
