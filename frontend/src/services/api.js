import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration & Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/register") &&
      !originalRequest.url.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        const storedRefreshToken = localStorage.getItem("refreshToken");
        if (!storedRefreshToken) {
          throw new Error("No refresh token available");
        }

        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken: storedRefreshToken },
          { withCredentials: true }
        );

        if (res.data && res.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;
          localStorage.setItem("accessToken", accessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-session-expired"));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/* =========================================================
   Service Methods
   ========================================================= */

// Auth Service
export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  refreshToken: (refreshToken) => api.post("/auth/refresh-token", { refreshToken }),
  updateAccount: (data) => api.put("/auth/account", data),
};

// Candidate Service
export const candidateService = {
  getDashboardData: () => api.get("/candidates/dashboard"),
  getMyProfile: () => api.get("/candidates/me"),
  updateMyProfile: (data) => api.put("/candidates/me", data),
  uploadResume: (formData) =>
    api.post("/candidates/me/resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteResume: () => api.delete("/candidates/me/resume"),
  uploadPhoto: (formData) =>
    api.post("/candidates/me/photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getCandidateById: (id) => api.get(`/candidates/${id}`),
  searchCandidates: (params) => api.get("/candidates/search", { params }),
  getCandidateDetails: (id) => api.get(`/candidates/detail/${id}`),
};

// Recruiter Service
export const recruiterService = {
  getDashboardData: () => api.get("/recruiters/dashboard"),
  getMyProfile: () => api.get("/recruiters/me"),
  updateMyProfile: (data) => api.put("/recruiters/me", data),
  uploadPhoto: (formData) =>
    api.post("/recruiters/me/photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getRecruiterById: (id) => api.get(`/recruiters/${id}`),
};

// Company Service
export const companyService = {
  getDashboardData: () => api.get("/companies/dashboard"),
  getMyCompany: () => api.get("/companies/my"),
  updateMyCompany: (data) => api.put("/companies/my", data),
  uploadLogo: (formData) =>
    api.post("/companies/my/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getAllCompanies: (params) => api.get("/companies", { params }),
  getCompanyById: (id) => api.get(`/companies/${id}`),
  getCompanyRecruiters: () => api.get("/companies/my/recruiters"),
  removeCompanyRecruiter: (recruiterId) => api.delete(`/companies/my/recruiters/${recruiterId}`),
};

// Job Service
export const jobService = {
  getAllJobs: (params) => api.get("/jobs", { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  getMyCompanyJobs: (params) => api.get("/jobs/company/my", { params }),
  createJob: (data) => api.post("/jobs", data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  changeJobStatus: (id, status) => api.patch(`/jobs/${id}/status`, { status }),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
};

// Saved Jobs Service
export const savedJobService = {
  getMySavedJobs: (params) => api.get("/saved-jobs", { params }),
  saveJob: (jobId) => api.post(`/saved-jobs/${jobId}`),
  unsaveJob: (jobId) => api.delete(`/saved-jobs/${jobId}`),
};

// Application Service
export const applicationService = {
  applyToJob: (payload) => {
    if (payload instanceof FormData) {
      return api.post("/applications", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return api.post("/applications", payload);
  },
  getMyApplications: (params) => api.get("/applications/me", { params }),
  withdrawApplication: (id) => api.patch(`/applications/${id}/withdraw`),
  getJobApplications: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
  getRecruiterAllApplications: (params) => api.get("/applications/recruiter/all", { params }),
  getApplicationById: (id) => api.get(`/applications/${id}`),
  updateApplicationStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
};

// Invitation Service
export const invitationService = {
  sendInvitation: (data) => api.post("/invitations", data),
  getSentInvitations: (params) => api.get("/invitations/sent", { params }),
  cancelInvitation: (id) => api.patch(`/invitations/${id}/cancel`),
  getMyInvitations: (params) => api.get("/invitations/me", { params }),
  respondToInvitation: (id, action) => api.patch(`/invitations/${id}/respond`, { action }),
};

// Notification Service
export const notificationService = {
  getMyNotifications: (params) => api.get("/notifications", { params }),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/notifications/read-all"),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export default api;
