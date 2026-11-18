import path from "path";
import { cacheTag, revalidateTag } from "next/cache";
import {
  enqueueWrite,
  readJsonArray,
  writeJsonArrayAtomic,
} from "@/lib/json-store";

export function getPostsFilePath() {
  return path.join(process.cwd(), "data", "posts.json");
}

export function slugify(title) {
  const slug = String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "post";
}

export async function readPosts(filePath) {
  return readJsonArray(filePath, "posts.json");
}

export async function getPostBySlug(slug) {
  "use cache";
  cacheTag("blogs");
  try {
    const posts = await readPosts(getPostsFilePath());
    return posts.find((p) => p.slug === slug) ?? null;
  } catch {
    return null;
  }
}

export async function getAllPostSlugs() {
  "use cache";
  cacheTag("blogs");
  try {
    const posts = await readPosts(getPostsFilePath());
    return posts.map((p) => p.slug);
  } catch {
    return [];
  }
}

export async function createPost(input) {
  const title = String(input.title ?? "").trim();
  const content = String(input.content ?? "").trim();

  const errors = {};
  if (!title) {
    errors.title = "Please enter a title.";
  }
  if (!content) {
    errors.content = "Please enter some content.";
  }
  if (Object.keys(errors).length > 0) {
    return { saved: false, errors };
  }

  const post = await enqueueWrite(async () => {
    const filePath = getPostsFilePath();
    const posts = await readPosts(filePath);
    const taken = new Set(posts.map((p) => p.slug));
    const base = slugify(title);
    let slug = base;
    let counter = 2;
    while (taken.has(slug)) {
      slug = `${base}-${counter}`;
      counter += 1;
    }
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      slug,
      title,
      content,
      createdAt: new Date().toISOString(),
    };
    posts.push(entry);
    await writeJsonArrayAtomic(filePath, posts);
    return entry;
  });
  revalidateTag("blogs", { stale: 0, revalidate: 0, expire: 0 });

  return { saved: true, post };
}

export async function updatePost(input) {
  const id = String(input.id ?? "").trim();
  if (!id) {
    return { saved: false, errors: {}, message: "Missing post id." };
  }
  const title = String(input.title ?? "").trim();
  const content = String(input.content ?? "").trim();

  const errors = {};
  if (!title) {
    errors.title = "Please enter a title.";
  }
  if (!content) {
    errors.content = "Please enter some content.";
  }
  if (Object.keys(errors).length > 0) {
    return { saved: false, errors };
  }

  const post = await enqueueWrite(async () => {
    const filePath = getPostsFilePath();
    const posts = await readPosts(filePath);
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) {
      return null;
    }
    const taken = new Set(
      posts.filter((p) => p.id !== id).map((p) => p.slug)
    );
    const base = slugify(title);
    let slug = base;
    let counter = 2;
    while (taken.has(slug)) {
      slug = `${base}-${counter}`;
      counter += 1;
    }
    const entry = {
      ...posts[index],
      slug,
      title,
      content,
      updatedAt: new Date().toISOString(),
    };
    posts[index] = entry;
    await writeJsonArrayAtomic(filePath, posts);
    return entry;
  });

  if (!post) {
    return { saved: false, notFound: true };
  }
  revalidateTag("blogs", { stale: 0, revalidate: 0, expire: 0 });
  return { saved: true, post };
}

export async function deletePost(id) {
  const post = await enqueueWrite(async () => {
    const filePath = getPostsFilePath();
    const posts = await readPosts(filePath);
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) {
      return null;
    }
    const [removed] = posts.splice(index, 1);
    await writeJsonArrayAtomic(filePath, posts);
    return removed;
  });

  if (!post) {
    return { deleted: false, notFound: true };
  }
  revalidateTag("blogs", { stale: 0, revalidate: 0, expire: 0 });
  return { deleted: true, post };
}
