"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";

const navLinks = [
  { href: "/university/dashboard", label: "Dashboard" },
  { href: "/university/issue-diploma", label: "Issue Diploma" },
  { href: "/university/batch-upload", label: "Batch Upload" },
  { href: "/university/revoke", label: "Revoke" },
];

export default function UniversityLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { university, token, logout, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!token && typeof window !== "undefined" && !localStorage.getItem("access_token")) {
      router.push("/auth/login");
    }
  }, [token, router]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      <aside className="w-56 bg-slate-800 flex flex-col p-4 gap-2 shrink-0">
        <div className="mb-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider">University</p>
          <p className="font-semibold truncate">{university?.name || "..."}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
            university?.status === "APPROVED" ? "bg-emerald-700" :
            university?.status === "PENDING" ? "bg-yellow-700" : "bg-red-700"
          }`}>
            {university?.status || "..."}
          </span>
        </div>
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-2 rounded-lg text-sm transition ${
              pathname === l.href ? "bg-blue-600" : "hover:bg-slate-700"
            }`}
          >
            {l.label}
          </Link>
        ))}
        <button
          onClick={() => { logout(); router.push("/auth/login"); }}
          className="mt-auto px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-700 text-left"
        >
          Logout
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
