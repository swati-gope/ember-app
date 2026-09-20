"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "Today" },
  { href: "/dashboard/chores", label: "Chores" },
  { href: "/dashboard/meals", label: "Meal planner" },
  { href: "/dashboard/groceries", label: "Groceries" },
  { href: "/dashboard/calendar", label: "Calendar" },
  { href: "/dashboard/affirmations", label: "Affirmations" },
  { href: "/dashboard/settings", label: "Settings" },
];

// Client component only because usePathname (for the active-tab
// highlight) needs the browser's current URL. Everything else in the
// dashboard stays a Server Component.
export function DashboardNavLinks() {
  const pathname = usePathname();

  return (
    <>
      {TABS.map((t) => {
        const active = t.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={`nav-item ${active ? "active" : ""}`}>
            {t.label}
          </Link>
        );
      })}
    </>
  );
}
