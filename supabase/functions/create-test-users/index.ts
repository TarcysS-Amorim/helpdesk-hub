import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const testUsers = [
      { email: "admin@local.dev", password: "Admin123!", name: "Admin User", role: "ADMIN" },
      { email: "tech@local.dev", password: "Tech123!", name: "Tech User", role: "TECH" },
      { email: "customer@local.dev", password: "Customer123!", name: "Customer User", role: "CUSTOMER" },
    ];

    const results = [];

    for (const user of testUsers) {
      // Check if user exists
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const exists = existingUser?.users?.some((u) => u.email === user.email);

      if (exists) {
        results.push({ email: user.email, status: "already exists" });
        continue;
      }

      // Create user
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role,
        },
      });

      if (error) {
        results.push({ email: user.email, status: "error", error: error.message });
      } else {
        results.push({ email: user.email, status: "created", id: data.user.id });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
