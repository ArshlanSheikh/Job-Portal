import React, { createContext, useState, useEffect } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load current user profile on app start if token exists
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        if (response.data && response.data.success) {
          const { user: fetchedUser, profile: fetchedProfile } = response.data.data;
          setUser(fetchedUser);
          setProfile(fetchedProfile);
          localStorage.setItem("user", JSON.stringify(fetchedUser));
        }
      } catch (error) {
        console.error("Session verification failed:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    // Listen for global session expiry events
    const handleSessionExpired = () => {
      setUser(null);
      setProfile(null);
    };

    window.addEventListener("auth-session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth-session-expired", handleSessionExpired);
    };
  }, []);

  // Register function
  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.data && res.data.success) {
      const { user: newUser, accessToken, refreshToken } = res.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);

      // Fetch profile data
      try {
        const meRes = await authService.getMe();
        if (meRes.data && meRes.data.success) {
          setProfile(meRes.data.data.profile);
        }
      } catch (err) {
        console.error("Failed to load initial profile:", err);
      }
    }
    return res.data;
  };

  // Login function
  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.data && res.data.success) {
      const { user: loggedInUser, accessToken, refreshToken } = res.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      // Fetch full profile data
      try {
        const meRes = await authService.getMe();
        if (meRes.data && meRes.data.success) {
          setProfile(meRes.data.data.profile);
        }
      } catch (err) {
        console.error("Failed to load profile on login:", err);
      }
    }
    return res.data;
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn("Logout API returned error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
      setProfile(null);
    }
  };

  // Refresh current user and profile data
  const refreshUserData = async () => {
    try {
      const response = await authService.getMe();
      if (response.data && response.data.success) {
        const { user: freshUser, profile: freshProfile } = response.data.data;
        setUser(freshUser);
        setProfile(freshProfile);
        localStorage.setItem("user", JSON.stringify(freshUser));
        return { user: freshUser, profile: freshProfile };
      }
    } catch (err) {
      console.error("Error refreshing user data:", err);
    }
    return null;
  };

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const updateProfileState = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated: Boolean(user),
    register,
    login,
    logout,
    refreshUserData,
    updateUserState,
    updateProfileState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
