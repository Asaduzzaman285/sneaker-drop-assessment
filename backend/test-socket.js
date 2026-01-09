const { io } = require("socket.io-client");

const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("Connected to server:", socket.id);
});

socket.on("stock_update", (data) => {
  console.log("Stock Update:", data);
});

socket.on("purchase_update", (data) => {
  console.log("Purchase Update:", data);
});
