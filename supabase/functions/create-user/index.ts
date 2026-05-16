import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error("Faltan secrets de Supabase");

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");

    const { data: requesterData, error: requesterError } = await supabaseAdmin.auth.getUser(token);
    if (requesterError || !requesterData?.user) {
      return new Response(JSON.stringify({ error: "No autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: requesterProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", requesterData.user.id)
      .single();

    if (!["admin", "jefe"].includes(requesterProfile?.role)) {
      return new Response(JSON.stringify({ error: "Sin permiso" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { full_name, email, phone, password, role, base, create_person_record = true } = body;
    if (!full_name || !email || !password || !role) throw new Error("Faltan datos obligatorios");

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role },
    });
    if (createError) throw createError;

    const userId = created.user.id;
    const profile = { id: userId, full_name, email, phone: phone || "", role, base: base || "", disabled: false };

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(profile);
    if (profileError) throw profileError;

    if (create_person_record && role === "conductor") {
      const { error } = await supabaseAdmin.from("conductores").insert({ user_id: userId, full_name, phone: phone || "", email, base: base || "", status: "activo" });
      if (error) throw error;
    }

    if (create_person_record && role === "monitor") {
      const { error } = await supabaseAdmin.from("monitores").insert({ user_id: userId, full_name, phone: phone || "", email, base: base || "", status: "activo" });
      if (error) throw error;
    }

    return new Response(JSON.stringify({ ok: true, user: created.user, profile }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
