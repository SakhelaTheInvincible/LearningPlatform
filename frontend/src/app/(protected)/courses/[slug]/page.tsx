"use client";
import { use } from "react";
import CoursePage from "@/src/components/CoursePage";

export default function CoursePageBySlug({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return <CoursePage slug={slug} />;
}
