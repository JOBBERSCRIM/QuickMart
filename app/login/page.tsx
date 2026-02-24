"use client";

import { useState } from "react";
import { supabase } from "../../lib/db";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    // Sign in with Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    if (!user) {
      setError("Login failed: no user returned.");
      return;
    }

    console.log("Logged in user:", user); // ✅ Debug: check UUID

    // Fetch profile role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile query error:", profileError.message);
      setError(profileError.message);
      return;
    }

    if (!profile) {
      setError("No profile found for this user.");
      return;
    }

    console.log("Profile lookup:", profile); // ✅ Debug: confirm role

    // Route based on role
    if (profile.role === "admin") router.push("/admin");
    else if (profile.role === "manager") router.push("/reports");
    else if (profile.role === "cashier") router.push("/pos");
    else if (profile.role === "viewer") router.push("/reports");
    else setError("Unknown role: " + profile.role);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-md rounded-lg p-6 w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-gray-800">🔐 Login</h1>
        {error && <p className="text-red-600">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}