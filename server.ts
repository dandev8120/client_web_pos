import dotenv from "dotenv";
import express from "express";
import crypto from "crypto";
import fs from "fs";
import http from "http";
import https from "https";
import net from "net";
import path from "path";
import { createServer as createViteServer } from "vite";

const appEnv = process.env.NODE_ENV || "development";
const envRoot = process.cwd();
dotenv.config({ path: path.join(envRoot, `.env.${appEnv}`) });
dotenv.config({ path: path.join(envRoot, ".env.local"), override: true });

const jsonBodyParser = express.json({ limit: "10mb" });
const formBodyParser = express.urlencoded({ extended: true, limit: "10mb" });
const sessionCookieName = process.env.APP_SESSION_COOKIE_NAME || "POS_PORTAL_SESSION_ID";
const csrfCookieName = process.env.APP_CSRF_COOKIE_NAME || "POS_PORTAL_CSRF_TOKEN";
const csrfHeaderName = "x-csrf-token";
const sessionMaxAgeSeconds = Number(process.env.APP_SESSION_MAX_AGE_SECONDS || 12 * 60 * 60);
const appSessions = new Map<string, AppSession>();
const allowSelfSignedLocalApi =
  String(process.env.POS_CENTER_API_ALLOW_SELF_SIGNED || "").toLowerCase() === "true";

interface AppSession {
  id: string;
  csrfToken: string;
  accessToken?: string;
  idToken?: string;
  user: Record<string, unknown>;
  createdAt: number;
  lastSeenAt: number;
  expiresAt: number;
}

function parseCookies(req: express.Request) {
  const rawCookie = req.headers.cookie;
  if (!rawCookie) return {};

  return rawCookie.split(";").reduce<Record<string, string>>((cookies, part) => {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) return cookies;

    const key = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();
    if (key) {
      try {
        cookies[key] = decodeURIComponent(value);
      } catch {
        cookies[key] = value;
      }
    }
    return cookies;
  }, {});
}

function serializeCookie(
  name: string,
  value: string,
  maxAgeSeconds: number,
  secure: boolean,
  options: { httpOnly?: boolean; sameSite?: "Strict" | "Lax" | "None" } = {}
) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    `SameSite=${options.sameSite || "Lax"}`,
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (options.httpOnly !== false) parts.push("HttpOnly");
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

function serializeSessionCookie(session: AppSession, secure: boolean) {
  return serializeCookie(sessionCookieName, session.id, sessionMaxAgeSeconds, secure, {
    httpOnly: true,
    sameSite: "Lax",
  });
}

function serializeCsrfCookie(session: AppSession, secure: boolean) {
  return serializeCookie(csrfCookieName, session.csrfToken, sessionMaxAgeSeconds, secure, {
    httpOnly: false,
    sameSite: "Lax",
  });
}

function getSessionCookies(session: AppSession, secure: boolean) {
  return [
    serializeSessionCookie(session, secure),
    serializeCsrfCookie(session, secure),
  ];
}

function clearCookie(name: string, secure: boolean, httpOnly: boolean) {
  return serializeCookie(name, "", 0, secure, {
    httpOnly,
    sameSite: "Lax",
  });
}

function getClearSessionCookies(secure: boolean) {
  return [
    clearCookie(sessionCookieName, secure, true),
    clearCookie(csrfCookieName, secure, false),
  ];
}

function sweepExpiredSessions() {
  const now = Date.now();
  appSessions.forEach((session, sessionId) => {
    if (session.expiresAt <= now) {
      appSessions.delete(sessionId);
    }
  });
}

function getAppSession(req: express.Request) {
  const sessionId = parseCookies(req)[sessionCookieName];
  if (!sessionId) return null;

  const session = appSessions.get(sessionId);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    appSessions.delete(sessionId);
    return null;
  }

  session.lastSeenAt = Date.now();
  return session;
}

function toSessionResponse(session: AppSession) {
  return {
    id: session.id,
    user: session.user,
    createdAt: new Date(session.createdAt).toISOString(),
    lastSeenAt: new Date(session.lastSeenAt).toISOString(),
    expiresAt: new Date(session.expiresAt).toISOString(),
  };
}

function createTraceId() {
  return crypto.randomUUID();
}

function getRequestIp(req: express.Request) {
  const forwardedFor = String(req.headers["x-forwarded-for"] || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean)[0];

  return forwardedFor || req.socket.remoteAddress || "";
}

function setCorsHeaders(res: express.Response) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization, X-CSRF-Token");
}

function setSecurityHeaders(_req: express.Request, res: express.Response, next: express.NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
}

function isUnsafeMethod(method: string) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
}

function isCsrfExempt(req: express.Request) {
  if (req.method.toUpperCase() === "POST" && req.path === "/api/session") {
    return true;
  }

  return req.path.startsWith("/oidc-proxy/");
}

function timingSafeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyCsrfToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!isUnsafeMethod(req.method) || isCsrfExempt(req)) {
    next();
    return;
  }

  const session = getAppSession(req);
  if (!session) {
    next();
    return;
  }

  const csrfHeader = String(req.headers[csrfHeaderName] || "");
  const csrfCookie = parseCookies(req)[csrfCookieName] || "";

  if (
    csrfHeader &&
    csrfCookie &&
    timingSafeEquals(csrfHeader, session.csrfToken) &&
    timingSafeEquals(csrfCookie, session.csrfToken)
  ) {
    next();
    return;
  }

  return res.status(403).json({
    success: false,
    code: 403,
    message: "CSRF token không hợp lệ hoặc đã hết hạn.",
  });
}

function hasRequestBody(method: string) {
  return !["GET", "HEAD"].includes(method.toUpperCase());
}

function buildRequestBody(req: express.Request): string | undefined {
  if (!hasRequestBody(req.method)) return undefined;

  const contentType = String(req.headers["content-type"] || "");
  const hasParsedBody = req.body !== undefined && req.body !== null;
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return hasParsedBody ? new URLSearchParams(req.body as Record<string, string>).toString() : undefined;
  }

  if (hasParsedBody) {
    return JSON.stringify(req.body);
  }

  return undefined;
}

function stripVietnamese(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function buildEscPosPayload(content: string, autoCut: boolean, asciiOnly = true) {
  const normalizedContent = asciiOnly ? stripVietnamese(content) : content;
  const init = "\x1b@";
  const codePage = "\x1bt\x00";
  const feed = "\n\n\n";
  const cut = autoCut ? "\x1dV\x42\x00" : "";
  return Buffer.from(`${init}${codePage}${normalizedContent}${feed}${cut}`, "utf8");
}

function sendToNetworkPrinter(host: string, port: number, payload: Buffer, timeoutMs = 5000) {
  return new Promise<{ bytesWritten: number }>((resolve, reject) => {
    const socket = new net.Socket();
    let settled = false;

    const finish = (err?: Error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      if (err) reject(err);
      else resolve({ bytesWritten: payload.byteLength });
    };

    socket.setTimeout(timeoutMs);
    socket.once("timeout", () => finish(new Error(`Printer connection timed out after ${timeoutMs}ms`)));
    socket.once("error", finish);
    socket.connect(port, host, () => {
      socket.write(payload, err => {
        if (err) {
          finish(err);
          return;
        }
        socket.end();
      });
    });
    socket.once("close", hadError => {
      if (!hadError) finish();
    });
  });
}

function getPrinterRequest(req: express.Request) {
  const host = String(req.body?.host || req.body?.printerIp || "").trim();
  const port = Number(req.body?.port || req.body?.printerPort || 9100);
  const autoCut = req.body?.autoCut !== false;
  const copies = Math.min(Math.max(Number(req.body?.copies || req.body?.copyCount || 1), 1), 3);
  const paperWidth = String(req.body?.paperWidth || "k80").toUpperCase();
  const receiptNumber = String(req.body?.receiptNumber || "TEST").trim();
  const content = String(req.body?.content || [
    "BITIS POS CENTER",
    `TEST PRINT ${paperWidth}`,
    `RECEIPT: ${receiptNumber}`,
    `TIME: ${new Date().toISOString()}`,
    "NETWORK PRINTER OK",
  ].join("\n"));

  if (!host) {
    throw new Error("Missing printer host.");
  }
  if (!Number.isFinite(port) || port <= 0 || port > 65535) {
    throw new Error("Invalid printer port.");
  }

  return { host, port, autoCut, copies, content };
}

class ProxyService {
  private shouldAllowSelfSigned(targetUrl: string) {
    if (!allowSelfSignedLocalApi) return false;

    try {
      const url = new URL(targetUrl);
      return url.protocol === "https:" && ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
    } catch {
      return false;
    }
  }

  private request(
    targetUrl: string,
    method: string,
    headers: Record<string, string>,
    body: string | undefined
  ): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: Buffer }> {
    return new Promise((resolve, reject) => {
      const url = new URL(targetUrl);
      const isHttps = url.protocol === "https:";
      const bodyBuffer = body ? Buffer.from(body) : undefined;
      const requestHeaders = bodyBuffer
        ? { ...headers, "Content-Length": String(bodyBuffer.byteLength) }
        : headers;
      const requestOptions: http.RequestOptions & https.RequestOptions = {
        method,
        headers: requestHeaders,
        rejectUnauthorized: !this.shouldAllowSelfSigned(targetUrl),
      };

      const client = isHttps ? https : http;
      const proxyReq = client.request(url, requestOptions, response => {
        const chunks: Buffer[] = [];

        response.on("data", chunk => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        response.on("end", () => {
          resolve({
            status: response.statusCode || 502,
            headers: response.headers,
            body: Buffer.concat(chunks),
          });
        });
      });

      proxyReq.on("error", reject);
      if (bodyBuffer) proxyReq.write(bodyBuffer);
      proxyReq.end();
    });
  }

  public async forward(
    req: express.Request,
    res: express.Response,
    baseUrl: string,
    targetPath: string,
    extraHeaders: Record<string, string> = {}
  ) {
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    const targetUrl = `${cleanBaseUrl}${targetPath}`;
    const contentType = String(req.headers["content-type"] || "application/json");

    try {
      const headers: Record<string, string> = {
        Accept: String(req.headers.accept || "application/json"),
        ...extraHeaders,
      };

      if (hasRequestBody(req.method)) {
        headers["Content-Type"] = contentType.includes("application/x-www-form-urlencoded")
          ? "application/x-www-form-urlencoded"
          : "application/json";
      }

      const authHeader = req.headers.authorization;
      const appSession = getAppSession(req);
      const sessionAuthHeader = appSession?.accessToken ? `Bearer ${appSession.accessToken}` : "";
      if (authHeader || sessionAuthHeader) headers.Authorization = String(authHeader || sessionAuthHeader);

      const response = await this.request(targetUrl, req.method, headers, buildRequestBody(req));

      Object.entries(response.headers).forEach(([key, value]) => {
        const lowerKey = key.toLowerCase();
        if (value !== undefined && !["content-encoding", "content-length", "transfer-encoding"].includes(lowerKey)) {
          res.setHeader(key, value);
        }
      });

      setCorsHeaders(res);
      return res.status(response.status).send(response.body);
    } catch (err: any) {
      console.error(`[Proxy] ${req.method} ${targetUrl}`, err.message || err);
      return res.status(502).json({
        success: false,
        code: 502,
        message: err.message || "Network request failed",
      });
    }
  }
}

async function startServer() {
  const app = express();
  const proxyService = new ProxyService();
  const port = Number(process.env.PORT || "44374");
  const identityServerBaseUrl = (
    process.env.VITE_OIDC_AUTHORITY ||
    process.env.IDENTITY_SERVER_BASE_URL ||
    "https://identityserver.bitisgroup.vn"
  ).replace(/\/+$/, "");
  const posCenterBaseUrl = process.env.VITE_POS_CENTER_API_URL || process.env.POS_CENTER_API_URL || "";
  const httpsEnabled = String(process.env.HTTPS_ENABLED || "").toLowerCase() === "true";
  const hmrEnabled = process.env.VITE_DEV_HMR_ENABLED === "true";
  let server: http.Server | https.Server;
  let protocol = "http";

  if (httpsEnabled) {
    const pfxPath = path.resolve(process.cwd(), process.env.HTTPS_PFX_PATH || ".certs/localhost.pfx");
    if (!fs.existsSync(pfxPath)) {
      throw new Error(`HTTPS certificate not found at ${pfxPath}`);
    }

    server = https.createServer(
      {
        pfx: fs.readFileSync(pfxPath),
        passphrase: process.env.HTTPS_PFX_PASSPHRASE || "",
      },
      app
    );
    protocol = "https";
  } else {
    server = http.createServer(app);
  }

  app.use(setSecurityHeaders);
  app.use(jsonBodyParser);
  app.use(formBodyParser);

  app.options("*", (_req, res) => {
    setCorsHeaders(res);
    res.sendStatus(204);
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      environment: appEnv,
    });
  });

  app.get("/api/audit/client-context", (req, res) => {
    const forwardedFor = String(req.headers["x-forwarded-for"] || "");
    const session = getAppSession(req);

    return res.json({
      success: true,
      context: {
        traceId: createTraceId(),
        sessionId: session?.id,
        ipAddress: getRequestIp(req),
        forwardedFor: forwardedFor || undefined,
        userAgent: req.headers["user-agent"] || "",
        acceptLanguage: req.headers["accept-language"] || "",
        host: req.headers.host || "",
        protocol,
        capturedAt: new Date().toISOString(),
      },
    });
  });

  app.post("/api/session", (req, res) => {
    const authorization = String(req.headers.authorization || "");
    const bearerToken = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";

    if (!bearerToken) {
      return res.status(401).json({
        success: false,
        message: "Missing OIDC access token.",
      });
    }

    sweepExpiredSessions();

    const now = Date.now();
    const sessionId = crypto.randomUUID();
    const session: AppSession = {
      id: sessionId,
      csrfToken: crypto.randomBytes(32).toString("base64url"),
      accessToken: bearerToken,
      idToken: typeof req.body?.idToken === "string" ? req.body.idToken : undefined,
      user: typeof req.body?.user === "object" && req.body.user ? req.body.user : {},
      createdAt: now,
      lastSeenAt: now,
      expiresAt: now + sessionMaxAgeSeconds * 1000,
    };

    appSessions.set(sessionId, session);
    res.setHeader("Set-Cookie", getSessionCookies(session, httpsEnabled));

    return res.json({
      success: true,
      session: toSessionResponse(session),
    });
  });

  app.get("/api/csrf-token", (req, res) => {
    const session = getAppSession(req);

    if (!session) {
      res.setHeader("Set-Cookie", getClearSessionCookies(httpsEnabled));
      return res.status(401).json({
        success: false,
        code: 401,
        message: "Session expired or not found.",
      });
    }

    res.setHeader("Set-Cookie", serializeCsrfCookie(session, httpsEnabled));
    return res.json({
      success: true,
      code: 200,
      data: {
        csrfToken: session.csrfToken,
        headerName: "X-CSRF-Token",
      },
    });
  });

  app.get("/api/session", (req, res) => {
    const session = getAppSession(req);

    if (!session) {
      res.setHeader("Set-Cookie", getClearSessionCookies(httpsEnabled));
      return res.status(401).json({
        success: false,
        message: "Session expired or not found.",
      });
    }

    session.expiresAt = Date.now() + sessionMaxAgeSeconds * 1000;
    res.setHeader("Set-Cookie", getSessionCookies(session, httpsEnabled));

    return res.json({
      success: true,
      session: toSessionResponse(session),
    });
  });

  app.use(verifyCsrfToken);

  app.delete("/api/session", (req, res) => {
    const sessionId = parseCookies(req)[sessionCookieName];
    if (sessionId) {
      appSessions.delete(sessionId);
    }

    res.setHeader("Set-Cookie", getClearSessionCookies(httpsEnabled));
    return res.json({ success: true });
  });

  app.post("/api/printer/test", async (req, res) => {
    try {
      const printer = getPrinterRequest(req);
      const payload = buildEscPosPayload(printer.content, printer.autoCut, true);
      const result = await sendToNetworkPrinter(printer.host, printer.port, payload);
      return res.json({
        success: true,
        message: "Test print sent to network printer.",
        printer: { host: printer.host, port: printer.port },
        bytesWritten: result.bytesWritten,
      });
    } catch (err: any) {
      return res.status(502).json({
        success: false,
        message: err.message || "Printer test failed.",
      });
    }
  });

  app.post("/api/printer/print", async (req, res) => {
    try {
      const printer = getPrinterRequest(req);
      let bytesWritten = 0;

      for (let index = 0; index < printer.copies; index += 1) {
        const copyHeader = printer.copies > 1 ? `COPY ${index + 1}/${printer.copies}\n` : "";
        const payload = buildEscPosPayload(`${copyHeader}${printer.content}`, printer.autoCut, true);
        const result = await sendToNetworkPrinter(printer.host, printer.port, payload);
        bytesWritten += result.bytesWritten;
      }

      return res.json({
        success: true,
        message: "Print job sent to network printer.",
        printer: { host: printer.host, port: printer.port },
        copies: printer.copies,
        bytesWritten,
      });
    } catch (err: any) {
      return res.status(502).json({
        success: false,
        message: err.message || "Print job failed.",
      });
    }
  });

  app.use("/.well-known", (req, res) => {
    proxyService.forward(req, res, identityServerBaseUrl, `/.well-known${req.url}`, {
      Host: new URL(identityServerBaseUrl).host,
    });
  });

  app.use("/oidc-proxy", (req, res) => {
    proxyService.forward(req, res, identityServerBaseUrl, req.url, {
      Host: new URL(identityServerBaseUrl).host,
    });
  });

  if (posCenterBaseUrl) {
    app.use("/api/receipts-center", (req, res) => {
      proxyService.forward(req, res, posCenterBaseUrl, `/api/receipts-center${req.url}`, {
        "X-Client-App": "POS-CENTER-BITIS",
        "ngrok-skip-browser-warning": "true",
      });
    });
  }

  if (appEnv !== "production") {
    if (!hmrEnabled) {
      app.get("/@vite/client", (_req, res) => {
        res.type("application/javascript").send(`
const noop = () => {};
const sheets = new Map();
export class ErrorOverlay extends HTMLElement {}
export function updateStyle(id, content) {
  let style = sheets.get(id) || document.querySelector(\`style[data-vite-dev-id="\${id}"]\`);
  if (!style) {
    style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.setAttribute("data-vite-dev-id", id);
    document.head.appendChild(style);
    sheets.set(id, style);
  }
  style.textContent = content;
}
export function removeStyle(id) {
  const style = sheets.get(id) || document.querySelector(\`style[data-vite-dev-id="\${id}"]\`);
  if (style) style.remove();
  sheets.delete(id);
}
export function injectQuery(url) { return url; }
export function createHotContext() {
  return {
    data: {},
    accept: noop,
    acceptExports: noop,
    dispose: noop,
    prune: noop,
    decline: noop,
    invalidate: noop,
    on: noop,
    off: noop,
    send: noop
  };
}
`);
      });
    }

    const vite = await createViteServer({
      mode: appEnv,
      envDir: envRoot,
      server: {
        middlewareMode: true,
        hmr: hmrEnabled ? { server } : false,
        ws: hmrEnabled ? undefined : false,
      },
      appType: "custom",
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      try {
        const indexPath = path.resolve(process.cwd(), "index.html");
        let html = fs.readFileSync(indexPath, "utf-8");
        html = await vite.transformIndexHtml(req.originalUrl, html);

        if (!hmrEnabled) {
          html = html.replace(/<script[^>]+src="\/@vite\/client"[^>]*><\/script>\s*/g, "");
        }

        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (err) {
        vite.ssrFixStacktrace(err as Error);
        next(err);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on ${protocol}://localhost:${port} (${appEnv})`);
  });
}

startServer();
