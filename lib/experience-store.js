import path from "path";
import { cacheTag, revalidateTag } from "next/cache";
import {
  enqueueWrite,
  readJsonArray,
  writeJsonArrayAtomic,
} from "@/lib/json-store";

export function getExperienceFilePath() {
  return path.join(process.cwd(), "data", "experience.json");
}

export async function readExperiences(filePath) {
  return readJsonArray(filePath, "experience.json");
}

export async function getExperiences() {
  "use cache";
  cacheTag("experience");
  try {
    return await readExperiences(getExperienceFilePath());
  } catch {
    return [];
  }
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

export function validateExperience(input) {
  const company = String(input.company ?? "").trim();
  const role = String(input.role ?? "").trim();
  const short = String(input.short ?? "").trim();
  const location = String(input.location ?? "").trim();
  const period = String(input.period ?? "").trim();
  const achievements = toLineArray(input.achievements);
  const metrics = toLineArray(input.metrics);

  const errors = {};
  if (!company) {
    errors.company = "Please enter the company name.";
  }
  if (!role) {
    errors.role = "Please enter the role.";
  }

  return {
    company,
    role,
    short,
    location,
    period,
    achievements,
    metrics,
    errors,
  };
}

export async function createExperience(input) {
  const { errors, ...values } = validateExperience(input);
  if (Object.keys(errors).length > 0) {
    return { saved: false, errors };
  }

  const experience = await enqueueWrite(async () => {
    const filePath = getExperienceFilePath();
    const experiences = await readExperiences(filePath);
    const now = new Date().toISOString();
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...values,
      createdAt: now,
      updatedAt: now,
    };
    experiences.unshift(entry);
    await writeJsonArrayAtomic(filePath, experiences);
    return entry;
  });
  revalidateTag("experience", { stale: 0, revalidate: 0, expire: 0 });

  return { saved: true, experience };
}

export async function updateExperience(input) {
  const { errors, ...values } = validateExperience(input);
  if (Object.keys(errors).length > 0) {
    return { saved: false, errors };
  }
  const id = String(input.id ?? "").trim();
  if (!id) {
    return { saved: false, errors: {}, message: "Missing experience id." };
  }

  const experience = await enqueueWrite(async () => {
    const filePath = getExperienceFilePath();
    const experiences = await readExperiences(filePath);
    const index = experiences.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }
    const entry = {
      ...experiences[index],
      ...values,
      id,
      updatedAt: new Date().toISOString(),
    };
    experiences[index] = entry;
    await writeJsonArrayAtomic(filePath, experiences);
    return entry;
  });

  if (!experience) {
    return { saved: false, notFound: true };
  }
  revalidateTag("experience", { stale: 0, revalidate: 0, expire: 0 });
  return { saved: true, experience };
}

export async function deleteExperience(id) {
  const experience = await enqueueWrite(async () => {
    const filePath = getExperienceFilePath();
    const experiences = await readExperiences(filePath);
    const index = experiences.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }
    const [removed] = experiences.splice(index, 1);
    await writeJsonArrayAtomic(filePath, experiences);
    return removed;
  });

  if (!experience) {
    return { deleted: false, notFound: true };
  }
  revalidateTag("experience", { stale: 0, revalidate: 0, expire: 0 });
  return { deleted: true, experience };
}
