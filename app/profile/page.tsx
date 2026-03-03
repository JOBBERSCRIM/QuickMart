"use client";

import Link from "next/link";
import { supabase } from "../../lib/db";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        setUser(user);
      }
    }
    fetchUser();
  }, []);

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      {user ? (
        <div className="space-y-4">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user.id}</p>

          <div className="mt-6 space-y-3">
            {/* ✅ Link to voluntary Change Password page */}
            <Link
              href="/change-password"
              className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center"
            >
              Change Password
            </Link>

            {/* Future expansion: add more account settings here */}
            <Link
              href="/settings"
              className="block bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 text-center"
            >
              Account Settings
            </Link>
          </div>
        </div>
      ) : (
        <p>Loading user information...</p>
      )}
    </div>
  );
}
