"use client";
import { useEffect, useState, Fragment } from "react";
import Header from "@/src/components/Header";
import Image from "next/image";
import ProfileInfoCard from "@/src/components/ProfileInfoCard";
import api from "@/src/lib/axios";
import { Dialog, Transition } from "@headlessui/react";
import SignupDialog from "@/src/components/SignupDialog";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState<{ [key: number]: File | null }>(
    {}
  );
  const [passwordModalUser, setPasswordModalUser] = useState<any>(null);
  const [passwordInputs, setPasswordInputs] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [open, setOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users/");
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <Header />
      <div className="mt-[60px] px-6 py-8 space-y-10 w-full max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold text-center">
          Admin User Management Panel
        </h1>
        <div className=""></div>
        <div className="p-10">
          <button
            onClick={() => setOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Create a new user
          </button>

          <SignupDialog
            open={open}
            onClose={() => setOpen(false)}
            onSuccess={() => {
              fetchUsers();
              setOpen(false);
            }}
          />
        </div>
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white p-6 rounded-lg shadow flex flex-col md:flex-row items-start gap-8"
          >
            {/* Profile Image + Upload */}
            <div className="flex flex-col items-center space-y-3">
              <Image
                src={user.profile_picture || "/profile/Profile-placeholder.png"}
                alt="User Profile"
                width={128}
                height={128}
                className="rounded-full object-cover"
              />
              <label className="bg-indigo-600 text-white px-3 py-1 mt-2 rounded cursor-pointer hover:bg-indigo-700 transition text-sm">
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
              </label>
              <button
                className="bg-indigo-500 text-white px-3 py-1 mt-2 rounded text-sm hover:bg-indigo-700"
                onClick={() =>
                  updateField(user.id, "profile_picture", user.profile_picture)
                }
                disabled={!imageFiles[user.id]}
              >
                Save Image
              </button>
            </div>

            {/* Editable Info */}
            <div className="flex-1 w-full space-y-4">
              <ProfileInfoCard
                label="Username"
                value={user.username}
                onSave={(val) => updateField(user.id, "username", val)}
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
              <ProfileInfoCard
                label="Email"
                value={user.email}
                onSave={(val) => updateField(user.id, "email", val)}
              />

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  onClick={() => setPasswordModalUser(user)}
                >
                  Change Password
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  onClick={() => deleteUser(user.id)}
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Password Dialog */}
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
              <div className="fixed inset-0 bg-black/30" />
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
                <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6 shadow-xl space-y-4">
                  <Dialog.Title className="text-lg font-semibold">
                    Change Password for {passwordModalUser?.userid}
                  </Dialog.Title>
                  <input
                    type="password"
                    placeholder="New Password"
                    className="w-full border rounded px-3 py-2"
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
                    className="w-full border rounded px-3 py-2"
                    value={passwordInputs.confirm_password}
                    onChange={(e) =>
                      setPasswordInputs((prev) => ({
                        ...prev,
                        confirm_password: e.target.value,
                      }))
                    }
                  />
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                      onClick={() => setPasswordModalUser(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                      onClick={changeUserPassword}
                    >
                      Change
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
}
