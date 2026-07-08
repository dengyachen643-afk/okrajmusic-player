const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, x-admin-token"
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

function normalizeForModeration(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "");
}

function moderationProblem(message, name = "") {
  const text = `${message} ${name}`;
  const normalized = normalizeForModeration(text);

  if (/www\.|t\.me\/|telegram|whatsapp|onlyfans|discord\.gg|mailto:/i.test(text)) return true;
  if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text)) return true;
  if (/(?:\+?\d[\s-]?){10,}/.test(text)) return true;
  if (/([^\s])\1{7,}/.test(normalized)) return true;

  const blocked = [
    "加微信", "加vx", "加v信", "加qq", "加群", "私聊", "约炮", "裸聊",
    "博彩", "网赌", "时时彩", "贷款", "代孕", "办证", "开发票", "刷单",
    "返利", "引流", "推广", "广告位", "包养", "操你", "傻逼", "煞笔",
    "死全家", "去死", "nmsl", "fuck", "porn", "casino"
  ];

  return blocked.some(word => normalized.includes(normalizeForModeration(word)));
}

function reject(message, status = 400) {
  return json({ error: message }, status);
}

function isAdmin(request, env) {
  const token = request.headers.get("x-admin-token") || "";
  return Boolean(env.ADMIN_TOKEN) && token === env.ADMIN_TOKEN;
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
      if (moderationProblem(message, name)) return reject("这张纸条可能太像广告或攻击性内容了，换个说法再贴吧。");

      const id = crypto.randomUUID();
      const color = colors[Math.floor(Math.random() * colors.length)];
      const createdAt = new Date().toISOString();

      await env.DB.prepare(
        "INSERT INTO notes (id, name, message, track, page, color, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(id, name, message, track, page, color, createdAt).run();

      return json({ ok: true, id, created_at: createdAt }, 201);
    }

    const deleteMatch = url.pathname.match(/^\/notes\/([^/]+)$/);
    if (deleteMatch && request.method === "DELETE") {
      if (!isAdmin(request, env)) return reject("unauthorized", 401);
      const id = decodeURIComponent(deleteMatch[1]);
      await env.DB.prepare("DELETE FROM notes WHERE id = ?").bind(id).run();
      return json({ ok: true });
    }

    return reject("not found", 404);
  }
};
