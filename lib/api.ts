import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string; walletAddress: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

// Universities
export const universityApi = {
  list: () => api.get("/universities"),
  get: (id: string) => api.get(`/universities/${id}`),
  approve: (id: string) => api.patch(`/universities/${id}/approve`),
  removeAccreditation: (id: string) => api.delete(`/universities/${id}/accreditation`),
  stats: () => api.get("/universities/me/stats"),
};

// Diplomas
export const diplomaApi = {
  issue: (data: { studentWallet: string; studentName: string; degree: string; major?: string }) =>
    api.post("/diplomas", data),
  list: () => api.get("/diplomas"),
  revoke: (tokenId: string) => api.patch(`/diplomas/${tokenId}/revoke`),
  batch: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/diplomas/batch", form);
  },
};

// Verification (public)
export const verifyApi = {
  verify: (tokenId: string) => api.get(`/verify/${tokenId}`),
};
