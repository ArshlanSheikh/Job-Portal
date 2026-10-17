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
};

// Recruiter Service
export const recruiterService = {
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
  getMyCompany: () => api.get("/companies/my"),
  updateMyCompany: (data) => api.put("/companies/my", data),
  uploadLogo: (formData) =>
    api.post("/companies/my/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getAllCompanies: (params) => api.get("/companies", { params }),
  getCompanyById: (id) => api.get(`/companies/${id}`),
};

export default api;
