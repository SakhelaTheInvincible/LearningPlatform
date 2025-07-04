"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Process and combine segments like ["course", "2"] => ["course 2"]
  const crumbs: { label: string; href: string }[] = [];
  for (let i = 0; i < segments.length; i++) {
    const current = segments[i];
    const next = segments[i + 1];
    const isNextNumber = next && /^\d+$/.test(next);

    if (isNextNumber) {
      const label = `${capitalize(current)} ${next}`;
      const href = "/" + segments.slice(0, i + 2).join("/");
      crumbs.push({ label, href });
      i++; // skip next segment
    } else {
      const label = capitalize(current.replace(/-/g, " "));
      const href = "/" + segments.slice(0, i + 1).join("/");
      crumbs.push({ label, href });
    }
  }

  return (
    <nav
      className="text-sm text-gray-500 flex items-center space-x-2"
      aria-label="Breadcrumb"
    >
      <Link href="/" className="hover:underline text-indigo-600">
        Home
      </Link>

      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <div key={crumb.href} className="flex items-center space-x-2">
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            {isLast ? (
              <span className="text-gray-800 font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:underline text-indigo-600"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
