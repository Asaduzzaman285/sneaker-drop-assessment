import axios from "axios";

const baseURL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || "/api") : import.meta.env.VITE_API_URL;
if (!import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  console.error("Missing VITE_API_URL in production. Set it to your backend base URL, e.g. https:\/\/your-backend.example.com\/api");
}
const API = axios.create({
  baseURL: baseURL,
});

export const getDrops = () => API.get("/drops");
export const reserveDrop = (drop_id, user_id) =>
  API.post(`/drops/${drop_id}/reserve`, { user_id });
export const completePurchase = (drop_id, user_id) =>
  API.post(`/purchase/${drop_id}`, { user_id });

export const createDrop = (data) => API.post("/drops", data);
