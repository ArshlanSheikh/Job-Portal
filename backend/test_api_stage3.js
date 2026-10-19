/**
 * Stage 3 Automated Integration Test Suite
 * Tests all Stage 3 deliverables:
 * 1. Candidate Dashboard API (profile strength, stats, recommended jobs, recent jobs, applications, invitations, notifications)
 * 2. Recruiter Dashboard API (openings, active/closed, applications awaiting review, pipeline breakdown, invitations, recent candidates)
 * 3. Employer Dashboard API (company profile, recruitment activity, application statistics, company job listings)
 * 4. Authorized Recruiter Management (list affiliated recruiters, revoke recruiter authorization)
 * 5. Cross-Role Authorization & Security (strict 403 RBAC on dashboard & management endpoints)
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
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: parsed,
            });
          } catch {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: responseBody,
            });
          }
        });
      }
    );

    req.on("error", (err) => {
      reject(err);
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

const runStage3Tests = async () => {
  console.log("==================================================");
  console.log("🚀 Starting Stage 3 Automated Integration Test Suite");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    const testTimestamp = Date.now();

    // 1. Setup Accounts
    console.log("--- Setup: Registering Employer, Recruiter & Candidate for Stage 3 ---");

    // Employer
    const employerData = {
      name: `Employer Stage3_${testTimestamp}`,
      email: `emp_stage3_${testTimestamp}@test.com`,
      password: "Password123!",
      role: "employer",
    };
    const empRes = await request("/auth/register", "POST", employerData);
    assert(empRes.status === 201 && empRes.body.success, "Employer registered successfully");
    const empToken = empRes.body.data.accessToken;

    // Update Company
    const compUpdateRes = await request(
      "/companies/my",
      "PUT",
      {
        companyName: `GlobalTech Corp ${testTimestamp}`,
        industry: "Cloud & AI Infrastructure",
        location: "Austin, TX",
        companySize: "100-500 employees",
      },
      empToken
    );
    assert(compUpdateRes.status === 200, "Employer company branding configured");
    const companyId = compUpdateRes.body.data._id;

    // Recruiter
    const recruiterData = {
      name: `Recruiter Stage3_${testTimestamp}`,
      email: `rec_stage3_${testTimestamp}@test.com`,
      password: "Password123!",
      role: "recruiter",
    };
    const recRes = await request("/auth/register", "POST", recruiterData);
    assert(recRes.status === 201 && recRes.body.success, "Recruiter registered successfully");
    const recToken = recRes.body.data.accessToken;

    // Link Recruiter to Employer Company
    const recLinkRes = await request(
      "/recruiters/me",
      "PUT",
      {
        company: companyId,
        jobTitle: "Senior Technical Talent Lead",
        department: "Core Engineering Recruitment",
      },
      recToken
    );
    assert(recLinkRes.status === 200 && recLinkRes.body.data.company._id === companyId, "Recruiter linked to Employer company");
    const recruiterId = recLinkRes.body.data._id;

    // Candidate
    const candidateData = {
      name: `Candidate Stage3_${testTimestamp}`,
      email: `cand_stage3_${testTimestamp}@test.com`,
      password: "Password123!",
      role: "candidate",
    };
    const candRes = await request("/auth/register", "POST", candidateData);
    assert(candRes.status === 201 && candRes.body.success, "Candidate registered successfully");
    const candToken = candRes.body.data.accessToken;

    // Candidate Profile
    const candProfRes = await request(
      "/candidates/me",
      "PUT",
      {
        headline: "Principal Systems Engineer (Go / React)",
        skills: ["Go", "React", "Distributed Systems", "Kubernetes"],
        currentLocation: "Austin, TX",
        resume: {
          fileName: "candidate_resume.pdf",
          fileUrl: "/uploads/resumes/candidate_resume.pdf",
          fileSize: 1024000,
          uploadedAt: new Date(),
        },
      },
      candToken
    );
    assert(candProfRes.status === 200, "Candidate profile populated with verified skills and resume");

    // Post 2 Jobs from Recruiter/Company
    const job1Res = await request(
      "/jobs",
      "POST",
      {
        title: `Principal Go Engineer ${testTimestamp}`,
        description: "Design high throughput distributed message processing systems.",
        skills: ["Go", "Distributed Systems", "Kubernetes"],
        location: "Austin, TX",
        employmentType: "full-time",
        workplaceType: "hybrid",
        salaryRange: { min: 160000, max: 210000, currency: "USD", period: "yearly" },
        status: "published",
      },
      recToken
    );
    assert(job1Res.status === 201, "First job opening created by recruiter");
    const job1Id = job1Res.body.data._id;

    const job2Res = await request(
      "/jobs",
      "POST",
      {
        title: `Lead Frontend Architect ${testTimestamp}`,
        description: "Architect Next.js and React enterprise portals.",
        skills: ["React", "TypeScript", "Next.js"],
        location: "Remote",
        employmentType: "full-time",
        workplaceType: "remote",
        salaryRange: { min: 140000, max: 180000, currency: "USD", period: "yearly" },
        status: "published",
      },
      recToken
    );
    assert(job2Res.status === 201, "Second job opening created by recruiter");

    // Candidate Saves Job 1
    const saveJobRes = await request(`/saved-jobs/${job1Id}`, "POST", null, candToken);
    assert(saveJobRes.status === 201, "Candidate saved job 1");

    // Candidate Applies to Job 1
    const applyRes = await request(
      "/applications",
      "POST",
      {
        jobId: job1Id,
        coverLetter: "Excited to bring 8+ years of high-scale backend experience.",
        useProfileResume: true,
      },
      candToken
    );
    assert(applyRes.status === 201, "Candidate applied to Job 1");
    const appId = applyRes.body.data._id;

    // Recruiter Shortlists Application
    const updateAppRes = await request(
      `/applications/${appId}/status`,
      "PATCH",
      {
        status: "Shortlisted",
        note: "Candidate has strong Go and Kubernetes track record.",
      },
      recToken
    );
    assert(updateAppRes.status === 200, "Recruiter shortlisted candidate application");

    const candidateUserId = candRes.body.data.user._id || candRes.body.data.user.id;
    const inviteRes = await request(
      "/invitations",
      "POST",
      {
        candidateId: candidateUserId,
        jobId: job2Res.body.data._id,
        message: "Your profile caught our attention for our Frontend Lead opening!",
      },
      recToken
    );
    assert(inviteRes.status === 201, "Recruiter invited candidate to Job 2");

    console.log("\n--- TEST GROUP 1: CANDIDATE DASHBOARD ---");
    const candDashRes = await request("/candidates/dashboard", "GET", null, candToken);
    assert(candDashRes.status === 200 && candDashRes.body.success, "Candidate can access /candidates/dashboard");
    assert(candDashRes.body.data.profile !== undefined, "Dashboard contains candidate profile snapshot");
    assert(candDashRes.body.data.stats.totalApplications >= 1, "Candidate stats reflect totalApplications >= 1");
    assert(candDashRes.body.data.stats.shortlistedApplications >= 1, "Candidate stats reflect shortlistedApplications >= 1");
    assert(candDashRes.body.data.stats.savedJobsCount >= 1, "Candidate stats reflect savedJobsCount >= 1");
    assert(candDashRes.body.data.stats.invitationsCount >= 1, "Candidate stats reflect active invitations count >= 1");
    assert(Array.isArray(candDashRes.body.data.recommendedJobs), "Dashboard provides recommendedJobs array");
    assert(Array.isArray(candDashRes.body.data.recentApplications), "Dashboard provides recentApplications array");
    assert(Array.isArray(candDashRes.body.data.recentInvitations), "Dashboard provides recentInvitations array");

    console.log("\n--- TEST GROUP 2: RECRUITER DASHBOARD ---");
    const recDashRes = await request("/recruiters/dashboard", "GET", null, recToken);
    assert(recDashRes.status === 200 && recDashRes.body.success, "Recruiter can access /recruiters/dashboard");
    assert(recDashRes.body.data.profile !== undefined, "Recruiter dashboard contains profile snapshot");
    assert(recDashRes.body.data.stats.totalJobs >= 2, "Recruiter stats reflect totalJobs >= 2");
    assert(recDashRes.body.data.stats.activeJobs >= 2, "Recruiter stats reflect activeJobs >= 2");
    assert(recDashRes.body.data.stats.totalApplications >= 1, "Recruiter stats reflect totalApplications >= 1");
    assert(recDashRes.body.data.stats.shortlistedApplications >= 1, "Recruiter stats reflect shortlistedApplications >= 1");
    assert(recDashRes.body.data.stats.totalInvitations >= 1, "Recruiter stats reflect totalInvitations >= 1");
    assert(Array.isArray(recDashRes.body.data.recentApplications), "Recruiter dashboard provides recentApplications array");
    assert(Array.isArray(recDashRes.body.data.recentJobs), "Recruiter dashboard provides recentJobs array");
    assert(Array.isArray(recDashRes.body.data.recentInvitations), "Recruiter dashboard provides recentInvitations array");

    console.log("\n--- TEST GROUP 3: EMPLOYER DASHBOARD & RECRUITER MANAGEMENT ---");
    const empDashRes = await request("/companies/dashboard", "GET", null, empToken);
    assert(empDashRes.status === 200 && empDashRes.body.success, "Employer can access /companies/dashboard");
    assert(empDashRes.body.data.company !== undefined, "Employer dashboard contains company brand snapshot");
    assert(empDashRes.body.data.stats.totalJobs >= 2, "Employer stats reflect totalJobs >= 2");
    assert(empDashRes.body.data.stats.totalApplications >= 1, "Employer stats reflect totalApplications >= 1");
    assert(empDashRes.body.data.stats.shortlistedCount >= 1, "Employer stats reflect shortlistedCount >= 1");
    assert(empDashRes.body.data.stats.affiliatedRecruitersCount >= 1, "Employer stats reflect affiliatedRecruitersCount >= 1");
    assert(Array.isArray(empDashRes.body.data.recruiters), "Employer dashboard provides recruiters array");
    assert(Array.isArray(empDashRes.body.data.recentApplications), "Employer dashboard provides recentApplications array");

    // Employer Lists Affiliated Recruiters
    const getRecsRes = await request("/companies/my/recruiters", "GET", null, empToken);
    assert(getRecsRes.status === 200 && getRecsRes.body.data.recruiters.length >= 1, "Employer can list all authorized recruiters");

    // Employer Revokes Recruiter Authorization
    const revokeRecRes = await request(`/companies/my/recruiters/${recruiterId}`, "DELETE", null, empToken);
    assert(revokeRecRes.status === 200 && revokeRecRes.body.success, "Employer can revoke recruiter authorization");

    // Verify Recruiter has been dissociated
    const getRecsAfterRes = await request("/companies/my/recruiters", "GET", null, empToken);
    assert(getRecsAfterRes.body.data.recruiters.length === 0, "Revoked recruiter is no longer in authorized list");

    console.log("\n--- TEST GROUP 4: CROSS-ROLE RBAC SECURITY AUDIT ---");
    // Candidate cannot access Recruiter dashboard
    const candAccessRecDash = await request("/recruiters/dashboard", "GET", null, candToken);
    assert(candAccessRecDash.status === 403, "Security: Candidate forbidden from accessing recruiter dashboard (403)");

    // Candidate cannot access Employer dashboard
    const candAccessEmpDash = await request("/companies/dashboard", "GET", null, candToken);
    assert(candAccessEmpDash.status === 403, "Security: Candidate forbidden from accessing employer dashboard (403)");

    // Recruiter cannot access Employer dashboard
    const recAccessEmpDash = await request("/companies/dashboard", "GET", null, recToken);
    assert(recAccessEmpDash.status === 403, "Security: Recruiter forbidden from accessing employer dashboard (403)");

    // Recruiter cannot access Candidate dashboard
    const recAccessCandDash = await request("/candidates/dashboard", "GET", null, recToken);
    assert(recAccessCandDash.status === 403, "Security: Recruiter forbidden from accessing candidate dashboard (403)");

    // Candidate cannot revoke company recruiter
    const candRevokeRec = await request(`/companies/my/recruiters/${recruiterId}`, "DELETE", null, candToken);
    assert(candRevokeRec.status === 403, "Security: Candidate forbidden from revoking recruiter (403)");

  } catch (error) {
    console.error("Test execution threw exception:", error);
    failed++;
  }

  console.log("\n==================================================");
  console.log(`📊 STAGE 3 TEST SUMMARY:`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runStage3Tests();
