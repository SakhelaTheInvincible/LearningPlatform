"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaUser, FaEdit, FaLock, FaUpload, FaCamera, FaShieldAlt, FaTimes } from "react-icons/fa";
import Image from "next/image";
import ProfileInfoCard from "@/src/components/ProfileInfoCard";
import api from "@/src/lib/axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingPage from "@/src/components/LoadingPage";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "*****",
    first_name: "",
    last_name: "",
    profile_picture: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await api.get("/users/me/");
        setUser(res.data);
        console.log(res.data);
      } catch (err: any) {
        setError("Failed to load user profile");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users/");
      if (res) {
        setIsAdmin(true);
      }
    } catch (err) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setUser((prev) => ({
        ...prev,
        profile_picture: URL.createObjectURL(file),
      }));
    }
  };

  const updateField = async (field: string, value: string) => {
    setUser((prev) => ({ ...prev, [field]: value }));
    // Prepare form data for PATCH
    const formData = new FormData();
    if (field === "profile_picture" && imageFile) {
      formData.append("profile_picture", imageFile);
    } else {
      formData.append(field, value);
    }
    try {
      setLoading(true);
      const res = await api.put("/users/me/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data);
      setError("");
    } catch (err: any) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (passwordForm.new_password !== passwordForm.confirm_new_password) {
      setPasswordError("New passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      await api.put("/users/set_password/", {
        old_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordSuccess("Password changed successfully.");
      setShowPasswordModal(false);
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_new_password: "",
      });
    } catch (err: any) {
      setPasswordError(
        "Failed to change password. Please check your current password."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingPage />
      </div>
    );
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Animated Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-20 -right-32 w-72 h-72 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full opacity-25 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99,102,241,0.3) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Profile Settings
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your account information and preferences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Profile Picture */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <FaUser className="text-indigo-600 text-xl" />
                    <h2 className="text-2xl font-bold text-gray-800">Personal Details</h2>
                  </div>
                  
                  {/* Profile Picture */}
                  <div className="relative mb-6">
                    <div className="w-32 h-32 mx-auto relative">
                      <Image
                        src={user.profile_picture || "/profile/Profile-placeholder.png"}
                        alt="Profile Picture"
                        fill
                        className="rounded-full object-cover ring-4 ring-indigo-100 hover:ring-indigo-200 transition-all duration-300"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-800 mb-6">{user.username}</h3>
                  
                  {/* Upload Buttons */}
                  <div className="space-y-3">
                    <motion.label
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <FaCamera className="text-sm group-hover:scale-110 transition-transform" />
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </motion.label>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      onClick={() => updateField("profile_picture", user.profile_picture)}
                      disabled={!imageFile}
                    >
                      <FaUpload className="text-sm group-hover:scale-110 transition-transform" />
                      Save Image
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Side - Account Information */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <FaEdit className="text-indigo-600 text-xl" />
                    <h2 className="text-2xl font-bold text-gray-800">Account Information</h2>
                  </div>
                  {isAdmin && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <FaShieldAlt className="text-sm" />
                        Admin Panel
                      </Link>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-6">
                  <ProfileInfoCard
                    label="Username"
                    value={user.username}
                    onSave={(val) => updateField("username", val)}
                  />
                  <ProfileInfoCard
                    label="First Name"
                    value={user.first_name}
                    onSave={(val) => updateField("first_name", val)}
                  />
                  <ProfileInfoCard
                    label="Last Name"
                    value={user.last_name}
                    onSave={(val) => updateField("last_name", val)}
                  />
                  <ProfileInfoCard
                    label="Email"
                    value={user.email}
                    onSave={(val) => updateField("email", val)}
                  />
                  
                  {/* Password Change Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    <FaLock className="text-sm group-hover:scale-110 transition-transform" />
                    Change Password
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-md relative p-8"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
              onClick={() => setShowPasswordModal(false)}
            >
              <FaTimes className="text-sm" />
            </motion.button>

            <div className="flex items-center gap-3 mb-6">
              <FaLock className="text-indigo-600 text-xl" />
              <h3 className="text-2xl font-bold text-gray-800">Change Password</h3>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  value={passwordForm.current_password}
                  onChange={(e) =>
                    setPasswordForm((f) => ({
                      ...f,
                      current_password: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  value={passwordForm.new_password}
                  onChange={(e) =>
                    setPasswordForm((f) => ({
                      ...f,
                      new_password: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  value={passwordForm.confirm_new_password}
                  onChange={(e) =>
                    setPasswordForm((f) => ({
                      ...f,
                      confirm_new_password: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {passwordError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-200"
                >
                  {passwordError}
                </motion.div>
              )}
              
              {passwordSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-600 text-sm bg-green-50 p-3 rounded-xl border border-green-200"
                >
                  {passwordSuccess}
                </motion.div>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <FaLock className="text-sm" />
                Save Password
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
