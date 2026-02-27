"use client";

import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../lib/db";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    router.push("/login");
  }

  return (
    <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="Quickmart Logo" width={40} height={40} />
        <span className="text-xl font-bold text-gray-800">Quickmart</span>
      </div>
      <nav className="flex gap-4 items-center">
        <Link href="/pos" className="text-gray-700 hover:text-green-600 font-medium">
          POS
        </Link>
        <Link href="/reports" className="text-gray-700 hover:text-green-600 font-medium">
          Reports
        </Link>
        <Link href="/inventory" className="text-gray-700 hover:text-green-600 font-medium">
          Inventory
        </Link>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          {loading ? "Logging out..." : "Logout"}
        </button>
      </nav>
    </header>
  );
}