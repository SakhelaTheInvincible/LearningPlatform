"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    usename: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    repeatPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.repeatPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/signup/", {
        username: "",
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        profile_picture: null,
        password: formData.password,
      });

      const token = response.data.token;
      localStorage.setItem("token", token);
      router.push("/"); // or redirect to /courses, /dashboard, etc.
    } catch (error: any) {
      alert(
        "Signup failed: " + (error.response?.data?.detail || error.message)
      );
    }
  };

  return (
    <div className="flex min-h-screen h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img alt="Logo" src="/logo.png" className="mx-auto h-20 w-auto" />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Create an account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Username
            </label>
            <input
              name="username"
              type="text"
              required
              value={formData.usename}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-row">
            <div className="mr-4 w-1/2">
              <label className="block text-sm font-medium text-gray-900">
                First Name
              </label>
              <input
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-900">
                Last Name
              </label>
              <input
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">
              Email address
            </label>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">
              Repeat Password
            </label>
            <input
              name="repeatPassword"
              type="password"
              required
              value={formData.repeatPassword}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Sign up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already a member?{" "}
          <a
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}
