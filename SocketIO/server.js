import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// 🔹 Socket.io init
const io = new Server(server, {
  cors: {
    origin: "https://chat-steel-eta.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 🔹 userId => socketId map
const users = {};

// ✅ SAME FILE se controller use karega
export const getReceiverSocketId = (receiverId) => {
  return users[receiverId];
};

// 🔹 Socket connection
io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  const userId = socket.handshake.query.userId;
  console.log("👉 userId from socket:", userId);

  if (userId) {
    users[userId] = socket.id;
  }

  // online users bhejo
  io.emit("getOnlineUsers", Object.keys(users));

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);

    if (userId) {
      delete users[userId];
      io.emit("getOnlineUsers", Object.keys(users));
    }
  });
});

// 🔹 IMPORTANT EXPORTS
export { app, io, server };
