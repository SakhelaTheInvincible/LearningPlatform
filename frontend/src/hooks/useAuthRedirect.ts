"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const publicPaths = ["/login", "/signup"];
    const currentPath = window.location.pathname;

    if (!token && !publicPaths.includes(currentPath)) {
      router.push("/login");
    }
  }, []);
}
