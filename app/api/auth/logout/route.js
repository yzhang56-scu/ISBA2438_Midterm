import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, endSession, sessionCookieOptions } from "@/lib/auth";

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await endSession(token);
  }

  const wantsJson =
    (request.headers.get("content-type") ?? "").includes("application/json");

  if (wantsJson) {
    const response = NextResponse.json({ status: "success" });
    response.cookies.set(SESSION_COOKIE, "", {
      ...sessionCookieOptions(),
      maxAge: 0,
    });
    return response;
  }

  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
