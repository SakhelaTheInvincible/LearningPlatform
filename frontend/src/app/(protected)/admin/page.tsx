"use client";
import { useEffect, useState, Fragment, useRef } from "react";
import { motion } from "framer-motion";
import { 
  FaShieldAlt, 
  FaUsers, 
  FaSearch, 
  FaSort, 
  FaPlus, 
  FaCamera, 
  FaUpload, 
  FaLock, 
  FaTrash, 
  FaEdit,
  FaTimes,
  FaUserShield,
  FaUser
} from "react-icons/fa";
import Image from "next/image";
import ProfileInfoCard from "@/src/components/ProfileInfoCard";
import api from "@/src/lib/axios";
import { Dialog, Transition } from "@headlessui/react";
import SignupDialog from "@/src/components/SignupDialog";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import LoadingPage from "@/src/components/LoadingPage";

export default function AdminPage() {
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState("username");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState<{ [key: number]: File | null }>({});
  const [passwordModalUser, setPasswordModalUser] = useState<any>(null);
  const [passwordInputs, setPasswordInputs] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [openRegular, setOpenRegular] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);
  const [openUserTypeDialog, setOpenUserTypeDialog] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [openSignupDialog, setOpenSignupDialog] = useState(false);

  const sortOptions = [
    { label: "Username", value: "username" },
    { label: "First Name", value: "first_name" },
    { label: "Last Name", value: "last_name" },
    { label: "Email", value: "email" },
  ];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users/");
      console.log(res.data);
      setUsers(res.data);
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateField = async (userId: number, field: string, value: string) => {
    const scrollY = window.scrollY;

    const formData = new FormData();
    if (field === "profile_picture" && imageFiles[userId]) {
      formData.append("profile_picture", imageFiles[userId]!);
    } else {
      formData.append(field, value);
    }

    try {
      setLoading(true);
      const res = await api.put(`/admin/users/${userId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? res.data : user))
      );

      // Restore scroll position after the DOM updates
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: scrollY, behavior: "auto" });
        });
      });
    } catch (err) {
      alert("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredUsers = async (username: string, order_by: string) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/admin/users/filter/?username=${username}&order_by=-${order_by}`
      );
      setUsers(res.data);
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (userId: number, file: File) => {
    setImageFiles((prev) => ({ ...prev, [userId]: file }));
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, profile_picture: URL.createObjectURL(file) }
          : u
      )
    );
  };

  const deleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/admin/users/${userId}/`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  const changeUserPassword = async () => {
    try {
      await api.put(`/admin/users/${passwordModalUser.id}/set_password/`, {
        new_password: passwordInputs.new_password,
        confirm_password: passwordInputs.confirm_password,
      });
      alert("Password changed.");
      setPasswordModalUser(null);
      setPasswordInputs({ new_password: "", confirm_password: "" });
    } catch (err: any) {
      alert(
        "Password Change failed: " + (err.response?.data.error || err.message)
      );
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
            <div className="flex items-center justify-center gap-3 mb-4">
              <FaShieldAlt className="text-4xl text-amber-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                Admin Panel
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Manage users and system settings
            </p>
          </motion.div>

          {/* Controls Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 mb-8 relative z-[1000]"
          >
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Create User Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpenUserTypeDialog(true)}
                className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <FaPlus className="text-sm group-hover:rotate-90 transition-transform duration-300" />
                Create New User
              </motion.button>

              {/* Search and Sort */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Search Input */}
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by username"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        fetchFilteredUsers(search, orderBy);
                      }
                    }}
                    className="pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 bg-white/50 backdrop-blur-sm w-full sm:w-80"
                  />
                </div>

                {/* Sort Dropdown */}
                <div className="w-full sm:w-64">
                  <Listbox
                    value={orderBy}
                    onChange={(val) => {
                      setOrderBy(val);
                      fetchFilteredUsers(search, val);
                    }}
                  >
                    <div className="relative z-[9999]">
                      <Listbox.Button className="relative w-full cursor-default rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 py-3 pl-4 pr-10 text-left text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300">
                        <div className="flex items-center gap-2">
                          <FaSort className="text-sm" />
                          <span className="block truncate">
                            {sortOptions.find((o) => o.value === orderBy)?.label}
                          </span>
                        </div>
                        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                          <ChevronUpDownIcon className="h-5 w-5 text-indigo-200" aria-hidden="true" />
                        </span>
                      </Listbox.Button>

                      <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white backdrop-blur-lg py-1 text-base shadow-2xl ring-1 ring-black/10 focus:outline-none sm:text-sm z-[9999]">
                        {sortOptions.map((option) => (
                          <Listbox.Option
                            key={option.value}
                            value={option.value}
                            className={({ active }) =>
                              `relative cursor-default select-none py-3 pl-4 pr-10 transition-colors ${
                                active
                                  ? "bg-indigo-100 text-indigo-900"
                                  : "text-gray-900"
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                  {option.label}
                                </span>
                                {selected && (
                                  <span className="absolute inset-y-0 right-2 flex items-center text-indigo-600">
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                )}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Users List */}
          <div className="space-y-6 relative z-10">
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8"
              >
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  {/* Profile Image + Upload */}
                  <div className="flex flex-col items-center space-y-4 lg:w-48">
                    <div className="relative">
                      <div className="w-32 h-32 relative">
                        <Image
                          src={user.profile_picture || "/profile/Profile-placeholder.png"}
                          alt="User Profile"
                          fill
                          className="rounded-full object-cover ring-4 ring-indigo-100 hover:ring-indigo-200 transition-all duration-300"
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 w-full">
                      <motion.label
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                      >
                        <FaCamera className="text-xs group-hover:scale-110 transition-transform" />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            e.target.files &&
                            handleImageUpload(user.id, e.target.files[0])
                          }
                          className="hidden"
                        />
                      </motion.label>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
                        onClick={() =>
                          updateField(user.id, "profile_picture", user.profile_picture)
                        }
                        disabled={!imageFiles[user.id]}
                      >
                        <FaUpload className="text-xs group-hover:scale-110 transition-transform" />
                        Save Image
                      </motion.button>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 w-full space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        {user.is_superuser ? (
                          <FaUserShield className="text-amber-600 text-xl" />
                        ) : (
                          <FaUser className="text-indigo-600 text-xl" />
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.is_superuser 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {user.is_superuser ? 'Admin' : 'User'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ProfileInfoCard
                        label="Username"
                        value={user.username}
                        onSave={(val) => updateField(user.id, "username", val)}
                      />
                      <ProfileInfoCard
                        label="Email"
                        value={user.email}
                        onSave={(val) => updateField(user.id, "email", val)}
                      />
                      <ProfileInfoCard
                        label="First Name"
                        value={user.first_name}
                        onSave={(val) => updateField(user.id, "first_name", val)}
                      />
                      <ProfileInfoCard
                        label="Last Name"
                        value={user.last_name}
                        onSave={(val) => updateField(user.id, "last_name", val)}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                        onClick={() => setPasswordModalUser(user)}
                      >
                        <FaLock className="text-sm group-hover:scale-110 transition-transform" />
                        Change Password
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                        onClick={() => deleteUser(user.id)}
                      >
                        <FaTrash className="text-sm group-hover:scale-110 transition-transform" />
                        Delete User
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* User Type Selection Dialog */}
      <Transition appear show={openUserTypeDialog} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setOpenUserTypeDialog(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white/90 backdrop-blur-lg p-8 text-left align-middle shadow-2xl transition-all border border-white/20">
                  <Dialog.Title className="flex items-center gap-3 text-2xl font-bold text-gray-800 mb-6">
                    <FaPlus className="text-indigo-600" />
                    Select User Type
                  </Dialog.Title>
                  
                  <div className="space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsSuperuser(false);
                        setOpenSignupDialog(true);
                      }}
                      className="group w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <FaUser className="text-lg group-hover:scale-110 transition-transform" />
                      Regular User
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsSuperuser(true);
                        setOpenSignupDialog(true);
                      }}
                      className="group w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <FaUserShield className="text-lg group-hover:scale-110 transition-transform" />
                      Admin User
                    </motion.button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Signup Dialog */}
      <SignupDialog
        open={openSignupDialog}
        onClose={() => {
          setOpenSignupDialog(false);
          setOpenUserTypeDialog(false);
        }}
        onSuccess={() => {
          fetchUsers();
          setOpenSignupDialog(false);
          setOpenUserTypeDialog(false);
        }}
        is_superuser={isSuperuser}
      />

      {/* Password Change Dialog */}
      <Transition show={!!passwordModalUser} as={Fragment}>
        <Dialog
          onClose={() => setPasswordModalUser(null)}
          className="relative z-50"
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                    <FaLock className="text-purple-600" />
                    Change Password
                  </Dialog.Title>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                    onClick={() => setPasswordModalUser(null)}
                  >
                    <FaTimes className="text-sm" />
                  </motion.button>
                </div>

                <p className="text-gray-600 mb-6">
                  Change password for <span className="font-semibold text-gray-800">{passwordModalUser?.username}</span>
                </p>

                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="New Password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    value={passwordInputs.new_password}
                    onChange={(e) =>
                      setPasswordInputs((prev) => ({
                        ...prev,
                        new_password: e.target.value,
                      }))
                    }
                  />
                  
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    value={passwordInputs.confirm_password}
                    onChange={(e) =>
                      setPasswordInputs((prev) => ({
                        ...prev,
                        confirm_password: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex gap-3 pt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition-all duration-300"
                    onClick={() => setPasswordModalUser(null)}
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={changeUserPassword}
                  >
                    <FaLock className="text-sm" />
                    Change Password
                  </motion.button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
