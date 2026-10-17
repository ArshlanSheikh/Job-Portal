import jwt from "jsonwebtoken";
import User from "./auth.model.js";

/**
 * Authentication Middleware:
 * Verifies JWT access token from Authorization header or cookie.
 */
export const Authentication = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing. Please log in.",
        data: null,
        error: "NO_TOKEN_PROVIDED",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || "jobportal_super_secret_access_jwt_key_2026_dev"
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists",
        data: null,
        error: "USER_NOT_FOUND",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
        data: null,
        error: "ACCOUNT_DEACTIVATED",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token has expired. Please refresh your session.",
        data: null,
        error: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid authentication token",
      data: null,
      error: "INVALID_TOKEN",
    });
  }
};

/**
 * Authorization Middleware:
 * Checks if the authenticated user has one of the allowed roles.
 */
export const Authorization = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required before authorization",
        data: null,
        error: "AUTH_REQUIRED",
      });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(", ")}] roles. Your role is '${req.user.role}'.`,
        data: null,
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    next();
  };
};
