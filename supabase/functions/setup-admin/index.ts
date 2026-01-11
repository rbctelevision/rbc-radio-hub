import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function creates admin users - should only be run once
// After running, you should delete this function for security

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify setup key from request
    const { setupKey } = await req.json();
    const expectedKey = Deno.env.get("ADMIN_SETUP_KEY");
    
    if (!expectedKey || setupKey !== expectedKey) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const adminUsers = [
      { email: "admin@rbctelevision.org", password: "pa##^ord" },
      { email: "technology@rbctelevision.org", password: "Raa@RBC" },
    ];

    const results = [];

    for (const admin of adminUsers) {
      // Create user
      const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email: admin.email,
        password: admin.password,
        email_confirm: true,
      });

      if (createError) {
        // User might already exist
        if (createError.message.includes("already been registered")) {
          results.push({ email: admin.email, status: "already exists" });
          continue;
        }
        results.push({ email: admin.email, status: "error", error: createError.message });
        continue;
      }

      if (userData.user) {
        // Assign admin role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: userData.user.id,
            role: "admin",
          });

        if (roleError) {
          results.push({ email: admin.email, status: "created but role failed", error: roleError.message });
        } else {
          results.push({ email: admin.email, status: "created with admin role" });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
