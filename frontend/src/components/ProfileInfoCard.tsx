"use client";
import { useState } from "react";

interface ProfileInfoCardProps {
  label: string;
  value: string;
  onSave: (newValue: string) => void;
  type?: string; // for input type (text, password, etc)
}

export default function ProfileInfoCard({
  label,
  value,
  onSave,
  type = "text",
}: ProfileInfoCardProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleSave = () => {
    onSave(inputValue);
    setEditing(false);
  };

  return (
    <div className="flex flex-col mb-4">
      <label className="font-semibold mb-1">{label}</label>
      {editing ? (
        <div className="flex items-center space-x-2">
          <input
            type={type}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            className="bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>{value}</div>
          <button
            className="text-indigo-600 hover:underline"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}
