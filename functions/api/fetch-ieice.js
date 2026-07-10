const MAX_BYTES = 5 * 1024 * 1024;
const TIMEOUT_MS = 10000;

function json(data, init = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers || {}),
    },
  });
}

function validateTarget(rawUrl) {
  if (!rawUrl) throw new Error("Missing url parameter.");

  let target;
  try {
    target = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL.");
  }

  if (target.protocol !== "https:") {
    throw new Error("Only https:// URLs are allowed.");
  }

  if (target.hostname !== "ken.ieice.org") {
    throw new Error("Only ken.ieice.org is allowed.");
  }

  if (!target.pathname.startsWith("/ken/program/")) {
    throw new Error("Only /ken/program/ pages are allowed.");
  }

  target.hash = "";
  return target;
}

function detectCharset(contentType, bytes) {
  const fromHeader = String(contentType || "").match(/charset=([^;]+)/i)?.[1]?.trim();
  if (fromHeader) return fromHeader.toLowerCase();

  const prefix = new TextDecoder("utf-8", { fatal: false }).decode(bytes.slice(0, 4096));
  const fromMeta = prefix.match(/<meta[^>]+charset=["']?\s*([^\s"'>]+)/i)?.[1]?.trim();
  if (fromMeta) return fromMeta.toLowerCase();

  return "utf-8";
}

function decodeHtml(bytes, contentType) {
  const charset = detectCharset(contentType, bytes);
  const candidates = [charset, "utf-8", "shift_jis", "euc-jp"];

  for (const enc of [...new Set(candidates)]) {
    try {
      return new TextDecoder(enc, { fatal: false }).decode(bytes);
    } catch (_) {
      // Some runtimes may not support every legacy encoding.
    }
  }

  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

export async function onRequestGet(context) {
  const reqUrl = new URL(context.request.url);
  let target;

  try {
    target = validateTarget(reqUrl.searchParams.get("url"));
  } catch (error) {
    return json({ error: error.message }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), TIMEOUT_MS);

  try {
    const upstream = await fetch(target.toString(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "accept": "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
        "user-agent": "IEICE-KEN-Timetable-Renderer/1.0 (+https://github.com/)"
      }
    });

    const contentLength = Number(upstream.headers.get("content-length") || "0");
    if (contentLength && contentLength > MAX_BYTES) {
      return json({ error: "The IEICE page is too large to fetch safely." }, { status: 413 });
    }

    const buffer = await upstream.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) {
      return json({ error: "The IEICE page is too large to fetch safely." }, { status: 413 });
    }

    const bytes = new Uint8Array(buffer);
    const html = decodeHtml(bytes, upstream.headers.get("content-type"));

    if (!upstream.ok) {
      return json({
        error: `IEICE returned HTTP ${upstream.status}.`,
        url: target.toString(),
        status: upstream.status,
        html
      }, { status: 502 });
    }

    return json({
      url: target.toString(),
      fetchedAt: new Date().toISOString(),
      contentType: upstream.headers.get("content-type") || "",
      bytes: buffer.byteLength,
      html
    });
  } catch (error) {
    const message = error?.name === "AbortError" || String(error?.message || error).includes("timeout")
      ? "Timed out while fetching the IEICE page."
      : String(error?.message || error);
    return json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
