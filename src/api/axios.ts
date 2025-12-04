import axios, { type AxiosInstance } from "axios";
import { useAuthStore } from "@/store/useAuthStore";

// --- PERBAIKAN DI SINI ---
// Kita tulis langsung alamat Backend-nya agar tidak salah alamat lagi
const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:4000/api", // <--- PENTING! JANGAN UBAH INI
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err),
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
    }
    return Promise.reject(err);
  },
);

export default api;
