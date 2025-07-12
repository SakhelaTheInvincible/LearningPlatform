"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

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

  const handleCancel = () => {
    setInputValue(value);
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl p-4 border border-gray-200/50 hover:border-indigo-200 transition-all duration-300"
    >
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label}
      </label>
      
      {editing ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          <input
            type={type}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
              onClick={handleSave}
            >
              <FaSave className="text-xs" />
              Save
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition-all duration-300 text-sm"
              onClick={handleCancel}
            >
              <FaTimes className="text-xs" />
              Cancel
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="text-gray-800 font-medium flex-1 pr-4">
            {value || <span className="text-gray-400 italic">Not set</span>}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
            onClick={() => setEditing(true)}
          >
            <FaEdit className="text-xs" />
            Edit
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
