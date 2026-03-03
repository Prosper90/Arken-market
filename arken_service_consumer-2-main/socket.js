// backend/socket.js
const { Server } = require("socket.io");

let io;
function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: [
        "https://arken.blfdemo.online",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on("join_user", (telegramId) => {
    socket.join(telegramId);
    console.log(`User ${telegramId} joined room`);
  });
  });
  
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
}

module.exports = { initSocket, getIO };
