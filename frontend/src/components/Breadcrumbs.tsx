"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FaHome, FaChevronRight } from "react-icons/fa";

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
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-4 border border-white/20"
      aria-label="Breadcrumb"
    >
      <div className="flex items-center space-x-2 text-sm">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            href="/" 
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-all duration-200 font-medium"
          >
            <FaHome className="text-sm" />
            Home
          </Link>
        </motion.div>

        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <div key={crumb.href} className="flex items-center space-x-2">
              <FaChevronRight className="text-gray-400 text-xs" />
              {isLast ? (
                <motion.span 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg"
                >
                  {crumb.label}
                </motion.span>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={crumb.href}
                    className="px-3 py-2 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    {crumb.label}
                  </Link>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </motion.nav>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
