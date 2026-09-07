// Central error handler. Every controller funnels errors here via next(err)
// or asyncHandler, so the API always returns a consistent JSON shape.
export default function errorHandler(err, req, res, next) {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Something went wrong on the server";

  // Malformed ObjectId (e.g. /api/events/not-a-real-id)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose schema validation
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with that value already exists";
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}
