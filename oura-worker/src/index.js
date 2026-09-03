const OURA_AUTH_URL = "https://cloud.ouraring.com/oauth/authorize";
const OURA_TOKEN_URL = "https://api.ouraring.com/oauth/token";
const OURA_API_BASE = "https://api.ouraring.com/v2/usercollection";
const TOKEN_KEY = "oura_tokens";

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };
}

function json(data, status, extraHeaders) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

async function getTokens(env) {
  const raw = await env.OURA_TOKENS.get(TOKEN_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function saveTokens(env, tokens) {
  await env.OURA_TOKENS.put(TOKEN_KEY, JSON.stringify(tokens));
}

async function refreshIfNeeded(env, tokens) {
  if (tokens.expires_at && Date.now() < tokens.expires_at - 60000) return tokens;
  const res = await fetch(OURA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokens.refresh_token,
      client_id: env.OURA_CLIENT_ID,
      client_secret: env.OURA_CLIENT_SECRET,
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
  const data = await res.json();
  const updated = {
    access_token: data.access_token,
    refresh_token: data.refresh_token || tokens.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  await saveTokens(env, updated);
  return updated;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(env) });
    }

    // Step 1: send the user to Oura to authorize this app. Open once manually.
    if (url.pathname === "/login") {
      const authUrl = new URL(OURA_AUTH_URL);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("client_id", env.OURA_CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", env.OURA_REDIRECT_URI);
      authUrl.searchParams.set("scope", "daily");
      return Response.redirect(authUrl.toString(), 302);
    }

    // Step 2: Oura redirects back here with a code; exchange it for tokens and store them.
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");
      if (error) return new Response(`Oura hat die Verbindung abgelehnt: ${error}`, { status: 400 });
      if (!code) return new Response("Kein Code erhalten.", { status: 400 });

      const res = await fetch(OURA_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: env.OURA_REDIRECT_URI,
          client_id: env.OURA_CLIENT_ID,
          client_secret: env.OURA_CLIENT_SECRET,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        return new Response(`Token-Austausch fehlgeschlagen: ${res.status} ${text}`, { status: 502 });
      }
      const data = await res.json();
      await saveTokens(env, {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + data.expires_in * 1000,
      });
      return new Response(
        "<html><body style='font-family:sans-serif;text-align:center;padding:4rem'><h2>Oura verbunden ✓</h2><p>Du kannst dieses Fenster jetzt schließen.</p></body></html>",
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    // Whether tokens exist at all (no secrets exposed).
    if (url.pathname === "/status") {
      const tokens = await getTokens(env);
      return json({ connected: !!tokens }, 200, corsHeaders(env));
    }

    // The endpoint the dashboard actually calls.
    if (url.pathname === "/api/readiness") {
      const auth = request.headers.get("Authorization") || "";
      if (env.DASHBOARD_API_KEY && auth !== `Bearer ${env.DASHBOARD_API_KEY}`) {
        return json({ error: "unauthorized" }, 401, corsHeaders(env));
      }

      let tokens = await getTokens(env);
      if (!tokens) return json({ error: "not_connected" }, 409, corsHeaders(env));

      try {
        tokens = await refreshIfNeeded(env, tokens);
      } catch (e) {
        return json({ error: "refresh_failed", message: e.message }, 502, corsHeaders(env));
      }

      const date = url.searchParams.get("date") || todayIso();
      const headers = { Authorization: `Bearer ${tokens.access_token}` };

      const [readinessRes, sleepRes] = await Promise.all([
        fetch(`${OURA_API_BASE}/daily_readiness?start_date=${date}&end_date=${date}`, { headers }),
        fetch(`${OURA_API_BASE}/daily_sleep?start_date=${date}&end_date=${date}`, { headers }),
      ]);

      if (!readinessRes.ok || !sleepRes.ok) {
        return json(
          { error: "oura_api_error", readinessStatus: readinessRes.status, sleepStatus: sleepRes.status },
          502,
          corsHeaders(env)
        );
      }

      const readinessData = await readinessRes.json();
      const sleepData = await sleepRes.json();

      return json(
        {
          date,
          readiness_score: readinessData.data?.[0]?.score ?? null,
          sleep_score: sleepData.data?.[0]?.score ?? null,
        },
        200,
        corsHeaders(env)
      );
    }

    return new Response("Not found", { status: 404 });
  },
};
