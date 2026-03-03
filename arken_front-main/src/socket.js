import { io } from "socket.io-client";

// When VITE_SOCKET_URL is empty, connect to the same origin so the
// Vite proxy can forward /socket.io/* to the market-service.
// This avoids mixed-content (HTTP ws:// from an HTTPS page) when using ngrok.
const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;

export const socket = io(socketUrl, {
  transports: ["websocket"]
});
