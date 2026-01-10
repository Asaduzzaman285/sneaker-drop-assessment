import { useEffect } from "react";
import { io } from "socket.io-client";

let socket;

export const useSocket = (onStockUpdate, onPurchaseUpdate) => {
  useEffect(() => {
    // Detect if we are on Vercel (Production) or Localhost
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    // Vercel = Polling (Stable)
    // Local/Docker = WebSockets (Fast/Standard)
    const socketOptions = isLocal
      ? { transports: ["websocket", "polling"] } // Prefer WebSocket locally
      : {
        transports: ["polling"],  // Force polling on Vercel
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      };

    socket = io(socketOptions);

    socket.on("connect", () => console.log("⚡ Connected to Socket.io"));

    socket.on("stock_update", (data) => onStockUpdate(data));
    socket.on("purchase_update", (data) => onPurchaseUpdate(data));

    return () => socket.disconnect();
  }, []);
};
