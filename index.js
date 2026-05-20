import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import userRoute from "./routes/userRoute.js";
import cookieParser from "cookie-parser";
import logger from "./middleware/logger.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import { app, server } from "./SocketIO/server.js";
import adminRoutes from './routes/adminRoutes.js';
dotenv.config();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

const PORT = process.env.PORT || 5001;
const URl = process.env.MONGO_URI;

try {
  mongoose.connect(URl);
  console.log(" Database connected ");
} catch (error) {
  console.log(error);
}

app.use(logger);

app.use("/api", userRoute);
app.use("/api/messages", MessageRoutes);
app.use('/api/admin', adminRoutes);

server.listen(PORT, () => {
  console.log(` Server running on localhost ${PORT} `);
});
