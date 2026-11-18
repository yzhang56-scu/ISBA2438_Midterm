"use server";

import { validateContact, appendSubmission } from "@/lib/contact-store";

export async function submitContact(prevState, formData) {
  const { name, email, message, errors } = validateContact({
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    message: String(formData.get("message") || ""),
  });

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      errors,
      message: "Please fix the highlighted fields and try again.",
    };
  }

  try {
    await appendSubmission({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      message,
      submittedAt: new Date().toISOString(),
    });
  } catch {
    return {
      status: "error",
      errors: {},
      message:
        "Something went wrong while saving your message. Please try again.",
    };
  }

  return {
    status: "success",
    errors: {},
    message: "Thank you! Your message has been received.",
  };
}
