import path from "path";
import { cacheTag, revalidateTag } from "next/cache";
import {
  enqueueWrite,
  readJsonArray,
  writeJsonArrayAtomic,
} from "@/lib/json-store";

export const PROJECT_SECTIONS = [
  { value: 1, label: "Market & Customer Intelligence" },
  { value: 2, label: "Go-to-Market & Growth Strategy" },
  { value: 3, label: "Sales & Business Operations" },
];

export const PROJECT_TYPES = ["case-study", "overview"];

export function getProjectsFilePath() {
  return path.join(process.cwd(), "data", "projects.json");
}

export async function readProjects(filePath) {
  return readJsonArray(filePath, "projects.json");
}

export async function getProjects() {
  "use cache";
  cacheTag("projects");
  try {
    return await readProjects(getProjectsFilePath());
  } catch {
    return [];
  }
}

export async function getProjectBySlug(slug) {
  "use cache";
  cacheTag("projects");
  try {
    const projects = await readProjects(getProjectsFilePath());
    return (
      projects.find((p) => p.type === "case-study" && p.slug === slug) ?? null
    );
  } catch {
    return null;
  }
}

export async function getAllProjectSlugs() {
  "use cache";
  cacheTag("projects");
  try {
    const projects = await readProjects(getProjectsFilePath());
    return projects
      .filter((p) => p.type === "case-study" && p.slug)
      .map((p) => p.slug);
  } catch {
    return [];
  }
}

function slugify(title) {
  const slug = String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "project";
}

function toLineArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeDetails(value) {
  if (value === undefined || value === null || value === "") {
    return { details: [] };
  }
  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return {
        error: "Details must be valid JSON (an array of detail blocks).",
      };
    }
  }
  if (!Array.isArray(parsed)) {
    return { error: "Details must be a JSON array of detail blocks." };
  }
  const details = [];
  for (const detail of parsed) {
    if (!detail || typeof detail !== "object") {
      return { error: "Each details block must be a JSON object." };
    }
    const heading = String(detail.heading ?? "").trim();
    if (!heading) {
      return { error: "Each details block needs a heading." };
    }
    details.push({
      heading,
      body: String(detail.body ?? "").trim(),
      metrics: Array.isArray(detail.metrics)
        ? detail.metrics.map((item) => String(item).trim()).filter(Boolean)
        : [],
      points: Array.isArray(detail.points)
        ? detail.points.map((item) => String(item).trim()).filter(Boolean)
        : [],
    });
  }
  return { details };
}

export function validateProject(input) {
  const title = String(input.title ?? "").trim();
  const description = String(input.description ?? "").trim();
  const github = String(input.github ?? "").trim();
  const section = Number(input.section);
  const type = String(input.type ?? "").trim();
  const tags = toLineArray(input.tags);

  const errors = {};
  if (!title) {
    errors.title = "Please enter the project title.";
  }
  if (!description) {
    errors.description = "Please enter a short description.";
  }
  if (![1, 2, 3].includes(section)) {
    errors.section = "Please choose a category.";
  }
  if (!PROJECT_TYPES.includes(type)) {
    errors.type = "Please choose a project type.";
  }

  let detailsError;
  let details;
  if (type === "case-study") {
    const result = normalizeDetails(input.details);
    if (result.error) {
      detailsError = result.error;
      errors.details = result.error;
    } else {
      details = result.details;
    }
  }

  return {
    errors,
    detailsError,
    values: { title, description, github, section, type, tags, details },
  };
}

export async function createProject(input) {
  const { errors, detailsError, values } = validateProject(input);
  if (Object.keys(errors).length > 0) {
    return { saved: false, errors };
  }

  const project = await enqueueWrite(async () => {
    const filePath = getProjectsFilePath();
    const projects = await readProjects(filePath);
    const now = new Date().toISOString();
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      section: values.section,
      type: values.type,
      title: values.title,
      description: values.description,
      tags: values.tags,
      createdAt: now,
      updatedAt: now,
    };
    if (values.github) {
      entry.github = values.github;
    }
    if (values.type === "case-study") {
      const taken = new Set(projects.map((p) => p.slug));
      const base = slugify(values.title);
      let slug = base;
      let counter = 2;
      while (taken.has(slug)) {
        slug = `${base}-${counter}`;
        counter += 1;
      }
      entry.slug = slug;
      entry.details = values.details;
    }
    projects.unshift(entry);
    await writeJsonArrayAtomic(filePath, projects);
    return entry;
  });
  revalidateTag("projects", { stale: 0, revalidate: 0, expire: 0 });

  return { saved: true, project };
}

export async function updateProject(input) {
  const id = String(input.id ?? "").trim();
  if (!id) {
    return { saved: false, errors: {}, message: "Missing project id." };
  }
  const { errors, detailsError, values } = validateProject(input);
  if (Object.keys(errors).length > 0) {
    return { saved: false, errors };
  }

  const project = await enqueueWrite(async () => {
    const filePath = getProjectsFilePath();
    const projects = await readProjects(filePath);
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) {
      return null;
    }
    const entry = {
      id,
      section: values.section,
      type: values.type,
      title: values.title,
      description: values.description,
      tags: values.tags,
      createdAt: projects[index].createdAt,
      updatedAt: new Date().toISOString(),
    };
    if (values.github) {
      entry.github = values.github;
    }
    if (values.type === "case-study") {
      const taken = new Set(
        projects.filter((p) => p.id !== id).map((p) => p.slug)
      );
      const base = slugify(values.title);
      let slug = base;
      let counter = 2;
      while (taken.has(slug)) {
        slug = `${base}-${counter}`;
        counter += 1;
      }
      entry.slug = slug;
      entry.details = values.details;
    }
    projects[index] = entry;
    await writeJsonArrayAtomic(filePath, projects);
    return entry;
  });

  if (!project) {
    return { saved: false, notFound: true };
  }
  revalidateTag("projects", { stale: 0, revalidate: 0, expire: 0 });
  return { saved: true, project };
}

export async function deleteProject(id) {
  const project = await enqueueWrite(async () => {
    const filePath = getProjectsFilePath();
    const projects = await readProjects(filePath);
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) {
      return null;
    }
    const [removed] = projects.splice(index, 1);
    await writeJsonArrayAtomic(filePath, projects);
    return removed;
  });

  if (!project) {
    return { deleted: false, notFound: true };
  }
  revalidateTag("projects", { stale: 0, revalidate: 0, expire: 0 });
  return { deleted: true, project };
}
