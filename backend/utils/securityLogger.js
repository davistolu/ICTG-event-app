/**
 * Structured Security & Audit Logger for ICTG Portal.
 * Captures critical security events without logging credentials or tokens.
 */

export const SecurityEvents = {
  AUTH_LOGIN_SUCCESS: "AUTH_LOGIN_SUCCESS",
  AUTH_LOGIN_FAILURE: "AUTH_LOGIN_FAILURE",
  AUTH_LOGOUT: "AUTH_LOGOUT",
  AUTH_PERMISSION_DENIED: "AUTH_PERMISSION_DENIED",
  TOKEN_INVALID_OR_EXPIRED: "TOKEN_INVALID_OR_EXPIRED",
  TOKEN_REVOKED: "TOKEN_REVOKED",
  ADMIN_USER_CREATED: "ADMIN_USER_CREATED",
  ADMIN_USER_UPDATED: "ADMIN_USER_UPDATED",
  ADMIN_USER_DELETED: "ADMIN_USER_DELETED",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  EVENT_CREATED: "EVENT_CREATED",
  EVENT_UPDATED: "EVENT_UPDATED",
  EVENT_DELETED: "EVENT_DELETED",
  ANNOUNCEMENT_CREATED: "ANNOUNCEMENT_CREATED",
  ANNOUNCEMENT_UPDATED: "ANNOUNCEMENT_UPDATED",
  ANNOUNCEMENT_DELETED: "ANNOUNCEMENT_DELETED",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  INPUT_VALIDATION_FAILURE: "INPUT_VALIDATION_FAILURE",
  SUSPICIOUS_REQUEST: "SUSPICIOUS_REQUEST",
};

export function logSecurityEvent(event, details = {}, req = null) {
  const timestamp = new Date().toISOString();
  const ip = req
    ? req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown"
    : "system";
  const userAgent = req?.headers["user-agent"] || "unknown";
  const actor = req?.admin ? `${req.admin.username} (${req.admin.role})` : "anonymous";

  // Sanitize details to ensure sensitive fields are NEVER logged
  const sanitizedDetails = { ...details };
  delete sanitizedDetails.password;
  delete sanitizedDetails.passwordHash;
  delete sanitizedDetails.token;
  delete sanitizedDetails.authorization;
  delete sanitizedDetails.authHeader;

  const logEntry = {
    timestamp,
    event,
    actor,
    ip,
    userAgent,
    ...sanitizedDetails,
  };

  const formatted = `[SECURITY_AUDIT] [${timestamp}] [${event}] [Actor: ${actor}] [IP: ${ip}] ${JSON.stringify(
    sanitizedDetails
  )}`;

  if (
    event.includes("FAILURE") ||
    event.includes("DENIED") ||
    event.includes("EXCEEDED") ||
    event.includes("SUSPICIOUS")
  ) {
    console.warn(formatted);
  } else {
    console.log(formatted);
  }

  return logEntry;
}

export const securityLogger = {
  events: SecurityEvents,
  log: (event, req, details = {}) => logSecurityEvent(event, details, req),
};

export default securityLogger;
