import { useEffect } from "react";
import { io } from "socket.io-client";

export const useSocket = (onStockUpdate, onPurchaseUpdate) => {
  useEffect(() => {
    // In production (Vercel), we rely on the HTTP polling already in Dashboard.jsx.
    // Therefore, we do not establish a socket connection.
    if (import.meta.env.PROD) {
      console.log("In production, skipping socket connection. Using polling.");
      return;
    }

    // In development, connect to the socket for real-time updates.
    const VITE_SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

    const socket = io(VITE_SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("⚡ Socket connected for real-time updates:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected.");
    });

    socket.on("connect_error", (error) => {
      console.error("⚠️ Socket connection error:", error);
    });

    if (onStockUpdate) {
      socket.on("stock_update", onStockUpdate);
    }
    if (onPurchaseUpdate) {
      socket.on("purchase_update", onPurchaseUpdate);
    }

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.off("stock_update");
        socket.off("purchase_update");
        socket.disconnect();
      }
    };
  }, [onStockUpdate, onPurchaseUpdate]);
};
