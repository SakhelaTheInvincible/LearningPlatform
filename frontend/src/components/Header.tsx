"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaHome, FaGraduationCap, FaUser, FaSignOutAlt, FaStar, FaShieldAlt, FaCog } from "react-icons/fa";
import api from "../lib/axios";
import UserLevelDisplay from "./UserLevelDisplay";

export default function Header() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // Clear tokens from local storage
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser({
      username: "",
      email: "",
      password: "*****",
      first_name: "",
      last_name: "",
      profile_picture: "",
      experience: 0,
    });
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("auth-changed"));
    
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
    experience: 0,
  });

  // Check if user is admin
  const checkAdminStatus = async () => {
    try {
      const res = await api.get("/admin/users/");
      setIsAdmin(true);
    } catch (err) {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await api.get("/users/me/");
        setUser(res.data);
        setIsAuthenticated(true);
        
        // Check admin status after successful user fetch
        await checkAdminStatus();
      } catch (err: any) {
        setError("Failed to load user profile");
        setIsAuthenticated(false);
        setIsAdmin(false);
        // Don't redirect to login from here - let components handle their own auth
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();

    // Listen for authentication state changes
    const handleAuthChange = () => {
      const token = localStorage.getItem("access");
      if (token) {
        fetchUser();
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser({
          username: "",
          email: "",
          password: "*****",
          first_name: "",
          last_name: "",
          profile_picture: "",
          experience: 0,
        });
      }
    };

    // Listen for custom auth events
    window.addEventListener("auth-changed", handleAuthChange);
    
    // Also listen for storage changes (in case user logs in/out in another tab)
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="relative"
          >
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
          </motion.div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            CS Learn
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden sm:flex items-center space-x-2">
          <Link 
            href="/" 
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-700 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 hover:shadow-md hover:scale-105"
          >
            <FaHome className="text-sm group-hover:text-indigo-600 transition-colors" />
            <span className="font-medium">Home</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link 
                href="/courses" 
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <FaGraduationCap className="text-sm" />
                <span>Courses</span>
              </Link>

              {/* Admin Panel Button */}
              {isAdmin && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    href="/admin" 
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <FaShieldAlt className="text-sm group-hover:rotate-12 transition-transform duration-300" />
                    <span>Admin</span>
                  </Link>
                </motion.div>
              )}

              {/* User Level Display */}
              <UserLevelDisplay 
                totalExperience={user.experience || 0}
                maxExperience={500}
                compact={true}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 hover:shadow-md transition-all duration-300"
              />

              {/* Profile Picture */}
              <Link href="/profile" className="group flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-md hover:scale-105">
                <div className="relative w-8 h-8 ring-2 ring-gray-200 group-hover:ring-indigo-300 rounded-full transition-all duration-300">
                  <Image
                    src={
                      user.profile_picture
                        ? user.profile_picture
                        : "/profile/Profile-placeholder.png"
                    }
                    alt="Profile"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <span className="text-sm text-gray-700 group-hover:text-indigo-600 font-medium transition-colors">
                  {user.first_name || user.username}
                </span>
              </Link>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <FaSignOutAlt className="text-sm group-hover:rotate-12 transition-transform duration-300" />
                <span>Logout</span>
              </motion.button>
            </>
          ) : (
            <>
              <Link 
                href="/courses" 
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-indigo-600 font-semibold bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 hover:shadow-md hover:scale-105"
              >
                <FaGraduationCap className="text-sm" />
                <span>Courses</span>
              </Link>

              {/* Login/Register buttons for unauthenticated users */}
              <Link 
                href="/login" 
                className="group px-4 py-2.5 rounded-xl text-indigo-600 font-semibold hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 hover:shadow-md hover:scale-105"
              >
                Login
              </Link>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/signup" 
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Sign Up
                </Link>
              </motion.div>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="sm:hidden">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl shadow-xl border-t border-gray-100 sm:hidden"
          >
            <div className="px-6 py-4 space-y-3">
              <Link 
                href="/" 
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-700 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaHome className="text-sm" />
                <span className="font-medium">Home</span>
              </Link>

              <Link 
                href="/courses" 
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaGraduationCap className="text-sm" />
                <span>Courses</span>
              </Link>

              {isAuthenticated ? (
                <>
                  {/* Admin Panel Button - Mobile */}
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaShieldAlt className="text-sm" />
                      <span>Admin Panel</span>
                    </Link>
                  )}

                  {/* User Level Display - Mobile */}
                  <UserLevelDisplay 
                    totalExperience={user.experience || 0}
                    maxExperience={500}
                    compact={true}
                    className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200"
                  />

                  {/* Profile - Mobile */}
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="relative w-8 h-8 ring-2 ring-gray-200 rounded-full">
                      <Image
                        src={
                          user.profile_picture
                            ? user.profile_picture
                            : "/profile/Profile-placeholder.png"
                        }
                        alt="Profile"
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      {user.first_name || user.username}
                    </span>
                  </Link>

                  {/* Logout - Mobile */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold transition-all duration-300 shadow-lg w-full"
                  >
                    <FaSignOutAlt className="text-sm" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="block px-4 py-3 rounded-xl text-indigo-600 font-semibold hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/signup" 
                    className="block px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}
