import jwt from "jsonwebtoken";
import User from "./auth.model.js";
import Candidate from "../candidates/candidate.model.js";
import Recruiter from "../recruiters/recruiter.model.js";
import Company from "../companies/company.model.js";

// Helper to generate access and refresh tokens
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_ACCESS_SECRET || "jobportal_super_secret_access_jwt_key_2026_dev",
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1h" }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || "jobportal_super_secret_refresh_jwt_key_2026_dev",
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
  );

  return { accessToken, refreshToken };
};

// Cookie configuration
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Register a new user (Candidate, Recruiter, or Employer)
 */
const RegisterUser = async (req, res) => {
  try {
    console.log("Hit RegisterUser api...");
    const incomingData = req.body;

    const requiredFields = ["name", "email", "password", "role"];
    const missingFields = requiredFields.filter((item) => {
      return (
        incomingData[item] === null ||
        incomingData[item] === undefined ||
        incomingData[item] === ""
      );
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
        data: null,
        error: missingFields,
      });
    }

    const { name, email, password, role, phone, companyName } = incomingData;

    // Validate role
    const allowedRoles = ["candidate", "recruiter", "employer"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified. Allowed roles are candidate, recruiter, employer",
        data: null,
        error: "INVALID_ROLE",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists",
        data: null,
        error: "EMAIL_ALREADY_EXISTS",
      });
    }

    // Create User
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      phone: phone ? phone.trim() : "",
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser._id, newUser.role);
    newUser.refreshToken = refreshToken;
    await newUser.save();

    // Automatically initialize corresponding profile
    if (role === "candidate") {
      await Candidate.create({
        userId: newUser._id,
        fullName: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      });
    } else if (role === "recruiter") {
      await Recruiter.create({
        userId: newUser._id,
        fullName: newUser.name,
        contactPhone: newUser.phone,
        companyName: companyName ? companyName.trim() : "",
      });
    } else if (role === "employer") {
      await Company.create({
        employerId: newUser._id,
        companyName: companyName && companyName.trim() ? companyName.trim() : `${newUser.name}'s Organization`,
      });
    }

    // Set cookie
    res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 60 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, cookieOptions);

    const safeUser = newUser.toJSON();

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: safeUser,
        accessToken,
        refreshToken,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle RegisterUser", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed due to an internal server error",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Login user
 */
const LoginUser = async (req, res) => {
  try {
    console.log("Hit LoginUser api...");
    const incomingData = req.body;

    const requiredFields = ["email", "password"];
    const missingFields = requiredFields.filter((item) => {
      return (
        incomingData[item] === null ||
        incomingData[item] === undefined ||
        incomingData[item] === ""
      );
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
        data: null,
        error: missingFields,
      });
    }

    const { email, password } = incomingData;

    // Find user including password
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password credentials",
        data: null,
        error: "INVALID_CREDENTIALS",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated. Please contact support.",
        data: null,
        error: "ACCOUNT_DEACTIVATED",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password credentials",
        data: null,
        error: "INVALID_CREDENTIALS",
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookie
    res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 60 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, cookieOptions);

    const safeUser = user.toJSON();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: safeUser,
        accessToken,
        refreshToken,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle LoginUser", error);
    return res.status(500).json({
      success: false,
      message: "Login failed due to an internal server error",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Refresh access token using refresh token
 */
const RefreshToken = async (req, res) => {
  try {
    console.log("Hit RefreshToken api...");
    let token = null;

    if (req.body && req.body.refreshToken) {
      token = req.body.refreshToken;
    } else if (req.cookies && req.cookies.refreshToken) {
      token = req.cookies.refreshToken;
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is missing",
        data: null,
        error: "NO_REFRESH_TOKEN",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || "jobportal_super_secret_refresh_jwt_key_2026_dev"
    );

    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token. Please log in again.",
        data: null,
        error: "INVALID_REFRESH_TOKEN",
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user._id, user.role);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.cookie("accessToken", tokens.accessToken, { ...cookieOptions, maxAge: 60 * 60 * 1000 });
    res.cookie("refreshToken", tokens.refreshToken, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle RefreshToken", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Logout user
 */
const LogoutUser = async (req, res) => {
  try {
    console.log("Hit LogoutUser api...");
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
      data: null,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle LogoutUser", error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout cleanly",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Get current authenticated user profile
 */
const GetCurrentUser = async (req, res) => {
  try {
    console.log("Hit GetCurrentUser api...");
    const user = req.user.toJSON();
    let profile = null;

    if (user.role === "candidate") {
      profile = await Candidate.findOne({ userId: user._id });
    } else if (user.role === "recruiter") {
      profile = await Recruiter.findOne({ userId: user._id }).populate("company", "companyName logo industry");
    } else if (user.role === "employer") {
      profile = await Company.findOne({ employerId: user._id });
    }

    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: {
        user,
        profile,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetCurrentUser", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user profile",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Update basic account details (name, phone, avatar)
 */
const UpdateAccountInfo = async (req, res) => {
  try {
    console.log("Hit UpdateAccountInfo api...");
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
        error: "USER_NOT_FOUND",
      });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Account information updated successfully",
      data: { user: user.toJSON() },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle UpdateAccountInfo", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update account information",
      data: null,
      error: error.message,
    });
  }
};

export {
  RegisterUser,
  LoginUser,
  RefreshToken,
  LogoutUser,
  GetCurrentUser,
  UpdateAccountInfo,
};
