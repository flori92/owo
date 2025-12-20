export const isDemoRequest = (request) => {
  try {
    const url = new URL(request.url);
    const demoParam = url.searchParams.get("demo");
    if (demoParam === "1" || demoParam === "true") return true;
  } catch {
    // ignore
  }

  const envMode = (process.env.APP_MODE || process.env.OWO_APP_MODE || "").toLowerCase();
  if (envMode === "demo") return true;

  return false;
};

export const isMissingDatabaseError = (error) => {
  const msg = (error && typeof error === "object" && "message" in error
    ? String(error.message)
    : "");
  return msg.includes("No database connection string was provided") || msg.includes("DATABASE_URL");
};

export const demoUserId = "demo-user";
