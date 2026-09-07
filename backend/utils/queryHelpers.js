/**
 * Turns pagination-related query params into safe numbers with sane defaults
 * and an upper bound, so a client can't force an unbounded scan of the
 * collection with ?limit=999999.
 */
export function getPagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 12, 1), 50);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Builds a case-insensitive "contains" filter across the given fields for a
 * free-text `search` query param. Using $or + regex here (rather than a
 * MongoDB $text index) keeps partial-word matches like "wor" -> "worship"
 * working, which members expect from a simple search box.
 */
export function buildSearchFilter(searchTerm, fields) {
  if (!searchTerm || !searchTerm.trim()) return {};
  const escaped = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");
  return { $or: fields.map((field) => ({ [field]: regex })) };
}
