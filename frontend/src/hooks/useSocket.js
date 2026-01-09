import { useEffect } from "react";
import { io } from "socket.io-client";

let socket;

export const useSocket = (onStockUpdate, onPurchaseUpdate) => {
  useEffect(() => {
    socket = io(); // Connects to the same host/origin (proxy handles it)

    socket.on("connect", () => console.log("⚡ Connected to Socket.io"));

    socket.on("stock_update", (data) => onStockUpdate(data));
    socket.on("purchase_update", (data) => onPurchaseUpdate(data));

    return () => socket.disconnect();
  }, []);
};
