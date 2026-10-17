/**
 * Automated Test Suite for Stage 2: Job Portal Application
 * Tests:
 * 1. User & Company Setup (Employer, Recruiter, Candidate)
 * 2. Job Creation (Draft & Published) with complete schema fields
 * 3. Job Search, Multi-faceted Filtering & Pagination
 * 4. Job Details by ID
 * 5. Saved Jobs (Save, Unsave, List)
 * 6. Job Application Submission & Duplicate Application Prevention
 * 7. Recruiter Job Applicants View & Candidate Detail Inspection
 * 8. Application Status Transitions & Role-based Authorization Restrictions
 * 9. Recruiter Candidate Discovery & Profile Inspection
 * 10. Recruiter Invitations Flow (Send, List, Candidate Accept/Decline)
 * 11. In-App Notifications (Creation triggers, Unread Count, Mark as Read)
 * 12. Job Status Management (Publish, Close, Update)
 */

import http from "http";

const BASE_URL = "http://localhost:5000/api/v1";

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
      {
        method,
        headers,
      },
      (res) => {
        let responseBody = "";
        res.on("data", (chunk) => {
          responseBody += chunk;
        });

        res.on("end", () => {
          try {
            const parsed = JSON.parse(responseBody);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: responseBody });
          }
        });
      }
    );

    req.on("error", reject);

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

const runStage2Tests = async () => {
  console.log("==================================================");
  console.log("🚀 Starting Stage 2 Automated Integration Test Suite");
  console.log("==================================================");

  let testsPassed = 0;
  let testsFailed = 0;

  const assert = (condition, testName, details = "") => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      testsPassed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${details}`);
      testsFailed++;
    }
  };

  const timestamp = Date.now();
  const employerEmail = `emp_stage2_${timestamp}@test.com`;
  const recruiterEmail = `rec_stage2_${timestamp}@test.com`;
  const candidateEmail = `cand_stage2_${timestamp}@test.com`;

  let employerToken = "";
  let recruiterToken = "";
  let candidateToken = "";
  let candidateUser = null;
  let companyId = "";
  let testJobId = "";
  let testApplicationId = "";
  let testInvitationId = "";

  try {
    // -------------------------------------------------------------
    // SETUP: Register Employer & Create Company
    // -------------------------------------------------------------
    console.log("\n--- Setup: Registering Employer, Recruiter & Candidate ---");
    const empReg = await request("/auth/register", "POST", {
      name: "Acme Boss",
      email: employerEmail,
      password: "Password123!",
      role: "employer",
    });
    assert(empReg.status === 201, "Employer registered successfully");
    employerToken = empReg.data.data.accessToken;

    // Get / Update Company Profile for Employer
    const compGet = await request("/companies/my", "GET", null, employerToken);
    assert(compGet.status === 200, "Company profile retrieved/initialized for employer");
    companyId = compGet.data.data._id;

    const compUpdate = await request(
      "/companies/my",
      "PUT",
      {
        companyName: `Acme Tech ${timestamp}`,
        industry: "Information Technology",
        website: "https://acmetech.io",
        location: "San Francisco, CA",
        description: "Leading enterprise cloud provider.",
        companySize: "51-200",
      },
      employerToken
    );
    assert(compUpdate.status === 200, "Company profile updated by employer");

    // Register Candidate
    const candReg = await request("/auth/register", "POST", {
      name: "Jane Dev",
      email: candidateEmail,
      password: "Password123!",
      role: "candidate",
    });
    assert(candReg.status === 201, "Candidate registered successfully");
    candidateToken = candReg.data.data.accessToken;
    candidateUser = candReg.data.data.user;

    // Update Candidate profile with skills & experience
    const candProfileUpdate = await request(
      "/candidates/me",
      "PUT",
      {
        fullName: "Jane Dev",
        headline: "Senior Full Stack Engineer",
        skills: ["React", "Node.js", "MongoDB", "TypeScript", "Docker"],
        experience: [
          {
            title: "Software Engineer",
            company: "Tech Corp",
            startDate: "2021-01-01",
            current: true,
            description: "Building scalable web apps.",
          },
        ],
        preferredLocation: "San Francisco, CA",
        preferredRole: "Full Stack Developer",
        resume: {
          fileName: "jane_dev_resume.pdf",
          fileUrl: "/uploads/resumes/jane_dev_resume.pdf",
          fileSize: 1048576,
          uploadedAt: new Date(),
        },
      },
      candidateToken
    );
    assert(candProfileUpdate.status === 200, "Candidate profile populated with skills & experience");

    // Register Recruiter and associate with company
    const recReg = await request("/auth/register", "POST", {
      name: "Rob Recruiter",
      email: recruiterEmail,
      password: "Password123!",
      role: "recruiter",
    });
    assert(recReg.status === 201, "Recruiter registered successfully");
    recruiterToken = recReg.data.data.accessToken;

    const recProfileUpdate = await request(
      "/recruiters/me",
      "PUT",
      {
        company: companyId,
        designation: "Talent Acquisition Lead",
        department: "Engineering",
      },
      recruiterToken
    );
    assert(recProfileUpdate.status === 200, "Recruiter profile associated with employer company");

    // -------------------------------------------------------------
    // TEST 1: Job Creation (Employer & Recruiter)
    // -------------------------------------------------------------
    console.log("\n--- Test 1: Job Creation by Recruiter ---");
    const jobPayload = {
      title: "Senior Full Stack Developer",
      description: "We are seeking an experienced developer to join our core cloud platform team.",
      responsibilities: [
        "Design and build reliable REST APIs",
        "Collaborate with product and UX designers",
        "Maintain high test coverage and CI/CD pipelines",
      ],
      qualifications: [
        "Bachelors in Computer Science or equivalent practical experience",
        "3+ years experience with Node.js and React",
      ],
      skills: ["React", "Node.js", "MongoDB", "Express", "Docker"],
      experienceRange: {
        min: 3,
        max: 6,
      },
      employmentType: "full-time",
      workplaceType: "hybrid",
      location: "San Francisco, CA",
      salaryRange: {
        min: 120000,
        max: 160000,
        currency: "USD",
        period: "yearly",
      },
      vacancies: 2,
      education: "Bachelor's Degree",
      status: "published",
    };

    const createJobRes = await request("/jobs", "POST", jobPayload, recruiterToken);
    assert(
      createJobRes.status === 201 && createJobRes.data?.data?._id,
      "Recruiter can create published job opening with all schema attributes",
      createJobRes.data?.message
    );
    testJobId = createJobRes.data?.data?._id;

    // Candidate should NOT be able to create a job (Security test)
    const candCreateJob = await request("/jobs", "POST", jobPayload, candidateToken);
    assert(
      candCreateJob.status === 403,
      "Security: Candidate is forbidden from creating job openings (403)"
    );

    // -------------------------------------------------------------
    // TEST 2: Job Listing, Search & Multi-Faceted Filtering
    // -------------------------------------------------------------
    console.log("\n--- Test 2: Job Listing, Search & Filtering ---");
    const listRes = await request("/jobs?search=Full+Stack");
    assert(
      listRes.status === 200 && listRes.data?.data?.jobs?.length > 0,
      "Public keyword search finds relevant job openings"
    );

    const filterRes = await request(
      "/jobs?workplaceType=hybrid&employmentType=full-time&location=San+Francisco"
    );
    assert(
      filterRes.status === 200 && filterRes.data?.data?.jobs?.some((j) => j._id === testJobId),
      "Multi-faceted filtering returns matching jobs"
    );

    const detailRes = await request(`/jobs/${testJobId}`);
    assert(
      detailRes.status === 200 &&
        (detailRes.data?.data?.job?.title === "Senior Full Stack Developer" ||
          detailRes.data?.data?.title === "Senior Full Stack Developer"),
      "Public endpoint retrieves full job details by ID"
    );

    // -------------------------------------------------------------
    // TEST 3: Candidate Saved Jobs
    // -------------------------------------------------------------
    console.log("\n--- Test 3: Candidate Saved Jobs ---");
    const saveJobRes = await request(`/saved-jobs/${testJobId}`, "POST", {}, candidateToken);
    assert(
      saveJobRes.status === 201,
      "Candidate can save a job opening",
      saveJobRes.data?.message
    );

    const getSavedRes = await request("/saved-jobs", "GET", null, candidateToken);
    assert(
      getSavedRes.status === 200 &&
        getSavedRes.data?.data?.savedJobs?.some((s) => s.jobId?._id === testJobId),
      "Candidate can retrieve saved jobs list"
    );

    const unsaveRes = await request(`/saved-jobs/${testJobId}`, "DELETE", null, candidateToken);
    assert(unsaveRes.status === 200, "Candidate can unsave a job");

    // -------------------------------------------------------------
    // TEST 4: Job Application & Duplicate Application Prevention
    // -------------------------------------------------------------
    console.log("\n--- Test 4: Job Application System ---");
    const applyRes = await request(
      "/applications",
      "POST",
      {
        jobId: testJobId,
        coverLetter: "I have 4 years of experience with React, Node.js and MongoDB and would love to contribute to Acme Tech.",
      },
      candidateToken
    );
    assert(
      applyRes.status === 201 &&
        (applyRes.data?.data?.status === "Applied" || applyRes.data?.data?.status === "applied"),
      "Candidate can apply to published job with cover letter",
      applyRes.data?.message
    );
    testApplicationId = applyRes.data?.data?._id;

    // Test duplicate application prevention
    const dupApplyRes = await request(
      "/applications",
      "POST",
      {
        jobId: testJobId,
        coverLetter: "Duplicate attempt",
      },
      candidateToken
    );
    assert(
      dupApplyRes.status === 400 && dupApplyRes.data?.error === "DUPLICATE_APPLICATION",
      "Duplicate application prevention: Candidate cannot apply twice to same job (400)"
    );

    // Candidate checks own application history
    const candApps = await request("/applications/me", "GET", null, candidateToken);
    assert(
      candApps.status === 200 &&
        candApps.data?.data?.applications?.some((a) => a._id === testApplicationId),
      "Candidate can view application history"
    );

    // -------------------------------------------------------------
    // TEST 5: Recruiter Review & Status Transitions
    // -------------------------------------------------------------
    console.log("\n--- Test 5: Recruiter Application Review & Transitions ---");
    const jobApps = await request(
      `/applications/job/${testJobId}`,
      "GET",
      null,
      recruiterToken
    );
    assert(
      jobApps.status === 200 && jobApps.data?.data?.applications?.length > 0,
      "Recruiter can view applications submitted to their company job"
    );

    // Valid status transition: Applied -> Under Review
    const statusTrans1 = await request(
      `/applications/${testApplicationId}/status`,
      "PATCH",
      {
        status: "Under Review",
        note: "Profile looks promising, moving to review.",
      },
      recruiterToken
    );
    assert(
      statusTrans1.status === 200 &&
        (statusTrans1.data?.data?.status === "Under Review" ||
          statusTrans1.data?.data?.status === "under_review"),
      "Recruiter can transition status from 'applied' to 'under_review'"
    );

    // Next valid transition: Under Review -> Shortlisted
    const statusTrans2 = await request(
      `/applications/${testApplicationId}/status`,
      "PATCH",
      {
        status: "Shortlisted",
        note: "Shortlisted for technical screen.",
      },
      recruiterToken
    );
    assert(
      statusTrans2.status === 200 &&
        (statusTrans2.data?.data?.status === "Shortlisted" ||
          statusTrans2.data?.data?.status === "shortlisted"),
      "Recruiter can transition status from 'under_review' to 'shortlisted'"
    );

    // Unauthorized candidate status modification check
    const candIllegalStatus = await request(
      `/applications/${testApplicationId}/status`,
      "PATCH",
      {
        status: "Hired",
      },
      candidateToken
    );
    assert(
      candIllegalStatus.status === 403,
      "Security: Candidate cannot modify application status (403)"
    );

    // -------------------------------------------------------------
    // TEST 6: Recruiter Candidate Discovery
    // -------------------------------------------------------------
    console.log("\n--- Test 6: Recruiter Candidate Discovery ---");
    const candSearchRes = await request(
      "/candidates/search?skills=React&search=Jane",
      "GET",
      null,
      recruiterToken
    );
    assert(
      candSearchRes.status === 200 &&
        candSearchRes.data?.data?.candidates?.some(
          (c) =>
            (c.userId && (c.userId._id === candidateUser._id || c.userId === candidateUser._id)) ||
            (c.fullName && c.fullName.includes("Jane"))
        ),
      "Recruiter candidate search filters candidates by skills and keywords"
    );

    // Candidate details inspection for recruiter
    const candProfileDoc = candSearchRes.data?.data?.candidates?.find(
      (c) =>
        (c.userId && (c.userId._id === candidateUser._id || c.userId === candidateUser._id)) ||
        (c.fullName && c.fullName.includes("Jane"))
    );
    if (candProfileDoc) {
      const candDetailRes = await request(
        `/candidates/detail/${candProfileDoc._id}`,
        "GET",
        null,
        recruiterToken
      );
      assert(
        candDetailRes.status === 200 && candDetailRes.data?.data?.skills?.includes("React"),
        "Recruiter can view authorized candidate profile details"
      );
    }

    // -------------------------------------------------------------
    // TEST 7: Recruiter Invitations Flow
    // -------------------------------------------------------------
    console.log("\n--- Test 7: Recruiter Invitations Flow ---");
    const inviteRes = await request(
      "/invitations",
      "POST",
      {
        candidateId: candidateUser._id,
        jobId: testJobId,
        message: "Your profile matches our Senior Developer role. We invite you to apply!",
      },
      recruiterToken
    );
    assert(
      inviteRes.status === 201 && inviteRes.data?.data?.status === "pending",
      "Recruiter can send job invitation to candidate",
      inviteRes.data?.message
    );
    testInvitationId = inviteRes.data?.data?._id;

    // Recruiter lists sent invitations
    const sentInvites = await request("/invitations/sent", "GET", null, recruiterToken);
    assert(
      sentInvites.status === 200 &&
        sentInvites.data?.data?.invitations?.some((i) => i._id === testInvitationId),
      "Recruiter can view sent invitations"
    );

    // Candidate retrieves received invitations
    const candInvites = await request("/invitations/me", "GET", null, candidateToken);
    assert(
      candInvites.status === 200 &&
        candInvites.data?.data?.invitations?.some((i) => i._id === testInvitationId),
      "Candidate can view received job invitations in their dashboard"
    );

    // Candidate responds (accepts) invitation
    const acceptInvite = await request(
      `/invitations/${testInvitationId}/respond`,
      "PATCH",
      {
        response: "accepted",
      },
      candidateToken
    );
    assert(
      acceptInvite.status === 200 && acceptInvite.data?.data?.invitation?.status === "accepted",
      "Candidate can accept a job invitation"
    );

    // -------------------------------------------------------------
    // TEST 8: In-App Notifications
    // -------------------------------------------------------------
    console.log("\n--- Test 8: In-App Notifications System ---");
    // Candidate checks notifications (should have notification for status change and invitation)
    const candNotifs = await request("/notifications", "GET", null, candidateToken);
    assert(
      candNotifs.status === 200 && candNotifs.data?.data?.notifications?.length > 0,
      "Candidate receives in-app notifications for status updates and invitations"
    );

    const unreadCountRes = await request("/notifications/unread-count", "GET", null, candidateToken);
    assert(
      unreadCountRes.status === 200 && unreadCountRes.data?.data?.unreadCount > 0,
      "Unread notification count calculated accurately"
    );

    // Mark all as read
    const markAllRes = await request("/notifications/read-all", "PATCH", {}, candidateToken);
    assert(
      markAllRes.status === 200,
      "Candidate can mark all notifications as read"
    );

    const postReadCount = await request("/notifications/unread-count", "GET", null, candidateToken);
    assert(
      postReadCount.status === 200 && postReadCount.data?.data?.unreadCount === 0,
      "Unread count drops to 0 after marking all as read"
    );

    // -------------------------------------------------------------
    // TEST 9: Recruiter Job Management (Status toggle: Draft/Closed)
    // -------------------------------------------------------------
    console.log("\n--- Test 9: Job Status Management ---");
    const closeJobRes = await request(
      `/jobs/${testJobId}/status`,
      "PATCH",
      {
        status: "closed",
      },
      recruiterToken
    );
    assert(
      closeJobRes.status === 200 && closeJobRes.data?.data?.status === "closed",
      "Recruiter can change job opening status to 'closed'"
    );

    // Reopen / Publish
    const pubJobRes = await request(
      `/jobs/${testJobId}/status`,
      "PATCH",
      {
        status: "published",
      },
      recruiterToken
    );
    assert(
      pubJobRes.status === 200 && pubJobRes.data?.data?.status === "published",
      "Recruiter can change job opening status back to 'published'"
    );

  } catch (error) {
    console.error("Test execution threw unhandled exception:", error);
    testsFailed++;
  }

  console.log("\n==================================================");
  console.log(`📊 STAGE 2 TEST SUMMARY:`);
  console.log(`   Passed: ${testsPassed}`);
  console.log(`   Failed: ${testsFailed}`);
  console.log("==================================================");

  if (testsFailed > 0) {
    process.exit(1);
  }
};

runStage2Tests();
