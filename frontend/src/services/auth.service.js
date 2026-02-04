import api from "./api";

const authService = {
  // Register user
  register: async (userData) => {
    // userData matches backend expectation: 
    // { phoneNumber, password, role, fullName, email (optional), preferredLanguage (optional) }
    const response = await api.post("/auth/register", userData);
    if (response.data.data && response.data.data.token) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    // credentials: { phoneNumber, password }
    const response = await api.post("/auth/login", credentials);
    if (response.data.data && response.data.data.token) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
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
  }
};

export default authService;
