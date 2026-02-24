// app/api/updateRole/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, newRole } = body;

    if (!userId || !newRole) {
      return NextResponse.json({ error: "Missing userId or newRole" }, { status: 400 });
    }

    // Update the role in the profiles table
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId)
      .select();

    if (error) {
      console.error("Supabase updateRole error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("Role updated:", data);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("updateRole route error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}