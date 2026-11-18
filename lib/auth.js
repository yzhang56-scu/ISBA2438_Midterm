import crypto from "crypto";
import path from "path";
import { cookies } from "next/headers";
import {
  enqueueWrite,
  readJsonArray,
  writeJsonArrayAtomic,
} from "@/lib/json-store";

export const SESSION_COOKIE = "admin_session";
const SESSION_PURPOSE = "isba2438-midterm-admin-session-v1";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const SESSION_TTL_MS = SESSION_MAX_AGE * 1000;

function sessionsFilePath() {
  return path.join(process.cwd(), "data", "sessions.json");
}

function hashValue(value) {
  return crypto.createHash("sha256").update(String(value)).digest();
}

function tokenHash(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function safeEqual(a, b) {
  return crypto.timingSafeEqual(hashValue(a), hashValue(b));
}

function sessionToken(adminPassword) {
  return crypto
    .createHmac("sha256", adminPassword)
    .update(SESSION_PURPOSE)
    .digest("hex");
}

function pruneExpired(sessions, now) {
  return sessions.filter((session) => session.expiresAt > now);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  };
}

export function verifyPasswordAndMakeToken(password) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return { ok: false, reason: "no-password" };
  }
  if (!safeEqual(password, adminPassword)) {
    return { ok: false, reason: "wrong-password" };
  }
  return { ok: true, token: sessionToken(adminPassword) };
}

export async function startSession(token) {
  const filePath = sessionsFilePath();
  await enqueueWrite(async () => {
    const sessions = pruneExpired(await readJsonArray(filePath, "sessions"), Date.now());
    sessions.push({
      tokenHash: tokenHash(token),
      createdAt: new Date().toISOString(),
      expiresAt: Date.now() + SESSION_TTL_MS,
    });
    await writeJsonArrayAtomic(filePath, sessions);
  });
}

export async function endSession(token) {
  const filePath = sessionsFilePath();
  await enqueueWrite(async () => {
    const sessions = await readJsonArray(filePath, "sessions");
    const remaining = sessions.filter((session) => session.tokenHash !== tokenHash(token));
    await writeJsonArrayAtomic(filePath, remaining);
  });
}

export async function isAuthed() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return false;
  }
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  if (!value) {
    return false;
  }
  let sessions;
  try {
    sessions = await readJsonArray(sessionsFilePath(), "sessions");
  } catch {
    return false;
  }
  const hash = tokenHash(value);
  const now = Date.now();
  return sessions.some(
    (session) => session.tokenHash === hash && session.expiresAt > now
  );
}

export function unauthorizedResponse() {
  return Response.json(
    {
      status: "error",
      message: "Please log in with the admin password to manage this content.",
    },
    { status: 401 }
  );
}
