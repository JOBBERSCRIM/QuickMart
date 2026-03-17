"use client";

import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../lib/db";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    router.push("/login");
  }

  const navLinks = [
    { name: "POS", href: "/pos" },
    { name: "Reports", href: "/reports" },
    { name: "Inventory", href: "/inventory" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-3 flex items-center justify-between shadow-sm">
      {/* Brand Section */}
      <Link href="/" className="flex items-center gap-4 group">
        <div className="bg-gray-50 p-1.5 rounded-xl group-hover:bg-green-50 transition-colors">
          <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black text-gray-900 tracking-tighter leading-none">
            Denis' Entreprises
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Management System
          </span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                isActive
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            loading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white shadow-sm active:scale-95"
          }`}
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></span>
          ) : (
            "Logout"
          )}
        </button>
      </div>
    </header>
  );
}