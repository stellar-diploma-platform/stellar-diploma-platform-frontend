import { create } from "zustand";
import { University } from "./types";

interface AuthState {
  university: University | null;
  token: string | null;
  setAuth: (university: University, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  university: null,
  token: null,
  setAuth: (university, token) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("university", JSON.stringify(university));
    set({ university, token });
  },
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("university");
    set({ university: null, token: null });
  },
  hydrate: () => {
    const token = localStorage.getItem("access_token");
    const raw = localStorage.getItem("university");
    if (token && raw) {
      set({ token, university: JSON.parse(raw) });
    }
  },
}));
