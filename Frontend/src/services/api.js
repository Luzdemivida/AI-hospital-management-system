import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5171/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach bearer token from localStorage when available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;