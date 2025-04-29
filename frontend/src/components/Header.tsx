import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white shadow">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={32} height={32} />
          <span className="text-xl font-bold text-indigo-600">CS Learn</span>
        </Link>

        <nav className="hidden sm:flex items-center space-x-6 text-gray-700">
          <Link href="/">Home</Link>
          <Link href="/courses" className="text-indigo-600 font-semibold">
            Courses
          </Link>

          {/* Profile Picture Link */}
          <Link href="/profile" className="relative w-8 h-8">
            <Image
              src="/profile/Profile-placeholder.png" // Replace with actual path or user image
              alt="Profile"
              fill
              className="rounded-full object-cover cursor-pointer hover:ring-2 ring-indigo-500 transition"
            />
          </Link>

          <Link href="/about">About</Link>
        </nav>
      </div>
    </header>
  );
}
