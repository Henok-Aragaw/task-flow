import { createClient } from "@supabase/supabase-js"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  })

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: CORS_HEADERS })

  try {
    const { project_id } = await req.json()
    if (!project_id) return json({ error: "project_id is required" }, 400)

    const auth = req.headers.get("Authorization")
    if (!auth) return json({ error: "Authorization header missing" }, 401)

    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")
    if (!supabaseUrl || !supabaseAnonKey) return json({ error: "Supabase environment is not configured" }, 500)

    const sb = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: auth } } })

    const { data, error } = await sb
      .from("tasks")
      .select("title, profiles:profiles!tasks_assignee_id_fkey ( full_name, email )")
      .eq("project_id", project_id)
      .lt("due_date", new Date().toISOString())
      .neq("status", "done")

    if (error) return json({ error: error.message }, 400)

    type AssigneeProfile = { full_name: string | null; email: string | null }

    const result = (data ?? []).map((t) => {
      const profiles = t.profiles as AssigneeProfile | AssigneeProfile[] | null
      const p = Array.isArray(profiles) ? (profiles[0] ?? null) : profiles

      return { task_title: t.title, assignee_name: p ? (p.full_name ?? p.email) : null }
    })

    return json(result)
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Internal Server Error" }, 500)
  }
})
