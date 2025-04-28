"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

export default function Breadcrumbs() {
  const pathname = usePathname();

  const crumbs = pathname.split("/").filter((path) => path.length > 0);

  return (
    <nav
      className="text-sm text-gray-500 flex items-center space-x-2"
      aria-label="Breadcrumb"
    >
      <Link href="/" className="hover:underline text-indigo-600">
        Home
      </Link>

      {crumbs.map((crumb, index) => {
        const href = "/" + crumbs.slice(0, index + 1).join("/");
        const isLast = index === crumbs.length - 1;
        const label = decodeURIComponent(crumb).replace(/-/g, " "); // optional: replace dashes with spaces

        return (
          <div key={href} className="flex items-center space-x-2">
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            {isLast ? (
              <span className="text-gray-800 font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:underline text-indigo-600">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
