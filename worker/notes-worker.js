const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type"
};

const colors = ["#efe2c1", "#dce3d5", "#d8dfdf", "#eee0df", "#e7e1c8", "#d5ddc8", "#d9d4c6"];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" }
  });
}

function cleanText(value, maxLength) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function reject(message, status = 400) {
  return json({ error: message }, status);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    if (url.pathname === "/notes" && request.method === "GET") {
      const result = await env.DB.prepare(
        "SELECT id, name, message, track, color, created_at FROM notes ORDER BY created_at DESC LIMIT 80"
      ).all();
      return json({ notes: result.results || [] });
    }

    if (url.pathname === "/notes" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch (error) {
        return reject("invalid json");
      }

      const message = cleanText(body.message, 300);
      const name = cleanText(body.name, 24);
      const track = cleanText(body.track, 120);
      const page = cleanText(body.page, 240);

      if (!message) return reject("message required");
      if (/https?:\/\//i.test(message)) return reject("links are not allowed");

      const id = crypto.randomUUID();
      const color = colors[Math.floor(Math.random() * colors.length)];
      const createdAt = new Date().toISOString();

      await env.DB.prepare(
        "INSERT INTO notes (id, name, message, track, page, color, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(id, name, message, track, page, color, createdAt).run();

      return json({ ok: true, id, created_at: createdAt }, 201);
    }

    return reject("not found", 404);
  }
};
