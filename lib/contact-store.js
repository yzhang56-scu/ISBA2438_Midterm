import path from "path";
import {
  enqueueWrite,
  readJsonArray,
  writeJsonArrayAtomic,
} from "./json-store.js";

export const EMAIL_PATTERN = /^[^\s@]+@([^\s@.]+\.)+[^\s@.]+$/;

export function getSubmissionsFilePath() {
  return path.join(process.cwd(), "data", "submissions.json");
}

export function validateContact(input) {
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim();
  const message = String(input.message ?? "").trim();

  const errors = {};
  if (!name) {
    errors.name = "Please enter your name.";
  }
  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!message) {
    errors.message = "Please enter a message.";
  }

  return { name, email, message, errors };
}

export async function readSubmissions(filePath) {
  return readJsonArray(filePath, "submissions.json");
}

export const MESSAGE_STATUSES = ["New", "Replied"];

export function normalizeMessageStatus(value) {
  const needle = String(value ?? "").trim().toLowerCase();
  return (
    MESSAGE_STATUSES.find((status) => status.toLowerCase() === needle) ??
    "New"
  );
}

export function normalizeSubmission(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }
  return {
    ...entry,
    status: normalizeMessageStatus(entry.status),
  };
}

export async function appendSubmission(entry) {
  const filePath = getSubmissionsFilePath();
  await enqueueWrite(async () => {
    const submissions = await readJsonArray(filePath, "submissions.json");
    submissions.push({
      status: "New",
      ...entry,
    });
    await writeJsonArrayAtomic(filePath, submissions);
  });
}

export async function updateSubmission(input) {
  const id = String(input.id ?? "").trim();
  if (!id) {
    return { saved: false, errors: {}, message: "Missing message id." };
  }
  const { name, email, message, errors } = validateContact(input);
  if (Object.keys(errors).length > 0) {
    return { saved: false, errors };
  }
  const status = normalizeMessageStatus(input.status);

  const submission = await enqueueWrite(async () => {
    const filePath = getSubmissionsFilePath();
    const submissions = await readSubmissions(filePath);
    const index = submissions.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }
    const entry = {
      ...submissions[index],
      name,
      email,
      message,
      status,
      id,
    };
    submissions[index] = entry;
    await writeJsonArrayAtomic(filePath, submissions);
    return entry;
  });

  if (!submission) {
    return { saved: false, notFound: true };
  }
  return { saved: true, submission };
}

export async function deleteSubmission(id) {
  const submission = await enqueueWrite(async () => {
    const filePath = getSubmissionsFilePath();
    const submissions = await readSubmissions(filePath);
    const index = submissions.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }
    const [removed] = submissions.splice(index, 1);
    await writeJsonArrayAtomic(filePath, submissions);
    return removed;
  });

  if (!submission) {
    return { deleted: false, notFound: true };
  }
  return { deleted: true, submission };
}
