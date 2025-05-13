"use client";
import { useState, useEffect } from "react";
import Header from "@/src/components/Header";
import Image from "next/image";
import ProfileInfoCard from "@/src/components/ProfileInfoCard";
import api from "@/src/lib/axios";
import { useRouter } from "next/navigation";


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

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await api.get("/users/me/");
        setUser(res.data);
      } catch (err: any) {
        setError("Failed to load user profile");
        router.replace('/login')
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setUser((prev) => ({ ...prev, profile_picture: URL.createObjectURL(file) }));
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
      const res = await api.patch("/users/me/", formData, {
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

  // Function to handle password change
  // This modal allows the user to securely change their password by entering their current password, a new password, and confirming the new password. On submit, it sends a POST request to the backend password change endpoint. If successful, it closes the modal and shows a success message; otherwise, it displays an error.
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
      // You may need to adjust the endpoint depending on your backend
      await api.post("/users/set_password/", {
        old_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordSuccess("Password changed successfully.");
      setShowPasswordModal(false);
      setPasswordForm({ current_password: "", new_password: "", confirm_new_password: "" });
    } catch (err: any) {
      setPasswordError("Failed to change password. Please check your current password.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />
      <div className="mt-[60px] w-full flex justify-center bg-gray-200 pt-[80px] px-4 pb-10">
        <div className="flex w-full max-w-7xl space-x-6">
          {/* Left Side */}
          <div className="flex flex-col space-y-6 w-1/3">
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <h2 className="text-xl font-bold mb-4">Personal Details</h2>
              <div className="w-32 h-32 mb-4">
                <Image
                  src={user.profile_picture || "/profile/Profile-placeholder.png"}
                  alt="Profile Picture"
                  width={128}
                  height={128}
                  className="rounded-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold mb-4">{user.first_name} {user.last_name}</h3>
              <label className="bg-indigo-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-indigo-700 transition">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <button
                className="mt-2 bg-indigo-500 text-white px-4 py-1 rounded hover:bg-indigo-700"
                onClick={() => updateField("profile_picture", user.profile_picture)}
                disabled={!imageFile}
              >
                Save Image
              </button>
            </div>
          </div>

          {/* Right Side */}
          <div className="w-2/3">
            <div className="bg-white rounded-lg shadow p-6 h-full">
              <h2 className="text-xl font-bold mb-6">Account Information</h2>
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
              {/* Password Change Modal Trigger */}
              <button
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </button>
              {/* Password Change Modal */}
              {showPasswordModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
                    <button
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                      onClick={() => setShowPasswordModal(false)}
                    >
                      &times;
                    </button>
                    <h3 className="text-lg font-bold mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Current Password</label>
                        <input
                          type="password"
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          value={passwordForm.current_password}
                          onChange={e => setPasswordForm(f => ({ ...f, current_password: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">New Password</label>
                        <input
                          type="password"
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          value={passwordForm.new_password}
                          onChange={e => setPasswordForm(f => ({ ...f, new_password: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          value={passwordForm.confirm_new_password}
                          onChange={e => setPasswordForm(f => ({ ...f, confirm_new_password: e.target.value }))}
                          required
                        />
                      </div>
                      {passwordError && <div className="text-red-500 text-sm">{passwordError}</div>}
                      {passwordSuccess && <div className="text-green-600 text-sm">{passwordSuccess}</div>}
                      <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                      >
                        Save Password
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
