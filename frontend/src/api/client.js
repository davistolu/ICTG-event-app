import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const client = axios.create({
  baseURL,
  timeout: 10000,
});

// Attach token from localStorage (set after admin login) to every request
client.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore localStorage errors in unusual environments
  }
  return config;
});

// Normalizes every failure into a plain Error with a message the UI can show
// directly, whether it came from the API's JSON error body, a network drop,
// or a timeout. Also clears invalid/expired tokens on 401.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem("admin_token");
      } catch (e) {
        // ignore localStorage error in constrained environment
      }
    }

    const message =
      error.response?.data?.message ||
      (error.code === "ECONNABORTED"
        ? "The request took too long to respond."
        : "Could not reach the server. Check your connection and try again.");
    return Promise.reject(new Error(message));
  }
);

export default client;
