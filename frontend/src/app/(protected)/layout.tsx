// app/(protected)/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    }
  }, []);

  return <>{children}</>;
}
