"use client";

import { useState, useEffect } from "react";
import api from "../../../../lib/axios";

export default function UploadPage() {
  const [course, setCourse] = useState({
    title: "",
    description: "",
    estimated_time: 0,
    level: "",
    imageUrl: "",
  });

  const [readingMaterial, setReadingMaterial] = useState({
    courseId: "",
    weekNumber: 1,
    name: "",
    description: "",
    type: "reading",
    completed: false,
    material: null,
  });

  const [connectionStatus, setConnectionStatus] = useState(
    "Checking connection..."
  );

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await api.get("/hello/");
        setConnectionStatus("Connected to backend!");
        console.log("Backend response:", response.data);
      } catch (error) {
        setConnectionStatus("Failed to connect to backend");
        console.error("Connection error:", error);
      }
    };
    testConnection();
  }, []);

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleMaterialChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setReadingMaterial((prev) => ({ ...prev, material: files[0] }));
    } else if (type === "checkbox") {
      setReadingMaterial((prev) => ({ ...prev, [name]: checked }));
    } else {
      setReadingMaterial((prev) => ({ ...prev, [name]: value }));
    }
  };

  const uploadCourse = async () => {
    try {
      const response = await api.post("/course/upload-course", course);
      alert("Course uploaded successfully!");
      // Store the course ID for material upload
      setReadingMaterial((prev) => ({ ...prev, courseId: response.data.id }));
    } catch (err) {
      console.error("Error uploading course:", err);
      alert("Failed to upload course. Check console for details.");
    }
  };

  const uploadMaterial = async () => {
    if (!readingMaterial.courseId) {
      alert("Please upload a course first to get the course ID");
      return;
    }

    const formData = new FormData();
    formData.append("name", readingMaterial.name);
    formData.append("type", readingMaterial.type);
    formData.append("description", readingMaterial.description);
    formData.append("completed", String(readingMaterial.completed));
    if (readingMaterial.material) {
      formData.append("material", readingMaterial.material);
    }

    try {
      await api.post(
        `/courses/${readingMaterial.courseId}/weeks/${readingMaterial.weekNumber}/materials/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Reading material uploaded successfully!");
    } catch (err) {
      console.error("Error uploading material:", err);
      alert("Failed to upload material. Check console for details.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <div className="p-4 bg-gray-100 rounded">
        <p className="text-sm">{connectionStatus}</p>
      </div>
      <div className="space-y-4 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold">Upload Course</h2>
        {Object.keys(course).map((key) => (
          <input
            key={key}
            name={key}
            value={course[key]}
            onChange={handleCourseChange}
            placeholder={key}
            className="w-full border p-2 rounded"
          />
        ))}
        <button
          onClick={uploadCourse}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Upload Course
        </button>
      </div>

      <div className="space-y-4 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold">Upload Reading Material</h2>
        <input
          name="weekNumber"
          type="number"
          value={readingMaterial.weekNumber}
          onChange={handleMaterialChange}
          placeholder="Week Number"
          className="w-full border p-2 rounded"
        />
        <input
          name="name"
          value={readingMaterial.name}
          onChange={handleMaterialChange}
          placeholder="Material Name"
          className="w-full border p-2 rounded"
        />
        <textarea
          name="description"
          value={readingMaterial.description}
          onChange={handleMaterialChange}
          placeholder="Description"
          className="w-full border p-2 rounded"
        />
        <input
          type="checkbox"
          name="completed"
          checked={readingMaterial.completed}
          onChange={handleMaterialChange}
        />{" "}
        Completed
        <input
          type="file"
          name="material"
          accept=".txt,.doc,.docx,.pdf"
          onChange={handleMaterialChange}
          className="w-full border p-2 rounded"
        />
        <button
          onClick={uploadMaterial}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Upload Material
        </button>
      </div>
    </div>
  );
}
