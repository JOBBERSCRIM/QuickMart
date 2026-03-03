import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/adminDb";  // ✅ service role client

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Missing email, password, or role" },
        { status: 400 }
      );
    }

    // 1. Create user in auth.users (trigger will auto-create profile)
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createError) {
      console.error("Auth createUser error:", createError);
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // 2. Update the profile row created by the trigger with the role
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ role })
      .eq("id", newUser.user.id);

    if (updateError) {
      console.error("Profiles update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: newUser.user });
  } catch (err: any) {
    console.error("Route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
