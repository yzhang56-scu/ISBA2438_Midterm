"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  endSession,
  sessionCookieOptions,
  startSession,
  verifyPasswordAndMakeToken,
} from "@/lib/auth";

export async function loginAction(prevState, formData) {
  const password = String(formData.get("password") ?? "");
  const nextRaw = String(formData.get("next") ?? "/");
  const next = nextRaw.startsWith("/") ? nextRaw : "/";

  const result = verifyPasswordAndMakeToken(password);
  if (!result.ok) {
    return {
      status: "error",
      message:
        result.reason === "no-password"
          ? "No admin password is configured on the server yet. Set ADMIN_PASSWORD in .env.local and restart the server."
          : "Incorrect password. Please try again.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, result.token, sessionCookieOptions());
  await startSession(result.token);
  redirect(next);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await endSession(token);
  }
  cookieStore.delete(SESSION_COOKIE);
  redirect("/");
}
