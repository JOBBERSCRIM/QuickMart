"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/db";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fadeIn, setFadeIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setFadeIn(true);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!user) {
      setError("Login failed: no user returned.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    if (!profile) {
      setError("No profile found for this user.");
      setLoading(false);
      return;
    }

    // Route by role
    if (profile.role === "admin") router.push("/admin");
    else if (profile.role === "manager") router.push("/reports");
    else if (profile.role === "cashier") router.push("/pos");
    else if (profile.role === "viewer") router.push("/reports");
    else setError("Unknown role: " + profile.role);
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/change-password`,
    });

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSuccess("Password reset email sent! Check your inbox.");
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gray-100 p-4 transition-all duration-1000 ease-out ${
        fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md border border-gray-100">
        {/* Logo + Welcome */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="bg-gray-50 p-4 rounded-2xl mb-4 shadow-sm">
            <Image src="/logo.png" alt="Company Logo" width={80} height={80} className="object-contain" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">
            Denis' Entreprises
          </h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">
            Management Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold border border-red-100 text-center animate-shake">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm font-bold border border-green-100 text-center">
              {success}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-50 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:border-green-600 outline-none font-bold transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-50 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:border-green-600 outline-none font-bold transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "AUTHENTICATING..." : "SIGN IN"}
          </button>
        </form>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-xs font-black text-gray-400 hover:text-green-600 transition-colors uppercase tracking-tight"
          >
            Forgot your password?
          </button>
          
          <div className="text-[10px] text-gray-300 font-bold text-center">
            Courtesy of Qtrinova Labs & Job-Agaba
          </div>
        </div>
      </div>
    </div>
  );
}