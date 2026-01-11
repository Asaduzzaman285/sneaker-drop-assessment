import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;
if (!import.meta.env.VITE_API_URL) {
  throw new Error("Missing VITE_API_URL. Set it to your backend base URL, e.g. https://sneaker-drop-backend.vercel.app/api");
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
