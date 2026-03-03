import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gtrvfctflazxcalarvcc.supabase.co";
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0cnZmY3RmbGF6eGNhbGFydmNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTc2MjQyOSwiZXhwIjoyMDg3MzM4NDI5fQ.1_fe3FvvoQibZ-XSwYRhKcOBBqly7vToPTbFSbJdkp0"; // paste full key

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function run() {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: "manualtest@example.com",
    password: "TempPass123!",
  });

  console.log("data:", data);
  console.log("error:", error);
}

run();
