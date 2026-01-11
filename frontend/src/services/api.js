import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const getDrops = () => API.get("/drops");
export const reserveDrop = (drop_id, user_id) =>
  API.post(`/drops/${drop_id}/reserve`, { user_id });
export const completePurchase = (drop_id, user_id) =>
  API.post(`/purchase/${drop_id}`, { user_id });

export const createDrop = (data) => API.post("/drops", data);
