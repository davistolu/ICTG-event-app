// Central security-hardened error handler
export default function errorHandler(err, req, res, next) {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Internal server error occurred";

  // Malformed ObjectId (e.g. /api/events/invalid-id) - sanitize without reflecting untrusted input
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid format provided for field '${err.path}'`;
  }

  // Mongoose schema validation
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(". ");
  }

  // Duplicate key (MongoDB unique index violation)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `A record with that ${field} already exists`;
  }

  // JSON parsing error (Malformed body)
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Malformed JSON payload in request body";
  }

  // Payload too large
  if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Request payload exceeds allowed size limit";
  }

  // In production, mask generic 500 server errors
  if (statusCode === 500 && process.env.NODE_ENV === "production") {
    console.error("[INTERNAL_SERVER_ERROR]", err);
    message = "An unexpected server error occurred. Please try again later.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
}

