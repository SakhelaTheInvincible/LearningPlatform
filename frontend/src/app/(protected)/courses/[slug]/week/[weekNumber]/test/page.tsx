// app/test-pagination/page.tsx
"use client";

import { useState } from "react";
import Pagination from "@/src/components/Pagination";
export default function TestPaginationPage() {
  const [page, setPage] = useState(1);
  const totalPages = 10;

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <h1 className="text-xl font-semibold mb-4">Current Page: {page}</h1>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}
