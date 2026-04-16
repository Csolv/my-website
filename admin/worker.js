/**
 * ADC Grant Proposal Writer — Cloudflare Worker
 * Uses Groq API (free tier — no credit card required)
 *
 * SETUP:
 * 1. Get free API key at console.groq.com
 * 2. Run: wrangler secret put GROQ_API_KEY
 * 3. Run: wrangler deploy
 */

const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_API   = "https://api.groq.com/openai/v1/chat/completions";
const MAX_TOKENS = 8192;

export default {
  async fetch(request, env) {

    // ── CORS pre-flight ──────────────────────────────────────────────────────
    const corsHeaders = {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    // ── parse body ───────────────────────────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { system, prompt } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required field: prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── call Groq ────────────────────────────────────────────────────────────
    const apiKey = env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY secret not configured on this Worker." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const messages = [];
    if (system) {
      messages.push({ role: "system", content: system });
    }
    messages.push({ role: "user", content: prompt });

    const groqPayload = {
      model: GROQ_MODEL,
      messages,
      max_tokens: MAX_TOKENS,
    };

    let groqResponse;
    try {
      groqResponse = await fetch(GROQ_API, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify(groqPayload),
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: `Failed to reach Groq API: ${err.message}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      return new Response(
        JSON.stringify({ error: `Groq API error ${groqResponse.status}: ${errText}` }),
        { status: groqResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const groqData = await groqResponse.json();
    const text = groqData?.choices?.[0]?.message?.content ?? "";

    return new Response(
      JSON.stringify({ text }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  },
};
