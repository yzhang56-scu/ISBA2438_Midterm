export const JOB_STORAGE_KEY = "job-applications";

export const STATUS_OPTIONS = [
  "Wishlist",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
];

const STATUS_CLASS_MAP = {
  Wishlist: "flag flag-overview",
  Applied: "flag status-applied",
  Interview: "flag status-interview",
  Offer: "flag status-offer",
  Rejected: "flag status-rejected",
};

export function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isValidDate(value) {
  const raw = String(value ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return false;
  }
  const [year, month, day] = raw.split("-").map(Number);
  if (month < 1 || month > 12) {
    return false;
  }
  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
}

export function formatDate(value) {
  if (!isValidDate(value)) {
    return "";
  }
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function statusClass(status) {
  return STATUS_CLASS_MAP[status] ?? "flag flag-overview";
}

export function normalizeStatus(value) {
  const needle = String(value ?? "").trim().toLowerCase();
  return (
    STATUS_OPTIONS.find((option) => option.toLowerCase() === needle) ??
    "Wishlist"
  );
}

export function sanitizeApplication(entry) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return null;
  }
  const company = String(entry.company ?? "").trim();
  const position = String(entry.position ?? "").trim();
  if (!company || !position) {
    return null;
  }
  const dateApplied = isValidDate(entry.dateApplied)
    ? String(entry.dateApplied)
    : "";
  const createdAt = String(entry.createdAt ?? "");
  return {
    id: entry.id ? String(entry.id) : makeId(),
    company,
    position,
    status: normalizeStatus(entry.status),
    dateApplied,
    notes: String(entry.notes ?? "").trim(),
    createdAt,
    updatedAt: String(entry.updatedAt ?? createdAt),
  };
}

export function sanitizeApplications(entries) {
  if (!Array.isArray(entries)) {
    return [];
  }
  const seen = new Set();
  const cleaned = [];
  for (const entry of entries) {
    const application = sanitizeApplication(entry);
    if (!application || seen.has(application.id)) {
      continue;
    }
    seen.add(application.id);
    cleaned.push(application);
  }
  return cleaned;
}

export function loadApplications(storage) {
  try {
    const raw = storage.getItem(JOB_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return sanitizeApplications(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function saveApplications(storage, applications) {
  try {
    storage.setItem(JOB_STORAGE_KEY, JSON.stringify(applications));
    return true;
  } catch {
    return false;
  }
}

export function compareApplications(a, b) {
  if (a.dateApplied !== b.dateApplied) {
    if (!a.dateApplied) return 1;
    if (!b.dateApplied) return -1;
    return a.dateApplied < b.dateApplied ? 1 : -1;
  }
  return a.createdAt < b.createdAt ? 1 : -1;
}
