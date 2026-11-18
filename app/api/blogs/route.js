import {
  createPost,
  deletePost,
  getPostsFilePath,
  readPosts,
  updatePost,
} from "@/lib/blog-store";
import { isAuthed, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  try {
    const posts = await readPosts(getPostsFilePath());
    return Response.json({ status: "success", posts });
  } catch {
    return Response.json(
      { status: "error", message: "Something went wrong while loading posts." },
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
    result = await createPost(body ?? {});
  } catch {
    return Response.json(
      {
        status: "error",
        errors: {},
        message:
          "Something went wrong while saving your post. Please try again.",
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

  return Response.json({
    status: "success",
    errors: {},
    message: "Blog post published.",
    post: result.post,
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
        message: "Missing post id.",
      },
      { status: 400 }
    );
  }

  let result;
  try {
    result = await updatePost({ ...body, id });
  } catch {
    return Response.json(
      {
        status: "error",
        errors: {},
        message:
          "Something went wrong while updating your post. Please try again.",
      },
      { status: 500 }
    );
  }

  if (result.notFound) {
    return Response.json(
      {
        status: "error",
        errors: {},
        message: "Post not found.",
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
    message: "Post updated.",
    post: result.post,
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
        message: "Missing post id.",
      },
      { status: 400 }
    );
  }

  let result;
  try {
    result = await deletePost(id);
  } catch {
    return Response.json(
      {
        status: "error",
        message:
          "Something went wrong while deleting your post. Please try again.",
      },
      { status: 500 }
    );
  }

  if (result.notFound) {
    return Response.json(
      {
        status: "error",
        message: "Post not found.",
      },
      { status: 404 }
    );
  }

  return Response.json({
    status: "success",
    message: "Post deleted.",
  });
}
