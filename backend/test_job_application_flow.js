/**
 * Comprehensive Job Application & Cloudinary Resume Upload Test Suite
 * Tests all requirements from:
 * 1. Cloudinary upload integration (no local storage in uploads/resumes)
 * 2. File type validation (PDF, DOC, DOCX allowed; invalid rejected)
 * 3. File size limit validation (max 10MB limit enforced)
 * 4. Job application flow with profile resume and uploaded resume
 * 5. Duplicate application prevention
 * 6. Recruiter review and secure Cloudinary resume access
 * 7. Candidate application tracking
 */

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "http://localhost:5000/api/v1";

// Helper for JSON requests
const request = (path, method = "GET", data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const payload = data ? JSON.stringify(data) : null;
    if (payload) {
      headers["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      { method, headers },
      (res) => {
        let responseBody = "";
        res.on("data", (chunk) => { responseBody += chunk; });
        res.on("end", () => {
          try {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: JSON.parse(responseBody),
            });
          } catch {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: responseBody,
            });
          }
        });
      }
    );

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
};

// Helper for multipart/form-data upload
const uploadMultipart = (apiPath, fields, file, token = null) => {
  return new Promise((resolve, reject) => {
    const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
    const url = new URL(`${BASE_URL}${apiPath}`);

    const postParts = [];

    // Append text fields
    for (const [key, val] of Object.entries(fields)) {
      postParts.push(
        Buffer.from(
          `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`
        )
      );
    }

    // Append file if provided
    if (file) {
      const { fieldname = "resume", filename = "resume.pdf", contentType = "application/pdf", content } = file;
      postParts.push(
        Buffer.from(
          `--${boundary}\r\nContent-Disposition: form-data; name="${fieldname}"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`
        )
      );
      postParts.push(Buffer.isBuffer(content) ? content : Buffer.from(content));
      postParts.push(Buffer.from("\r\n"));
    }

    postParts.push(Buffer.from(`--${boundary}--\r\n`));
    const fullBody = Buffer.concat(postParts);

    const headers = {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": fullBody.length,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(
      url,
      { method: "POST", headers },
      (res) => {
        let responseBody = "";
        res.on("data", (chunk) => { responseBody += chunk; });
        res.on("end", () => {
          try {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: JSON.parse(responseBody),
            });
          } catch {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: responseBody,
            });
          }
        });
      }
    );

    req.on("error", reject);
    req.write(fullBody);
    req.end();
  });
};

const runJobApplicationTests = async () => {
  console.log("==================================================");
  console.log("🚀 Testing Job Application & Cloudinary Resume Flow");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, extraInfo = "") => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${extraInfo ? `-> ${extraInfo}` : ""}`);
      failed++;
    }
  };

  const ts = Date.now();
  const resumesDir = path.join(__dirname, "uploads", "resumes");
  const initialLocalResumeCount = fs.existsSync(resumesDir) ? fs.readdirSync(resumesDir).length : 0;

  try {
    // 1. Setup Employer & Recruiter
    console.log("--- 1. Setup: Registering Employer, Recruiter, and Job ---");
    const empRes = await request("/auth/register", "POST", {
      name: "Acme Corp Admin",
      email: `acme_admin_${ts}@test.com`,
      password: "Password123!",
      role: "employer",
    });
    assert(empRes.status === 201, "Employer registered");
    const empToken = empRes.data.data.accessToken;

    const companyRes = await request("/companies/my", "PUT", {
      companyName: `Acme Innovations ${ts}`,
      industry: "Software",
      website: "https://acmeinnovations.com",
    }, empToken);
    assert(companyRes.status === 200, "Employer company setup complete");
    const companyId = companyRes.data.data._id;

    // Register recruiter
    const recRes = await request("/auth/register", "POST", {
      name: "Rob Recruiter",
      email: `recruiter_${ts}@test.com`,
      password: "Password123!",
      role: "recruiter",
    });
    assert(recRes.status === 201, "Recruiter registered");
    const recToken = recRes.data.data.accessToken;

    await request("/recruiters/me", "PUT", {
      company: companyId,
      designation: "Principal Tech Recruiter",
    }, recToken);

    // Create Published Job Opening
    const jobRes = await request("/jobs", "POST", {
      title: `Senior Staff Software Engineer ${ts}`,
      description: "Exciting opportunity to build cutting edge distributed systems.",
      responsibilities: ["Lead engineering architecture", "Mentor engineers"],
      qualifications: ["5+ years experience with Node and React"],
      skills: ["Node.js", "React", "Cloud Architecture", "MongoDB"],
      employmentType: "full-time",
      workplaceType: "remote",
      location: "San Francisco, CA",
      salaryRange: { min: 160000, max: 210000, currency: "USD", period: "yearly" },
      status: "published",
    }, recToken);
    assert(jobRes.status === 201, "Job opening published successfully");
    const jobId = jobRes.data.data._id;

    // 2. Setup Candidates
    console.log("\n--- 2. Setup: Candidate Accounts ---");
    const cand1Res = await request("/auth/register", "POST", {
      name: "Alice Candidate",
      email: `alice_${ts}@test.com`,
      password: "Password123!",
      role: "candidate",
    });
    assert(cand1Res.status === 201, "Candidate 1 registered");
    const cand1Token = cand1Res.data.data.accessToken;

    const cand2Res = await request("/auth/register", "POST", {
      name: "Bob Candidate",
      email: `bob_${ts}@test.com`,
      password: "Password123!",
      role: "candidate",
    });
    assert(cand2Res.status === 201, "Candidate 2 registered");
    const cand2Token = cand2Res.data.data.accessToken;

    // 3. Test Resume Upload to Cloudinary via Candidate Profile
    console.log("\n--- 3. Test Candidate Resume Upload (Cloudinary) ---");
    const samplePdfContent = Buffer.from("%PDF-1.4 ... Sample Candidate Resume Content for Cloudinary ...");
    const uploadProfileResumeRes = await uploadMultipart(
      "/candidates/me/resume",
      {},
      {
        fieldname: "resume",
        filename: "alice_software_engineer_cv.pdf",
        contentType: "application/pdf",
        content: samplePdfContent,
      },
      cand1Token
    );

    assert(uploadProfileResumeRes.status === 200, "Candidate resume uploaded successfully");
    const uploadedResume = uploadProfileResumeRes.data.data?.resume;
    assert(
      uploadedResume &&
      uploadedResume.fileUrl &&
      uploadedResume.fileUrl.includes("cloudinary.com"),
      "Resume URL is stored as a Cloudinary cloud URL",
      uploadedResume?.fileUrl
    );
    assert(
      Boolean(uploadedResume?.publicId),
      "Resume publicId is stored in MongoDB metadata",
      uploadedResume?.publicId
    );

    // Verify local disk remains clean (no local upload files added to backend/uploads/resumes)
    const currentLocalResumeCount = fs.existsSync(resumesDir) ? fs.readdirSync(resumesDir).length : 0;
    assert(
      currentLocalResumeCount === initialLocalResumeCount,
      "Security & Storage: No files saved inside backend's local uploads/resumes folder"
    );

    // 4. Test Resume File Validation (Invalid File Type)
    console.log("\n--- 4. Test Validation: Invalid File Format & Size Limits ---");
    const invalidUploadRes = await uploadMultipart(
      "/candidates/me/resume",
      {},
      {
        fieldname: "resume",
        filename: "malicious_script.exe",
        contentType: "application/x-msdownload",
        content: Buffer.from("MZ... binary executable content"),
      },
      cand2Token
    );
    assert(
      invalidUploadRes.status === 400 && invalidUploadRes.data.error === "INVALID_FILE_TYPE",
      "Rejected invalid file format (.exe) with HTTP 400 and clear error message",
      invalidUploadRes.data?.message
    );

    // Oversized file (> 10MB)
    const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
    const oversizedUploadRes = await uploadMultipart(
      "/candidates/me/resume",
      {},
      {
        fieldname: "resume",
        filename: "huge_resume.pdf",
        contentType: "application/pdf",
        content: oversizedBuffer,
      },
      cand2Token
    );
    assert(
      oversizedUploadRes.status === 400,
      "Rejected oversized file (> 10MB) with HTTP 400",
      oversizedUploadRes.data?.message
    );

    // 5. Test Job Application without Resume (Should fail 400)
    console.log("\n--- 5. Test Job Application Flow Validation ---");
    const noResumeApplyRes = await request("/applications", "POST", {
      jobId,
      coverLetter: "Applying without any resume",
    }, cand2Token);
    assert(
      noResumeApplyRes.status === 400 && noResumeApplyRes.data.error === "RESUME_REQUIRED",
      "Cannot apply without resume (returns 400 RESUME_REQUIRED)",
      noResumeApplyRes.data?.message
    );

    // 6. Test Candidate 1 Applying Using Profile Resume
    console.log("\n--- 6. Candidate 1: Apply to Job Using Profile Resume ---");
    const cand1ApplyRes = await request("/applications", "POST", {
      jobId,
      coverLetter: "I am thrilled to apply for the Senior Staff Engineer position with my verified Cloudinary resume.",
      useProfileResume: true,
    }, cand1Token);

    assert(cand1ApplyRes.status === 201, "Candidate 1 successfully applied with profile resume");
    const app1 = cand1ApplyRes.data?.data;
    assert(
      app1?.resume?.fileUrl?.includes("cloudinary.com") && app1?.resume?.publicId,
      "Application document retains Cloudinary fileUrl and publicId in MongoDB",
      app1?.resume?.fileUrl
    );
    assert(app1?.status === "Applied", "Initial application status is 'Applied'");

    // 7. Test Duplicate Application Prevention
    console.log("\n--- 7. Test Duplicate Application Prevention ---");
    const dupApplyRes = await request("/applications", "POST", {
      jobId,
      coverLetter: "Trying to submit twice",
    }, cand1Token);
    assert(
      dupApplyRes.status === 400 && dupApplyRes.data.error === "DUPLICATE_APPLICATION",
      "Duplicate application blocked with HTTP 400 DUPLICATE_APPLICATION",
      dupApplyRes.data?.message
    );

    // 8. Test Candidate 2 Applying with Direct Resume Upload (Word .docx)
    console.log("\n--- 8. Candidate 2: Apply to Job with Direct Resume File (.docx) ---");
    const sampleDocxContent = Buffer.from("PK\x03\x04 ... Sample Word DOCX document content for Candidate 2 ...");
    const cand2ApplyRes = await uploadMultipart(
      "/applications",
      {
        jobId,
        coverLetter: "Enclosed is my latest CV in Word format.",
      },
      {
        fieldname: "resume",
        filename: "bob_cloud_resume.docx",
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        content: sampleDocxContent,
      },
      cand2Token
    );

    assert(cand2ApplyRes.status === 201, "Candidate 2 successfully applied with direct .docx upload");
    const app2 = cand2ApplyRes.data?.data;
    assert(
      app2?.resume?.fileUrl?.includes("cloudinary.com"),
      "Directly uploaded resume uploaded to Cloudinary and URL saved in MongoDB",
      app2?.resume?.fileUrl
    );
    assert(
      app2?.resume?.fileName === "bob_cloud_resume.docx",
      "Original filename properly preserved in application metadata"
    );

    // 9. Test Candidate Viewing Their Application History
    console.log("\n--- 9. Candidate Application Tracking ---");
    const myAppsRes = await request("/applications/me", "GET", null, cand1Token);
    assert(
      myAppsRes.status === 200 &&
      myAppsRes.data.data.applications?.some((a) => (a.jobId?._id === jobId || a.jobId === jobId)),
      "Candidate can retrieve application history with job details"
    );

    // 10. Test Recruiter Viewing Applications & Accessing Cloudinary Resumes
    console.log("\n--- 10. Recruiter Application Review & Resume Access ---");
    const recruiterAppsRes = await request(`/applications/job/${jobId}`, "GET", null, recToken);
    assert(
      recruiterAppsRes.status === 200 && recruiterAppsRes.data.data.applications?.length === 2,
      "Recruiter can view both candidate submissions for the job opening"
    );

    const recruiterApp1 = recruiterAppsRes.data.data.applications.find(
      (a) => a.candidateId?.email === `alice_${ts}@test.com`
    );
    assert(
      Boolean(recruiterApp1 && recruiterApp1.resume?.fileUrl && recruiterApp1.resume.fileUrl.includes("cloudinary.com")),
      "Recruiter can view and access candidate 1's Cloudinary resume URL",
      recruiterApp1?.resume?.fileUrl
    );

    const recruiterApp2 = recruiterAppsRes.data.data.applications.find(
      (a) => a.candidateId?.email === `bob_${ts}@test.com`
    );
    assert(
      Boolean(recruiterApp2 && recruiterApp2.resume?.fileUrl && recruiterApp2.resume.fileUrl.includes("cloudinary.com")),
      "Recruiter can view and access candidate 2's Cloudinary resume URL",
      recruiterApp2?.resume?.fileUrl
    );

    // 11. Recruiter Updates Application Status
    const statusUpdateRes = await request(`/applications/${app1._id}/status`, "PATCH", {
      status: "Under Review",
      note: "Candidate has strong Cloud & Node background",
    }, recToken);
    assert(
      statusUpdateRes.status === 200 && statusUpdateRes.data.data.status === "Under Review",
      "Recruiter updated application status to 'Under Review'"
    );

    console.log("\n==================================================");
    console.log(`📊 TEST SUITE COMPLETE:`);
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);
    console.log("==================================================");

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("Test Suite execution failed:", error);
    process.exit(1);
  }
};

runJobApplicationTests();
