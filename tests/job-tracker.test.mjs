import assert from "node:assert/strict";
import {
  JOB_STORAGE_KEY,
  compareApplications,
  formatDate,
  isValidDate,
  loadApplications,
  makeId,
  normalizeStatus,
  sanitizeApplication,
  sanitizeApplications,
  saveApplications,
  statusClass,
} from "../lib/job-tracker.js";

function createMockStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    dump: () => (map.has(JOB_STORAGE_KEY) ? map.get(JOB_STORAGE_KEY) : null),
  };
}

function createFailingStorage() {
  return {
    getItem: () => null,
    setItem: () => {
      throw new Error("QuotaExceededError");
    },
  };
}

function loadFrom(storage) {
  return loadApplications(storage);
}

function addApplication(storage, entry) {
  const applications = loadFrom(storage);
  applications.unshift(entry);
  assert.equal(saveApplications(storage, applications), true);
}

function editApplication(storage, id, patch) {
  const applications = loadFrom(storage);
  const updated = applications.map((application) =>
    application.id === id ? { ...application, ...patch } : application
  );
  assert.equal(saveApplications(storage, updated), true);
}

function deleteApplication(storage, id) {
  const applications = loadFrom(storage);
  assert.equal(saveApplications(storage, applications.filter((a) => a.id !== id)), true);
}

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

test("isValidDate accepts real YYYY-MM-DD dates", () => {
  assert.equal(isValidDate("2026-11-17"), true);
  assert.equal(isValidDate("2024-02-29"), true);
});

test("isValidDate rejects empty, malformed, and impossible dates", () => {
  assert.equal(isValidDate(""), false);
  assert.equal(isValidDate("11/17/2026"), false);
  assert.equal(isValidDate("2026-2-3"), false);
  assert.equal(isValidDate("2026-02-31"), false);
  assert.equal(isValidDate("2026-13-01"), false);
  assert.equal(isValidDate(null), false);
  assert.equal(isValidDate(undefined), false);
  assert.equal(isValidDate(20261117), false);
});

test("formatDate renders valid dates and guards invalid ones", () => {
  assert.equal(formatDate("2026-11-17"), "November 17, 2026");
  assert.equal(formatDate(""), "");
  assert.equal(formatDate("not-a-date"), "");
  assert.equal(formatDate("2026-02-31"), "");
});

test("statusClass maps all five statuses and falls back safely", () => {
  assert.equal(statusClass("Wishlist"), "flag flag-overview");
  assert.equal(statusClass("Applied"), "flag status-applied");
  assert.equal(statusClass("Interview"), "flag status-interview");
  assert.equal(statusClass("Offer"), "flag status-offer");
  assert.equal(statusClass("Rejected"), "flag status-rejected");
  assert.equal(statusClass("Bogus"), "flag flag-overview");
  assert.equal(statusClass(undefined), "flag flag-overview");
});

test("normalizeStatus is case-insensitive and defaults to Wishlist", () => {
  assert.equal(normalizeStatus("applied"), "Applied");
  assert.equal(normalizeStatus(" OFFER "), "Offer");
  assert.equal(normalizeStatus("Bogus"), "Wishlist");
  assert.equal(normalizeStatus(""), "Wishlist");
  assert.equal(normalizeStatus(null), "Wishlist");
});

test("makeId returns non-empty unique strings", () => {
  const a = makeId();
  const b = makeId();
  assert.ok(a.length > 0);
  assert.notEqual(a, b);
});

test("sanitizeApplication trims fields and normalizes status/date", () => {
  const cleaned = sanitizeApplication({
    company: " Acme ",
    position: " Analyst ",
    status: "interview",
    dateApplied: "2026-11-01",
    notes: "  follow up  ",
  });
  assert.deepEqual(cleaned, {
    id: cleaned.id,
    company: "Acme",
    position: "Analyst",
    status: "Interview",
    dateApplied: "2026-11-01",
    notes: "follow up",
    createdAt: "",
    updatedAt: "",
  });
  assert.ok(cleaned.id.length > 0);
});

test("sanitizeApplication rejects junk entries", () => {
  assert.equal(sanitizeApplication(null), null);
  assert.equal(sanitizeApplication(undefined), null);
  assert.equal(sanitizeApplication("string"), null);
  assert.equal(sanitizeApplication(42), null);
  assert.equal(sanitizeApplication(["array"]), null);
  assert.equal(sanitizeApplication({}), null);
  assert.equal(sanitizeApplication({ company: "Acme" }), null);
  assert.equal(sanitizeApplication({ position: "Analyst" }), null);
});

test("sanitizeApplication repairs bad ids, statuses, and dates", () => {
  const repaired = sanitizeApplication({
    id: "",
    company: "Acme",
    position: "Analyst",
    status: "Bogus",
    dateApplied: "2026-02-31",
    notes: 123,
  });
  assert.ok(repaired.id.length > 0);
  assert.equal(repaired.status, "Wishlist");
  assert.equal(repaired.dateApplied, "");
  assert.equal(repaired.notes, "123");
  const numericId = sanitizeApplication({
    id: 123,
    company: "Acme",
    position: "Analyst",
  });
  assert.equal(numericId.id, "123");
});

test("sanitizeApplications keeps valid entries, drops junk, dedupes ids", () => {
  const result = sanitizeApplications([
    { id: "a", company: "Acme", position: "Analyst" },
    null,
    "junk",
    { company: "NoPosition" },
    { id: "a", company: "Duplicate", position: "Ghost" },
    { id: "b", company: "Beta", position: "Engineer", status: "offer" },
  ]);
  assert.equal(result.length, 2);
  assert.equal(result[0].company, "Acme");
  assert.equal(result[1].company, "Beta");
  assert.equal(result[1].status, "Offer");
});

test("sanitizeApplications returns empty for non-arrays", () => {
  assert.deepEqual(sanitizeApplications(undefined), []);
  assert.deepEqual(sanitizeApplications(null), []);
  assert.deepEqual(sanitizeApplications("[]"), []);
  assert.deepEqual(sanitizeApplications({ length: 0 }), []);
});

test("loadApplications returns empty for empty storage", () => {
  const storage = createMockStorage();
  assert.deepEqual(loadFrom(storage), []);
});

test("loadApplications survives invalid JSON", () => {
  const storage = createMockStorage({ [JOB_STORAGE_KEY]: "{not valid json" });
  assert.deepEqual(loadFrom(storage), []);
});

test("loadApplications survives non-array JSON values", () => {
  for (const raw of ["null", "42", '"text"', "true", '{"company":"Acme"}']) {
    const storage = createMockStorage({ [JOB_STORAGE_KEY]: raw });
    assert.deepEqual(loadFrom(storage), []);
  }
});

test("loadApplications cleans a corrupted array instead of crashing", () => {
  const storage = createMockStorage({
    [JOB_STORAGE_KEY]: JSON.stringify([
      { id: "ok", company: "Acme", position: "Analyst", status: "offer" },
      null,
      "junk",
      { company: "Incomplete" },
      { id: "ok", company: "Dupe", position: "Ghost" },
      { id: "fixed", company: " Beta ", position: "Dev", status: "INTERVIEW" },
    ]),
  });
  const loaded = loadFrom(storage);
  assert.equal(loaded.length, 2);
  assert.equal(loaded[0].company, "Acme");
  assert.equal(loaded[0].status, "Offer");
  assert.equal(loaded[1].company, "Beta");
  assert.equal(loaded[1].status, "Interview");
});

test("adding an application writes it to LocalStorage", () => {
  const storage = createMockStorage();
  addApplication(storage, {
    id: "a1",
    company: "Acme",
    position: "Analyst",
    status: "Applied",
    dateApplied: "2026-11-17",
    notes: "referred by Sam",
    createdAt: "2026-11-17T10:00:00.000Z",
    updatedAt: "2026-11-17T10:00:00.000Z",
  });
  const saved = JSON.parse(storage.dump());
  assert.equal(saved.length, 1);
  assert.equal(saved[0].company, "Acme");
  assert.equal(saved[0].status, "Applied");
});

test("editing an application updates LocalStorage", () => {
  const storage = createMockStorage();
  addApplication(storage, {
    id: "a1",
    company: "Acme",
    position: "Analyst",
    status: "Applied",
    dateApplied: "2026-11-01",
    notes: "",
    createdAt: "2026-11-01T10:00:00.000Z",
    updatedAt: "2026-11-01T10:00:00.000Z",
  });
  editApplication(storage, "a1", {
    status: "Interview",
    notes: "phone screen Friday",
    updatedAt: "2026-11-17T10:00:00.000Z",
  });
  const reloaded = loadFrom(storage);
  assert.equal(reloaded.length, 1);
  assert.equal(reloaded[0].status, "Interview");
  assert.equal(reloaded[0].notes, "phone screen Friday");
  assert.equal(reloaded[0].company, "Acme");
});

test("deleting an application removes it from LocalStorage", () => {
  const storage = createMockStorage();
  addApplication(storage, {
    id: "a1",
    company: "Acme",
    position: "Analyst",
    status: "Wishlist",
    dateApplied: "",
    notes: "",
    createdAt: "2026-11-01T10:00:00.000Z",
    updatedAt: "2026-11-01T10:00:00.000Z",
  });
  addApplication(storage, {
    id: "a2",
    company: "Beta",
    position: "Engineer",
    status: "Applied",
    dateApplied: "2026-11-05",
    notes: "",
    createdAt: "2026-11-05T10:00:00.000Z",
    updatedAt: "2026-11-05T10:00:00.000Z",
  });
  deleteApplication(storage, "a1");
  const reloaded = loadFrom(storage);
  assert.equal(reloaded.length, 1);
  assert.equal(reloaded[0].id, "a2");
});

test("saved data loads again after a simulated page refresh", () => {
  const storage = createMockStorage();
  addApplication(storage, {
    id: "a1",
    company: "Acme",
    position: "Analyst",
    status: "Applied",
    dateApplied: "2026-11-01",
    notes: "first",
    createdAt: "2026-11-01T10:00:00.000Z",
    updatedAt: "2026-11-01T10:00:00.000Z",
  });
  editApplication(storage, "a1", { status: "Offer" });
  addApplication(storage, {
    id: "a2",
    company: "Beta",
    position: "Engineer",
    status: "Wishlist",
    dateApplied: "",
    notes: "second",
    createdAt: "2026-11-10T10:00:00.000Z",
    updatedAt: "2026-11-10T10:00:00.000Z",
  });
  deleteApplication(storage, "a2");
  const freshSession = loadFrom(storage);
  assert.equal(freshSession.length, 1);
  assert.equal(freshSession[0].company, "Acme");
  assert.equal(freshSession[0].status, "Offer");
  assert.equal(freshSession[0].notes, "first");
});

test("loadApplications and saveApplications round-trip all fields", () => {
  const storage = createMockStorage();
  const entry = {
    id: "rt1",
    company: " Gamma Corp ",
    position: " Data Analyst ",
    status: "Rejected",
    dateApplied: "2026-10-31",
    notes: "  heard back in a week  ",
    createdAt: "2026-10-31T09:00:00.000Z",
    updatedAt: "2026-11-02T09:00:00.000Z",
  };
  addApplication(storage, entry);
  const [loaded] = loadFrom(storage);
  assert.deepEqual(loaded, {
    id: "rt1",
    company: "Gamma Corp",
    position: "Data Analyst",
    status: "Rejected",
    dateApplied: "2026-10-31",
    notes: "heard back in a week",
    createdAt: "2026-10-31T09:00:00.000Z",
    updatedAt: "2026-11-02T09:00:00.000Z",
  });
});

test("saveApplications reports failure without crashing on quota errors", () => {
  assert.equal(saveApplications(createFailingStorage(), []), false);
  assert.deepEqual(loadApplications(createFailingStorage()), []);
});

test("compareApplications sorts newest first and pushes empty dates last", () => {
  const apps = [
    { id: "x", dateApplied: "", createdAt: "2026-11-15T00:00:00.000Z" },
    { id: "y", dateApplied: "2026-11-01", createdAt: "2026-11-01T00:00:00.000Z" },
    { id: "z", dateApplied: "2026-11-10", createdAt: "2026-11-10T00:00:00.000Z" },
    { id: "w", dateApplied: "2026-11-01", createdAt: "2026-11-09T00:00:00.000Z" },
  ];
  const sorted = [...apps].sort(compareApplications);
  assert.deepEqual(
    sorted.map((a) => a.id),
    ["z", "w", "y", "x"]
  );
});

console.log(`\n${passed} tests passed`);
