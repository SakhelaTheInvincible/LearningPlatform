"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import AnimatedWrapper from "../components/layout/AnimatedWrapper";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [message, setMessage] = useState("Loading...");
  const [error, setError] = useState("");

  // placeholder
  const backend = false;

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/hello/")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

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
        <div className="min-h-screen bg-white">
          {/* Header */}
          <header className="fixed top-0 w-full z-50 bg-white shadow">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.png" alt="Logo" width={32} height={32} />
                <span className="text-xl font-bold text-indigo-600">
                  CS Learn
                </span>
              </Link>
              <nav className="hidden sm:flex space-x-6 text-gray-700">
                <Link href="/" className="text-indigo-600 font-semibold">
                  Home
                </Link>
                <Link href="/courses">Courses</Link>
                <Link href="/about">About</Link>
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-24 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <Image
                alt="Logo"
                src="/logo.png"
                width={80}
                height={80}
                className="mx-auto"
              />
              <h1 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
                Welcome to Gradia
              </h1>
              <h5 className="mt-2 text-center text-l font-bold leading-9 tracking-tight text-gray-700">
                Ai powered learing platform
              </h5>
              <p className="mt-4 text-center text-sm text-gray-600">
                Your journey to mastering Computer Science starts here.
              </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm space-y-4">
              <Link
                href="/courses"
                className="block w-full text-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
