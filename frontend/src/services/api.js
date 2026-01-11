import axios from "axios";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const envApiUrl = import.meta.env.VITE_API_URL;
const baseURL = envApiUrl || (isLocal ? "/api" : undefined);
if (!envApiUrl) {
  if (isLocal) {
    console.warn("VITE_API_URL is missing. Using local '/api' fallback. Set VITE_API_URL to your backend base URL for production.");
  } else {
    console.error("Missing VITE_API_URL in production. Set it to your backend base URL, e.g. https://sneaker-drop-backend.vercel.app/api");
  }
}
const API = axios.create({
  baseURL,
});

export const getDrops = () => API.get("/drops");
export const reserveDrop = (drop_id, user_id) =>
  API.post(`/drops/${drop_id}/reserve`, { user_id });
export const completePurchase = (drop_id, user_id) =>
  API.post(`/purchase/${drop_id}`, { user_id });

export const createDrop = (data) => API.post("/drops", data);
