import {
  createProject,
  deleteProject,
  getProjectsFilePath,
  readProjects,
  updateProject,
} from "@/lib/project-store";
import { isAuthed, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  if (!(await isAuthed())) {
    return unauthorizedResponse();
  }
  try {
    const projects = await readProjects(getProjectsFilePath());
    return Response.json({ status: "success", projects });
  } catch {
    return Response.json(
      {
        status: "error",
        message: "Something went wrong while loading projects.",
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
    result = await createProject(body ?? {});
  } catch {
    return Response.json(
      {
        status: "error",
        errors: {},
        message:
          "Something went wrong while saving the project. Please try again.",
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
      message: "Project added.",
      project: result.project,
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
        message: "Missing project id.",
      },
      { status: 400 }
    );
  }

  let result;
  try {
    result = await updateProject({ ...body, id });
  } catch {
    return Response.json(
      {
        status: "error",
        errors: {},
        message:
          "Something went wrong while updating the project. Please try again.",
      },
      { status: 500 }
    );
  }

  if (result.notFound) {
    return Response.json(
      {
        status: "error",
        errors: {},
        message: "Project not found.",
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
    message: "Project updated.",
    project: result.project,
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
        message: "Missing project id.",
      },
      { status: 400 }
    );
  }

  let result;
  try {
    result = await deleteProject(id);
  } catch {
    return Response.json(
      {
        status: "error",
        message:
          "Something went wrong while deleting the project. Please try again.",
      },
      { status: 500 }
    );
  }

  if (result.notFound) {
    return Response.json(
      {
        status: "error",
        message: "Project not found.",
      },
      { status: 404 }
    );
  }

  return Response.json({
    status: "success",
    message: "Project deleted.",
  });
}
