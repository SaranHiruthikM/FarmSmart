import api from "./api";

const authService = {
  // Register user (now returns need for OTP)
  register: async (userData) => {
    // userData matches backend expectation: 
    // { phoneNumber, password, role, fullName, email (optional), preferredLanguage (optional) }
    const response = await api.post("/auth/register", userData);
    // Note: No token here anymore. Just status.
    return response.data;
  },

  // Login user (now returns need for OTP)
  login: async (credentials) => {
    // credentials: { phoneNumber, password }
    const response = await api.post("/auth/login", credentials);
    // Note: No token here anymore. Just status.
    return response.data;
  },

  // Verify OTP (Check code and get token)
  verify: async (verifyData) => {
    // verifyData: { contact, code }
    const response = await api.post("/auth/verify", verifyData);
    if (response.data.data && response.data.data.token) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Resend OTP
  resend: async (resendData) => {
    // resendData: { contact }
    const response = await api.post("/auth/resend", resendData);
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Get current user
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem("user"));
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Get profile from backend
  getProfile: async () => {
    const response = await api.get("/auth/me");
    if (response.data.data && response.data.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data.data.user;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.patch("/auth/profile", profileData);
    if (response.data.data && response.data.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data.data;
  }
};

export default authService;
