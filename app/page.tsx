"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/db";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // trigger fade out before redirect
        setFadeOut(true);
        setTimeout(() => router.replace("/login"), 300); // wait for fade
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      setFadeOut(true);

      setTimeout(() => {
        if (profile?.role === "admin") router.replace("/admin");
        else if (profile?.role === "manager") router.replace("/reports");
        else if (profile?.role === "cashier") router.replace("/pos");
        else if (profile?.role === "viewer") router.replace("/reports");
        else router.replace("/login");
      }, 300); // wait for fade
    }

    checkSession();
  }, [router]);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center bg-gray-50 transition-opacity duration-300 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Spinner */}
      <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 text-lg mt-4">Checking session…</p>
    </div>
  );
}