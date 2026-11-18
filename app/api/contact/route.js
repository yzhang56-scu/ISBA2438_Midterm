import {
  appendSubmission,
  deleteSubmission,
  getSubmissionsFilePath,
  normalizeSubmission,
  readSubmissions,
  updateSubmission,
  validateContact,
} from "@/lib/contact-store";
import { isAuthed, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  if (!(await isAuthed())) {
    return unauthorizedResponse();
  }
  try {
    const submissions = await readSubmissions(getSubmissionsFilePath());
    const normalized = submissions
      .map(normalizeSubmission)
      .filter(Boolean)
      .sort((a, b) =>
        a.submittedAt < b.submittedAt ? 1 : -1
      );
    return Response.json({ status: "success", submissions: normalized });
  } catch {
    return Response.json(
      {
        status: "error",
        message:
          "Something went wrong while loading messages. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        status: "error",
        errors: {},
        message: "Invalid request body.",
      },
      { status: 400 }
    );
  }

  const { name, email, message, errors } = validateContact(body ?? {});

  if (Object.keys(errors).length > 0) {
    return Response.json(
      {
        status: "error",
        errors,
        message: "Please fix the highlighted fields and try again.",
      },
      { status: 400 }
    );
  }

  try {
    await appendSubmission({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      message,
      submittedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[api/contact POST]", error);
    return Response.json(
      {
        status: "error",
        errors: {},
        message:
          "Something went wrong while saving your message. Please try again.",
      },
      { status: 500 }
    );
  }

  return Response.json({
    status: "success",
    errors: {},
    message: "Thank you! Your message has been received.",
  }, { status: 201 });
}

export async function PATCH(request) {
  if (!(await isAuthed())) {
    return unauthorizedResponse();
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        status: "error",
        errors: {},
        message: "Invalid request body.",
      },
      { status: 400 }
    );
  }

  const id = String(body?.id ?? "").trim();
  if (!id) {
    return Response.json(
      {
        status: "error",
        errors: {},
        message: "Missing message id.",
      },
      { status: 400 }
    );
  }

  let result;
  try {
    result = await updateSubmission({ ...body, id });
  } catch {
    return Response.json(
      {
        status: "error",
        errors: {},
        message:
          "Something went wrong while updating the message. Please try again.",
      },
      { status: 500 }
    );
  }

  if (result.notFound) {
    return Response.json(
      {
        status: "error",
        errors: {},
        message: "Message not found.",
      },
      { status: 404 }
    );
  }

  if (!result.saved) {
    return Response.json(
      {
        status: "error",
        errors: result.errors,
        message:
          result.message ?? "Please fix the highlighted fields and try again.",
      },
      { status: 400 }
    );
  }

  return Response.json({
    status: "success",
    errors: {},
    message: "Message updated.",
    submission: result.submission,
  });
}

export async function DELETE(request) {
  if (!(await isAuthed())) {
    return unauthorizedResponse();
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        status: "error",
        message: "Invalid request body.",
      },
      { status: 400 }
    );
  }

  const id = String(body?.id ?? "").trim();
  if (!id) {
    return Response.json(
      {
        status: "error",
        message: "Missing message id.",
      },
      { status: 400 }
    );
  }

  let result;
  try {
    result = await deleteSubmission(id);
  } catch {
    return Response.json(
      {
        status: "error",
        message:
          "Something went wrong while deleting the message. Please try again.",
      },
      { status: 500 }
    );
  }

  if (result.notFound) {
    return Response.json(
      {
        status: "error",
        message: "Message not found.",
      },
      { status: 404 }
    );
  }

  return Response.json({
    status: "success",
    message: "Message deleted.",
  });
}
