import { v2 as cloudinary } from "cloudinary";
import path from "path";

// Initialize Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Checks if live Cloudinary credentials are provided in environment variables
 */
export const isCloudinaryConfigured = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  return Boolean(
    CLOUDINARY_CLOUD_NAME &&
    CLOUDINARY_API_KEY &&
    CLOUDINARY_API_SECRET &&
    !CLOUDINARY_CLOUD_NAME.includes("your_") &&
    !CLOUDINARY_API_KEY.includes("your_") &&
    !CLOUDINARY_API_SECRET.includes("your_")
  );
};

/**
 * Uploads a resume buffer to Cloudinary (folder: job_portal/resumes)
 * Supports PDF, DOC, and DOCX.
 * Does not write any file to the local filesystem.
 */
export const uploadResumeToCloudinary = (fileBuffer, originalName, mimetype) => {
  return new Promise((resolve, reject) => {
    const ext = path.extname(originalName).replace(".", "").toLowerCase() || "pdf";
    const cleanBaseName = path
      .basename(originalName, path.extname(originalName))
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    if (!isCloudinaryConfigured()) {
      console.warn(
        "[Cloudinary] Live credentials not set in .env. Using simulated Cloudinary storage URL for local/test development."
      );
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "job-portal-cloud";
      const publicId = `job_portal/resumes/${Date.now()}_${cleanBaseName}`;
      const simulatedUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/v${Date.now()}/${publicId}.${ext}`;
      return resolve({
        secure_url: simulatedUrl,
        url: simulatedUrl,
        public_id: publicId,
        bytes: fileBuffer ? fileBuffer.length : 0,
        format: ext,
        resource_type: "raw",
        original_filename: originalName,
      });
    }

    const uniquePublicId = `${Date.now()}_${cleanBaseName}`;

    // Cloudinary upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "job_portal/resumes",
        public_id: uniquePublicId,
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          console.error("[Cloudinary] Upload failed:", error);
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete a resume from Cloudinary when replaced or deleted
 */
export const deleteResumeFromCloudinary = async (publicId, resourceType = "raw") => {
  if (!publicId || !isCloudinaryConfigured()) return null;
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error("[Cloudinary] Failed to delete asset:", err.message);
    return null;
  }
};

export default cloudinary;
