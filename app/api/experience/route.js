import {
  createExperience,
  deleteExperience,
  getExperienceFilePath,
  readExperiences,
  updateExperience,
} from "@/lib/experience-store";
import { isAuthed, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  if (!(await isAuthed())) {
    return unauthorizedResponse();
  }
  try {
    const experiences = await readExperiences(getExperienceFilePath());
    return Response.json({ status: "success", experiences });
  } catch {
    return Response.json(
      {
        status: "error",
        message: "Something went wrong while loading experiences.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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

  let result;
  try {
    result = await createExperience(body ?? {});
  } catch {
    return Response.json(
      {
        status: "error",
        errors: {},
        message:
          "Something went wrong while saving the experience. Please try again.",
      },
      { status: 500 }
    );
  }

  if (!result.saved) {
    return Response.json(
      {
        status: "error",
        errors: result.errors,
        message: "Please fix the highlighted fields and try again.",
      },
      { status: 400 }
    );
  }

  return Response.json(
    {
      status: "success",
      errors: {},
      message: "Experience added.",
      experience: result.experience,
    },
    { status: 201 }
  );
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
        message: "Missing experience id.",
      },
      { status: 400 }
    );
  }

  let result;
  try {
    result = await updateExperience({ ...body, id });
  } catch {
    return Response.json(
      {
        status: "error",
        errors: {},
        message:
          "Something went wrong while updating the experience. Please try again.",
      },
      { status: 500 }
    );
  }

  if (result.notFound) {
    return Response.json(
      {
        status: "error",
        errors: {},
        message: "Experience not found.",
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
    message: "Experience updated.",
    experience: result.experience,
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
        message: "Missing experience id.",
      },
      { status: 400 }
    );
  }

  let result;
  try {
    result = await deleteExperience(id);
  } catch {
    return Response.json(
      {
        status: "error",
        message:
          "Something went wrong while deleting the experience. Please try again.",
      },
      { status: 500 }
    );
  }

  if (result.notFound) {
    return Response.json(
      {
        status: "error",
        message: "Experience not found.",
      },
      { status: 404 }
    );
  }

  return Response.json({
    status: "success",
    message: "Experience deleted.",
  });
}
