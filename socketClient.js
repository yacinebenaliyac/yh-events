import { io } from "socket.io-client";

let socket;

export const connectSocket = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  if (socket?.connected) return socket;

  socket = io("/", {
    auth: { token },
    transports: ["websocket"],
  });

  socket.on("connect", () => console.log("🔌 Socket connecté"));
  socket.on("connect_error", (e) => console.warn("Socket err:", e.message));
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};