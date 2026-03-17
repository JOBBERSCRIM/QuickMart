"use client";

import Link from "next/link";
import { supabase } from "../../lib/db";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        setUser(user);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Profile Card */}
        <div className="bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-gray-100">
          {/* Decorative Header */}
          <div className="h-32 bg-gradient-to-r from-green-600 to-green-800 flex items-end justify-center pb-0">
            <div className="bg-white p-2 rounded-full translate-y-12 shadow-lg">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center text-3xl">
                👤
              </div>
            </div>
          </div>

          <div className="pt-16 pb-10 px-8 text-center">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">Account Profile</h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-8">
              User Credentials & Security
            </p>

            {user ? (
              <div className="space-y-6">
                {/* Info Fields */}
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-start">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</span>
                    <span className="text-gray-800 font-bold break-all">{user.email}</span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-start">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Internal User ID</span>
                    <span className="text-gray-500 font-mono text-xs break-all">{user.id}</span>
                  </div>
                </div>

                <hr className="border-gray-50" />

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    href="/change-password"
                    className="group flex items-center justify-between bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-2xl font-black transition-all shadow-lg shadow-green-200 active:scale-95"
                  >
                    <span>CHANGE PASSWORD</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>

                  <Link
                    href="/settings"
                    className="group flex items-center justify-between bg-gray-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95"
                  >
                    <span>ACCOUNT SETTINGS</span>
                    <span className="opacity-50">⚙️</span>
                  </Link>
                </div>

                <p className="text-[10px] text-gray-400 font-bold uppercase mt-8">
                  Secured by Qtrinova Labs
                </p>
              </div>
            ) : (
              <div className="py-10 text-red-500 font-bold">
                Session expired. Please log in again.
              </div>
            )}
          </div>
        </div>

        {/* Back to Portal Link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-gray-400 hover:text-green-600 font-black text-xs uppercase tracking-widest transition-colors">
            ← Back to Main Portal
          </Link>
        </div>
      </div>
    </div>
  );
}