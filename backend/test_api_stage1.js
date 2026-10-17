/**
 * Automated Test Suite for Stage 1: Job Portal
 * Tests all requirements:
 * 1. User Registration for all 3 roles (Candidate, Recruiter, Employer)
 * 2. Login & JWT authentication (Access & Refresh tokens)
 * 3. Token refresh mechanism
 * 4. Role-based access control & permission enforcement (403 tests)
 * 5. Input validation & error response format
 * 6. Profile retrieval & updating for Candidate, Recruiter, Employer
 * 7. Logout & token revocation
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

const runAllTests = async () => {
  console.log("=================================================");
  console.log("🧪 STARTING STAGE 1 AUTOMATED INTEGRATION TESTS");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = "") => {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${details}`);
      failed++;
    }
  };

  const timestamp = Date.now();
  const candidateEmail = `cand_${timestamp}@example.com`;
  const recruiterEmail = `rec_${timestamp}@example.com`;
  const employerEmail = `emp_${timestamp}@example.com`;
  const password = "Password@123";

  let candidateToken = null;
  let candidateRefreshToken = null;
  let recruiterToken = null;
  let employerToken = null;

  try {
    // 1. Validation Test: Missing Fields
    console.log("\n--- TEST GROUP 1: INPUT VALIDATION & ERROR FORMAT ---");
    const valRes = await request("/auth/register", "POST", { email: candidateEmail });
    assert(
      valRes.status === 400 && valRes.data.success === false && Array.isArray(valRes.data.error),
      "Register validates required fields and returns 400 with missing fields array",
      JSON.stringify(valRes.data)
    );

    // 2. Validation Test: Invalid Role
    const roleValRes = await request("/auth/register", "POST", {
      name: "Bad Role User",
      email: `badrole_${timestamp}@example.com`,
      password,
      role: "superadmin_invalid",
    });
    assert(
      roleValRes.status === 400 && roleValRes.data.error === "INVALID_ROLE",
      "Register rejects unsupported roles",
      JSON.stringify(roleValRes.data)
    );

    // 3. Candidate Registration
    console.log("\n--- TEST GROUP 2: ROLE REGISTRATION & AUTHENTICATION ---");
    const candReg = await request("/auth/register", "POST", {
      name: "Alex Johnson",
      email: candidateEmail,
      password,
      role: "candidate",
      phone: "+1 555-0101",
    });

    assert(
      candReg.status === 201 &&
        candReg.data.success === true &&
        candReg.data.data.user.role === "candidate" &&
        Boolean(candReg.data.data.accessToken),
      "Register candidate user returns 201, user object, and JWT tokens",
      JSON.stringify(candReg.data)
    );

    candidateToken = candReg.data.data.accessToken;
    candidateRefreshToken = candReg.data.data.refreshToken;

    // 4. Duplicate Email Validation
    const dupReg = await request("/auth/register", "POST", {
      name: "Alex Duplicate",
      email: candidateEmail,
      password,
      role: "candidate",
    });
    assert(
      dupReg.status === 400 && dupReg.data.error === "EMAIL_ALREADY_EXISTS",
      "Duplicate email registration is blocked with 400 status",
      JSON.stringify(dupReg.data)
    );

    // 5. Recruiter Registration
    const recReg = await request("/auth/register", "POST", {
      name: "Sarah Recruiter",
      email: recruiterEmail,
      password,
      role: "recruiter",
      phone: "+1 555-0202",
      companyName: "Talent Source International",
    });
    assert(
      recReg.status === 201 && recReg.data.data.user.role === "recruiter",
      "Register recruiter user returns 201 and recruiter role",
      JSON.stringify(recReg.data)
    );
    recruiterToken = recReg.data.data.accessToken;

    // 6. Employer Registration
    const empReg = await request("/auth/register", "POST", {
      name: "Elena Employer",
      email: employerEmail,
      password,
      role: "employer",
      companyName: "Acme Cloud Innovations",
    });
    assert(
      empReg.status === 201 && empReg.data.data.user.role === "employer",
      "Register employer user returns 201 and employer role",
      JSON.stringify(empReg.data)
    );
    employerToken = empReg.data.data.accessToken;

    // 7. Login with valid credentials
    console.log("\n--- TEST GROUP 3: LOGIN & TOKEN VERIFICATION ---");
    const loginRes = await request("/auth/login", "POST", {
      email: candidateEmail,
      password,
    });
    assert(
      loginRes.status === 200 &&
        loginRes.data.success === true &&
        loginRes.data.data.user.email === candidateEmail &&
        Boolean(loginRes.data.data.accessToken),
      "Login candidate succeeds with correct credentials",
      JSON.stringify(loginRes.data)
    );
    if (loginRes.data?.data?.refreshToken) {
      candidateRefreshToken = loginRes.data.data.refreshToken;
    }

    // 8. Login with invalid password
    const badLogin = await request("/auth/login", "POST", {
      email: candidateEmail,
      password: "wrongpassword123",
    });
    assert(
      badLogin.status === 401 && badLogin.data.error === "INVALID_CREDENTIALS",
      "Login fails with 401 when password is wrong",
      JSON.stringify(badLogin.data)
    );

    // 9. Token Refresh
    console.log("\n--- TEST GROUP 4: TOKEN REFRESH & SESSION ---");
    const refreshRes = await request("/auth/refresh-token", "POST", {
      refreshToken: candidateRefreshToken,
    });
    assert(
      refreshRes.status === 200 &&
        refreshRes.data.success === true &&
        Boolean(refreshRes.data.data.accessToken),
      "Refresh token endpoint generates new valid access token",
      JSON.stringify(refreshRes.data)
    );
    if (refreshRes.data.data?.accessToken) {
      candidateToken = refreshRes.data.data.accessToken;
    }

    // 10. Get Current User (/auth/me)
    const meRes = await request("/auth/me", "GET", null, candidateToken);
    assert(
      meRes.status === 200 &&
        meRes.data.data.user.email === candidateEmail &&
        Boolean(meRes.data.data.profile),
      "GET /auth/me returns authenticated user and auto-initialized profile",
      JSON.stringify(meRes.data)
    );

    // 11. Role-Based Access Control (403 Tests)
    console.log("\n--- TEST GROUP 5: ROLE-BASED ACCESS CONTROL (RBAC) ---");
    // Candidate trying to access Recruiter private route
    const candOnRec = await request("/recruiters/me", "GET", null, candidateToken);
    assert(
      candOnRec.status === 403 && candOnRec.data.error === "INSUFFICIENT_PERMISSIONS",
      "Candidate blocked with 403 from accessing Recruiter endpoint",
      JSON.stringify(candOnRec.data)
    );

    // Recruiter trying to update Employer company
    const recOnEmp = await request(
      "/companies/my",
      "PUT",
      { companyName: "Hacked Company" },
      recruiterToken
    );
    assert(
      recOnEmp.status === 403 && recOnEmp.data.error === "INSUFFICIENT_PERMISSIONS",
      "Recruiter blocked with 403 from updating Employer company profile",
      JSON.stringify(recOnEmp.data)
    );

    // Employer trying to update Candidate profile
    const empOnCand = await request(
      "/candidates/me",
      "PUT",
      { headline: "Hacked Headline" },
      employerToken
    );
    assert(
      empOnCand.status === 403 && empOnCand.data.error === "INSUFFICIENT_PERMISSIONS",
      "Employer blocked with 403 from updating Candidate profile",
      JSON.stringify(empOnCand.data)
    );

    // 12. Candidate Profile Update
    console.log("\n--- TEST GROUP 6: PROFILE MANAGEMENT (CRUD) ---");
    const updateCand = await request(
      "/candidates/me",
      "PUT",
      {
        headline: "Senior Full-Stack Engineer | MERN & Cloud",
        currentLocation: "San Francisco, CA",
        summary: "Passionate engineer with 6+ years of building web applications.",
        skills: ["React", "Node.js", "Express", "MongoDB", "Docker"],
        education: [
          {
            institution: "UC Berkeley",
            degree: "B.S.",
            fieldOfStudy: "Computer Science",
            startYear: 2017,
            endYear: 2021,
            grade: "3.9 GPA",
          },
        ],
        experience: [
          {
            company: "TechScale LLC",
            title: "Software Engineer",
            location: "San Francisco, CA",
            startDate: "2021",
            endDate: "Present",
            currentlyWorking: true,
            description: "Developed scalable RESTful APIs and UI components.",
          },
        ],
        projects: [
          {
            title: "Realtime Analytics Dashboard",
            description: "Microservices dashboard with WebSockets",
            technologies: ["React", "Node.js"],
            liveUrl: "https://example.com/demo",
            githubUrl: "https://github.com/alex/dashboard",
          },
        ],
        preferredRoles: ["Full-Stack Engineer", "Senior Backend Developer"],
        preferredLocations: ["San Francisco, CA", "Remote"],
        expectedSalary: {
          currency: "USD",
          min: 130000,
          max: 160000,
          period: "yearly",
        },
      },
      candidateToken
    );

    assert(
      updateCand.status === 200 &&
        updateCand.data.success === true &&
        updateCand.data.data.headline === "Senior Full-Stack Engineer | MERN & Cloud" &&
        updateCand.data.data.skills.length === 5 &&
        updateCand.data.data.completionPercentage > 50,
      "Candidate profile updated successfully with education, experience, and skills",
      JSON.stringify(updateCand.data)
    );

    // 13. Employer Company Profile Update
    const updateComp = await request(
      "/companies/my",
      "PUT",
      {
        companyName: "Acme Cloud Innovations Corp",
        industry: "Software & Cloud Services",
        companySize: "51-200 employees",
        website: "https://acmecloudinnovations.io",
        location: "Seattle, WA",
        description: "Leading enterprise cloud automation and developer productivity suite.",
        foundedYear: 2019,
        socialLinks: {
          linkedin: "https://linkedin.com/company/acme-cloud",
          twitter: "https://x.com/acmecloud",
          github: "https://github.com/acme-cloud",
        },
      },
      employerToken
    );

    assert(
      updateComp.status === 200 &&
        updateComp.data.data.companyName === "Acme Cloud Innovations Corp" &&
        updateComp.data.data.foundedYear === 2019,
      "Employer updates company branding, industry, location, and social links",
      JSON.stringify(updateComp.data)
    );

    const companyId = updateComp.data.data._id;

    // 14. Recruiter Profile Update & Company Link
    const updateRec = await request(
      "/recruiters/me",
      "PUT",
      {
        jobTitle: "Principal Talent Acquisition Partner",
        department: "Engineering Recruitment",
        contactPhone: "+1 555-987-6543",
        company: companyId,
        professionalBio: "Sourcing world-class distributed systems and frontend architects.",
        linkedinUrl: "https://linkedin.com/in/sarah-recruiter-talent",
      },
      recruiterToken
    );

    assert(
      updateRec.status === 200 &&
        updateRec.data.data.jobTitle === "Principal Talent Acquisition Partner" &&
        updateRec.data.data.companyName === "Acme Cloud Innovations Corp",
      "Recruiter links to employer company and updates job title & bio",
      JSON.stringify(updateRec.data)
    );

    // 15. Public Companies List Search
    console.log("\n--- TEST GROUP 7: DIRECTORY & SEARCH ---");
    const compSearch = await request("/companies?search=Acme");
    assert(
      compSearch.status === 200 &&
        compSearch.data.data.companies.some((c) => c.companyName.includes("Acme")),
      "GET /companies returns registered companies directory matching search query",
      JSON.stringify(compSearch.data)
    );

    // 16. Logout & Token Invalidation
    console.log("\n--- TEST GROUP 8: LOGOUT & TOKEN REVOCATION ---");
    const logoutRes = await request("/auth/logout", "POST", null, candidateToken);
    assert(
      logoutRes.status === 200 && logoutRes.data.success === true,
      "POST /auth/logout invalidates session cleanly",
      JSON.stringify(logoutRes.data)
    );

    // Refresh token after logout should fail
    const revokedRefresh = await request("/auth/refresh-token", "POST", {
      refreshToken: candidateRefreshToken,
    });
    assert(
      revokedRefresh.status === 401 && revokedRefresh.data.error === "INVALID_REFRESH_TOKEN",
      "Revoked refresh token is rejected after logout",
      JSON.stringify(revokedRefresh.data)
    );

  } catch (err) {
    console.error("Test execution threw exception:", err);
    failed++;
  }

  console.log("\n=================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runAllTests();
