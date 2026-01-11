import { useEffect } from "react";
import { io } from "socket.io-client";

let socket;

export const useSocket = (onStockUpdate, onPurchaseUpdate) => {
  useEffect(() => {
    // Detect if we are on Vercel (Production) or Localhost
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    // Prefer WebSocket locally, Polling on Vercel/Prod
    const socketOptions = isLocal
      ? { transports: ["websocket", "polling"] }
      : {
          transports: ["polling"],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        };

    // Resolve backend Socket.io URL via envs
    const envSocketUrl = import.meta.env.VITE_SOCKET_URL;
    const envApiUrl = import.meta.env.VITE_API_URL;
    const derivedSocketUrl = envApiUrl ? envApiUrl.replace(/\/api\/?$/, "") : undefined;

    const backendUrl = envSocketUrl || derivedSocketUrl || (isLocal ? "http://localhost:4000" : window.location.origin);
    socket = io(backendUrl, socketOptions);

    socket.on("connect", () => console.log("⚡ Connected to Socket.io"));
    socket.on("connect_error", (error) => console.error("⚠️ Socket connect error:", error));

    socket.on("stock_update", (data) => onStockUpdate(data));
    socket.on("purchase_update", (data) => onPurchaseUpdate(data));

    return () => socket.disconnect();
  }, []);
};
