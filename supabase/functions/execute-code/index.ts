import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Language ID mapping for Judge0 CE
const LANGUAGE_MAP: Record<string, number> = {
  python: 71,
  javascript: 63,
  java: 62,
  cpp: 54,
  c: 50,
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
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const languageId = LANGUAGE_MAP[language];
    if (!languageId) {
      return new Response(JSON.stringify({ error: `Unsupported language: ${language}` }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("JUDGE0_API_KEY");

    // Determine which Judge0 endpoint to use
    // If key looks like a RapidAPI key, use RapidAPI; otherwise use it as auth token for self-hosted
    // Default: use the free public Sulu-hosted instance
    let judge0Url = "https://judge0-ce.p.sulu.sh";
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (apiKey) {
      // Check if it's a RapidAPI key (they typically start with certain patterns)
      // Try Sulu first with the key as authentication token
      judge0Url = "https://judge0-ce.p.sulu.sh";
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    console.log(`Submitting to Judge0: ${judge0Url}, language: ${language} (${languageId})`);

    const submitRes = await fetch(`${judge0Url}/submissions?base64_encoded=true&wait=true&fields=*`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        source_code: btoa(unescape(encodeURIComponent(code))),
        language_id: languageId,
        stdin: stdin ? btoa(unescape(encodeURIComponent(stdin))) : "",
        cpu_time_limit: 5,
        memory_limit: 128000,
      }),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      console.error("Judge0 error:", submitRes.status, errText);

      // If auth failed, retry without auth header (free tier)
      if (submitRes.status === 401 || submitRes.status === 403) {
        console.log("Retrying without auth...");
        const retryHeaders: Record<string, string> = { "Content-Type": "application/json" };
        const retryRes = await fetch(`${judge0Url}/submissions?base64_encoded=true&wait=true&fields=*`, {
          method: "POST",
          headers: retryHeaders,
          body: JSON.stringify({
            source_code: btoa(unescape(encodeURIComponent(code))),
            language_id: languageId,
            stdin: stdin ? btoa(unescape(encodeURIComponent(stdin))) : "",
            cpu_time_limit: 5,
            memory_limit: 128000,
          }),
        });

        if (!retryRes.ok) {
          const retryErr = await retryRes.text();
          console.error("Judge0 retry error:", retryRes.status, retryErr);
          return new Response(JSON.stringify({
            error: `Code execution service error (${retryRes.status}). The free Judge0 instance may be temporarily unavailable.`,
          }), {
            status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const retryResult = await retryRes.json();
        return respondWithResult(retryResult);
      }

      return new Response(JSON.stringify({
        error: `Code execution failed (${submitRes.status}): ${errText.slice(0, 200)}`,
      }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await submitRes.json();
    return respondWithResult(result);
  } catch (e) {
    console.error("execute-code error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function respondWithResult(result: any): Response {
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
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
      "Content-Type": "application/json",
    },
  });
}
