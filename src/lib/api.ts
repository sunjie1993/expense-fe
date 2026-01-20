import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (globalThis.window !== undefined) {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && globalThis.window !== undefined) {
      localStorage.removeItem("auth_token");
      globalThis.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// SWR fetcher for authenticated requests
export const fetcher = async (url: string) => {
  const response = await api.get(url);
  return response.data;
};
