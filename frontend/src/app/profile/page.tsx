"use client";
import { useState } from "react";
import Header from "@/src/components/Header";
import Image from "next/image";
import ProfileInfoCard from "@/src/components/ProfileInfoCard";

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    password: "password123",
    additionalInfo: "I love coding and learning new technologies!",
    profileImage: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUser((prev) => ({ ...prev, profileImage: imageUrl }));
    }
  };

  const updateField = (field: string, value: string) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

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
                  src={user.profileImage || "/profile/Profile-placeholder.png"}
                  alt="Profile Picture"
                  width={128}
                  height={128}
                  className="rounded-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold mb-4">{user.name}</h3>
              <label className="bg-indigo-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-indigo-700 transition">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Additional Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Additional Info</h2>
              <p className="text-gray-700">{user.additionalInfo}</p>
            </div>
          </div>

          {/* Right Side */}
          <div className="w-2/3">
            <div className="bg-white rounded-lg shadow p-6 h-full">
              <h2 className="text-xl font-bold mb-6">Account Information</h2>
              <ProfileInfoCard
                label="Name"
                value={user.name}
                onSave={(val) => updateField("name", val)}
              />
              <ProfileInfoCard
                label="Email"
                value={user.email}
                onSave={(val) => updateField("email", val)}
              />
              <ProfileInfoCard
                label="Password"
                value={"●●●●●●●●"}
                onSave={(val) => updateField("password", val)}
                type="password"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
