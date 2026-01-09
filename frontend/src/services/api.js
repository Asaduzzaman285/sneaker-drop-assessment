import axios from "axios";

const API = axios.create({
  baseURL: "/api", // Relative path to use proxy (dev) or vercel rewrite (prod)
});

export const getDrops = () => API.get("/drops");
export const reserveDrop = (drop_id, user_id) =>
  API.post(`/drops/${drop_id}/reserve`, { user_id });
export const completePurchase = (drop_id, user_id) =>
  API.post(`/purchase/${drop_id}`, { user_id });

export const createDrop = (data) => API.post("/drops", data);
