"use client";
import { useEffect, useState, ReactNode } from "react";
import { supabase } from "../../lib/db";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile && allowedRoles.includes(profile.role)) {
        setAuthorized(true);
      } else {
        router.push("/login");
      }
      setLoading(false);
    }
    checkAuth();
  }, [allowedRoles, router]);

  if (loading) return <p>Loading...</p>;
  if (!authorized) return null;

  return <>{children}</>;
}