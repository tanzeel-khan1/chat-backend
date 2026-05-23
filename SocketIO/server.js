import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://chat-steel-eta.vercel.app",
  "http://localhost:4001",
  "http://localhost:5173",
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// userId (string) => socketId
const users = {};

export const getReceiverSocketId = (receiverId) => {
  if (!receiverId) return null;
  return users[String(receiverId)] || null;
};

export const emitToUser = (userId, event, payload) => {
  const socketId = getReceiverSocketId(userId);
  if (socketId) {
    io.to(socketId).emit(event, payload);
  }
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId
    ? String(socket.handshake.query.userId)
    : null;

  console.log("Socket connected:", socket.id, "userId:", userId);

  if (userId) {
    users[userId] = socket.id;
    socket.join(userId);
  }

  io.emit("getOnlineUsers", Object.keys(users));

  socket.on("disconnect", () => {
    if (userId && users[userId] === socket.id) {
      delete users[userId];
    }
    io.emit("getOnlineUsers", Object.keys(users));
  });
});

// 🔹 IMPORTANT EXPORTS
export { app, io, server };
