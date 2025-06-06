import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import api from "../lib/axios";

export default function Header() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogout = () => {
    // Clear tokens from local storage
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    // Optionally redirect to login or home page
    router.push("/"); // or router.push('/');
  };

  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "*****",
    first_name: "",
    last_name: "",
    profile_picture: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await api.get("/users/me/");
        setUser(res.data);
      } catch (err: any) {
        setError("Failed to load user profile");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

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
              src={
                user.profile_picture
                  ? user.profile_picture
                  : "/profile/Profile-placeholder.png"
              }
              alt="Profile"
              fill
              className="rounded-full object-cover cursor-pointer hover:ring-2 ring-indigo-500 transition"
            />
          </Link>

          {/* <Link href="/about">About</Link> */}
          <div className="">
            <button
              onClick={handleLogout}
              className="block w-full text-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
