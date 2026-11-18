import fs from "fs/promises";

let writeQueue = Promise.resolve();

export function enqueueWrite(task) {
  const run = writeQueue.then(task);
  writeQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export async function readJsonArray(filePath, label) {
  let raw;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
  const cleaned = raw.replace(/^\uFEFF/, "").trim();
  if (!cleaned) {
    return [];
  }
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) {
    throw new Error(`${label} must contain an array`);
  }
  return parsed;
}

export async function writeJsonArrayAtomic(filePath, entries) {
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(entries, null, 2), "utf8");
  await fs.rename(tempPath, filePath);
}
