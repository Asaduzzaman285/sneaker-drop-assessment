import { useEffect } from "react";
import { io } from "socket.io-client";

let socket;

export const useSocket = (onStockUpdate, onPurchaseUpdate) => {
  useEffect(() => {
    socket = io({
      transports: ["polling"], // Force long-polling for Vercel Serverless stability
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => console.log("⚡ Connected to Socket.io"));

    socket.on("stock_update", (data) => onStockUpdate(data));
    socket.on("purchase_update", (data) => onPurchaseUpdate(data));

    return () => socket.disconnect();
  }, []);
};
