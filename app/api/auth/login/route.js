import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  startSession,
  verifyPasswordAndMakeToken,
} from "@/lib/auth";

export async function POST(request) {
  const contentType = request.headers.get("content-type") ?? "";
  let password = "";
  let next = "/";
  let isFormSubmit = false;

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    password = String(body?.password ?? "");
    next = String(body?.next ?? "/");
  } else {
    isFormSubmit = true;
    const form = await request.formData().catch(() => null);
    password = String(form?.get("password") ?? "");
    next = String(form?.get("next") ?? "/");
  }

  if (!next.startsWith("/")) {
    next = "/";
  }

  const result = verifyPasswordAndMakeToken(password);
  if (!result.ok) {
    if (isFormSubmit) {
      return NextResponse.redirect(
        new URL(`/login?next=${encodeURIComponent(next)}`, request.url),
        303
      );
    }
    return NextResponse.json(
      {
        status: "error",
        message:
          result.reason === "no-password"
            ? "No admin password is configured on the server yet. Set ADMIN_PASSWORD in .env.local and restart the server."
            : "Incorrect password. Please try again.",
      },
      { status: 401 }
    );
  }

  await startSession(result.token);

  if (isFormSubmit) {
    const response = NextResponse.redirect(new URL(next, request.url), 303);
    response.cookies.set(SESSION_COOKIE, result.token, sessionCookieOptions());
    return response;
  }

  const response = NextResponse.json({ status: "success" });
  response.cookies.set(SESSION_COOKIE, result.token, sessionCookieOptions());
  return response;
}
