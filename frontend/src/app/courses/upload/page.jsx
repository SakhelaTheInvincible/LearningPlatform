"use client";

import { useState } from "react";
import axios from "axios";

export default function UploadPage() {
  const [course, setCourse] = useState({
    id: "",
    title: "",
    courseName: "",
    description: "",
    level: "",
    imageUrl: "",
  });

  const [readingMaterial, setReadingMaterial] = useState({
    courseName: "",
    weekNumber: 1,
    name: "",
    slug: "",
    description: "",
    type: "reading",
    completed: false,
    material: null,
  });

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
      await axios.post("/course", course);
      alert("Course uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload course.");
    }
  };

  const uploadMaterial = async () => {
    const formData = new FormData();
    formData.append("name", readingMaterial.name);
    formData.append("type", readingMaterial.type);
    formData.append("slug", readingMaterial.slug);
    formData.append("description", readingMaterial.description);
    formData.append("completed", String(readingMaterial.completed));
    if (readingMaterial.material) {
      formData.append("material", readingMaterial.material);
    }

    try {
      await axios.post(
        `/course/${readingMaterial.courseName}/week/${readingMaterial.weekNumber}/reading/${readingMaterial.slug}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert("Reading material uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload material.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
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
          name="courseName"
          value={readingMaterial.courseName}
          onChange={handleMaterialChange}
          placeholder="Course Name"
          className="w-full border p-2 rounded"
        />
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
        <input
          name="slug"
          value={readingMaterial.slug}
          onChange={handleMaterialChange}
          placeholder="Slug"
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
