import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Judge0 CE (free hosted instance)
const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com";

// Language ID mapping for Judge0
const LANGUAGE_MAP: Record<string, number> = {
  python: 71,     // Python 3
  javascript: 63, // Node.js
  java: 62,       // Java
  cpp: 54,        // C++
  c: 50,          // C
  typescript: 74,
  ruby: 72,
  go: 60,
  rust: 73,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { code, language, stdin } = await req.json();

    if (!code || !language) {
      return new Response(JSON.stringify({ error: "Missing code or language" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const languageId = LANGUAGE_MAP[language];
    if (!languageId) {
      return new Response(JSON.stringify({ error: `Unsupported language: ${language}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RAPIDAPI_KEY = Deno.env.get("JUDGE0_API_KEY");
    if (!RAPIDAPI_KEY) {
      // Fallback: simulate execution for demo
      return new Response(JSON.stringify({
        stdout: "⚠️ Judge0 API key not configured.\nPlease add JUDGE0_API_KEY secret to enable real code execution.\n\nSimulated output: Hello, World!",
        stderr: "",
        status: { description: "Demo Mode" },
        time: "0.001",
        memory: 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Submit code to Judge0
    const submitRes = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true&fields=*`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify({
        source_code: btoa(unescape(encodeURIComponent(code))),
        language_id: languageId,
        stdin: stdin ? btoa(unescape(encodeURIComponent(stdin))) : "",
        cpu_time_limit: 5,
        memory_limit: 128000,
      }),
    });

    if (!submitRes.ok) {
      const err = await submitRes.text();
      console.error("Judge0 error:", submitRes.status, err);
      return new Response(JSON.stringify({ error: "Code execution service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await submitRes.json();

    // Decode base64 outputs
    const decode = (s: string | null) => {
      if (!s) return "";
      try { return decodeURIComponent(escape(atob(s))); } catch { return s; }
    };

    return new Response(JSON.stringify({
      stdout: decode(result.stdout),
      stderr: decode(result.stderr),
      compile_output: decode(result.compile_output),
      status: result.status,
      time: result.time,
      memory: result.memory,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("execute-code error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
