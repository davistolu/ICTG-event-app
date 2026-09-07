/**
 * Turns pagination-related query params into safe numbers with sane defaults
 * and strict upper bounds to prevent collection scan attacks.
 */
export function getPagination(query = {}) {
  const rawPage = typeof query.page === "string" || typeof query.page === "number" ? query.page : 1;
  const rawLimit = typeof query.limit === "string" || typeof query.limit === "number" ? query.limit : 12;

  const page = Math.min(Math.max(parseInt(rawPage, 10) || 1, 1), 10000);
  const limit = Math.min(Math.max(parseInt(rawLimit, 10) || 12, 1), 50);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function sanitizeRegex(str = "") {
  return typeof str === "string" ? str.slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";
}

/**
 * Builds a case-insensitive "contains" filter across the given fields.
 * Safely caps search term length to 80 chars and escapes regex specials to prevent ReDoS.
 */
export function buildSearchFilter(searchTerm, fields = []) {
  if (!searchTerm || typeof searchTerm !== "string" || !searchTerm.trim()) return {};
  
  const escaped = sanitizeRegex(searchTerm.trim());
  if (!escaped) return {};
  
  try {
    const regex = new RegExp(escaped, "i");
    return { $or: fields.map((field) => ({ [field]: regex })) };
  } catch (err) {
    return {};
  }
}


