"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/db";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fadeIn, setFadeIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👁️ toggle state
  const router = useRouter();

  useEffect(() => {
    setFadeIn(true);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.signInWithPassword({
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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      setError(profileError.message);
      return;
    }

    if (!profile) {
      setError("No profile found for this user.");
      return;
    }

    if (profile.role === "admin") router.push("/admin");
    else if (profile.role === "manager") router.push("/reports");
    else if (profile.role === "cashier") router.push("/pos");
    else if (profile.role === "viewer") router.push("/reports");
    else setError("Unknown role: " + profile.role);
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gray-50 transition-opacity duration-500 ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="bg-white shadow-md rounded-lg p-8 w-96 space-y-6">
        {/* Logo + Welcome */}
        <div className="flex flex-col items-center text-center">
          <Image src="/logo.png" alt="Quickmart Logo" width={100} height={100} />
          <h1 className="text-2xl font-bold text-gray-800 mt-4">
            Welcome to Quickmart, Courtesy of Qtrinova Labs. Africa
          </h1>
          <p className="text-gray-600">Please log in to continue</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && <p className="text-red-600 text-center">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-2"
            required
          />

          {/* Password with toggle */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded p-2 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}