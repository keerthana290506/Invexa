import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/* ================= REQUEST INTERCEPTOR ================= */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("invexa_token");

    
    console.log("➡️ API URL:", config.url);
    console.log("🔑 TOKEN:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      "📦 FINAL AUTH HEADER:",
      config.headers.Authorization
    );

    return config;
  },
  (error) => {
    console.error("REQUEST ERROR:", error);
    return Promise.reject(error);
  }
);

/* ================= RESPONSE INTERCEPTOR ================= */
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(" RESPONSE:", response);

    // IMPORTANT
    return response.data;
  },
  (error) => {
    console.error("FULL API ERROR:", error);

    const status = error.response?.status;

    console.error("STATUS:", status);
    console.error("RESPONSE DATA:", error.response?.data);

    // 🚨 TEMPORARY: disable auto logout for debugging
    // if (status === 401) {
    //   localStorage.removeItem("invexa_token");
    //   window.location.href = "/login";
    // }

    return Promise.reject(error);
  }
);

export default axiosInstance;