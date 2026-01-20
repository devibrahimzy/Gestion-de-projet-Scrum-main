import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUnauthorized = error.response?.status === 401;
    const isOnLoginPage = window.location.pathname.startsWith("/auth/login");

    if (isUnauthorized) {
      localStorage.removeItem("authToken");

      // 🚫 Don't redirect if we're already on login page
      if (!isOnLoginPage) {
        console.log("Unauthorized! Redirecting to login page.");
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);


export default api;
