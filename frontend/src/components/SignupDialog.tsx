"use client";
import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/axios";

interface SignupDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  is_superuser: boolean;
}

export default function SignupDialog({
  open,
  onClose,
  onSuccess,
  is_superuser,
}: SignupDialogProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await api.post(`/signup/?is_superuser=${is_superuser}`, formData);

      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-4 py-12 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white px-6 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6">
                <button
                  onClick={onClose}
                  className="absolute top-2 right-2 text-gray-400 hover:text-black"
                >
                  ✕
                </button>
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold text-gray-900 mb-4 text-center"
                >
                  Create a new user
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    name="username"
                    type="text"
                    placeholder="Username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                  <div className="flex gap-2">
                    <input
                      name="first_name"
                      type="text"
                      placeholder="First Name"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-1/2 border rounded px-3 py-2"
                    />
                    <input
                      name="last_name"
                      type="text"
                      placeholder="Last Name"
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-1/2 border rounded px-3 py-2"
                    />
                  </div>
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                  <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                  <input
                    name="password_confirm"
                    type="password"
                    placeholder="Repeat Password"
                    required
                    value={formData.password_confirm}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700"
                  >
                    Sign up
                  </button>
                </form>

                {error && (
                  <p className="mt-2 text-center text-red-500 text-sm">
                    {error}
                  </p>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
