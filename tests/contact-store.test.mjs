import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  MESSAGE_STATUSES,
  appendSubmission,
  deleteSubmission,
  normalizeMessageStatus,
  normalizeSubmission,
  updateSubmission,
} from "../lib/contact-store.js";

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "contact-store-test-"));
fs.mkdirSync(path.join(tmpRoot, "data"), { recursive: true });
const dataFile = path.join(tmpRoot, "data", "submissions.json");
fs.writeFileSync(
  dataFile,
  JSON.stringify(
    [
      {
        id: "seed-1",
        name: "Julie",
        email: "julie@example.com",
        message: "testing API contact",
        submittedAt: "2026-11-11T22:34:42.117Z",
      },
    ],
    null,
    2
  )
);

const originalCwd = process.cwd();
process.chdir(tmpRoot);

async function readStore() {
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

async function atest(name, fn) {
  await fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

test("MESSAGE_STATUSES contains New and Replied", () => {
  assert.deepEqual(MESSAGE_STATUSES, ["New", "Replied"]);
});

test("normalizeMessageStatus is case-insensitive and defaults to New", () => {
  assert.equal(normalizeMessageStatus("replied"), "Replied");
  assert.equal(normalizeMessageStatus(" NEW "), "New");
  assert.equal(normalizeMessageStatus("Bogus"), "New");
  assert.equal(normalizeMessageStatus(""), "New");
  assert.equal(normalizeMessageStatus(null), "New");
});

test("normalizeSubmission adds status to legacy entries", () => {
  const normalized = normalizeSubmission({
    id: "legacy",
    name: "Julie",
    email: "julie@example.com",
    message: "hi",
  });
  assert.equal(normalized.status, "New");
  assert.equal(normalizeSubmission(null), null);
});

await atest("CREATE: appendSubmission stores message with status New", async () => {
  await appendSubmission({
    id: "m2",
    name: "Sam",
    email: "sam@example.com",
    message: "hello from the form",
    submittedAt: "2026-11-18T10:00:00.000Z",
  });
  const store = await readStore();
  assert.equal(store.length, 2);
  assert.equal(store[1].status, "New");
  assert.equal(store[1].name, "Sam");
});

await atest("UPDATE: updateSubmission edits fields and status", async () => {
  const result = await updateSubmission({
    id: "m2",
    name: "Sam",
    email: "sam@example.com",
    message: "edited",
    status: "replied",
  });
  assert.equal(result.saved, true);
  assert.equal(result.submission.status, "Replied");
  const store = await readStore();
  const updated = store.find((item) => item.id === "m2");
  assert.equal(updated.status, "Replied");
  assert.equal(updated.message, "edited");
  assert.equal(updated.submittedAt, "2026-11-18T10:00:00.000Z");
});

await atest("UPDATE: invalid email is rejected without saving", async () => {
  const result = await updateSubmission({
    id: "m2",
    name: "Sam",
    email: "not-an-email",
    message: "x",
    status: "New",
  });
  assert.equal(result.saved, false);
  assert.equal(result.errors.email, "Please enter a valid email address.");
});

await atest("UPDATE: unknown id reports notFound", async () => {
  const result = await updateSubmission({
    id: "ghost",
    name: "X",
    email: "x@example.com",
    message: "y",
    status: "New",
  });
  assert.equal(result.saved, false);
  assert.equal(result.notFound, true);
});

await atest("UPDATE: missing id reports an error", async () => {
  const result = await updateSubmission({
    name: "X",
    email: "x@example.com",
    message: "y",
  });
  assert.equal(result.saved, false);
  assert.equal(result.message, "Missing message id.");
});

await atest("DELETE: deleteSubmission removes the entry", async () => {
  const result = await deleteSubmission("m2");
  assert.equal(result.deleted, true);
  const store = await readStore();
  assert.equal(store.length, 1);
  assert.equal(store[0].id, "seed-1");
});

await atest("DELETE: unknown id reports notFound", async () => {
  const result = await deleteSubmission("ghost");
  assert.equal(result.deleted, false);
  assert.equal(result.notFound, true);
});

process.chdir(originalCwd);
fs.rmSync(tmpRoot, { recursive: true, force: true });

console.log(`\n${passed} tests passed`);
