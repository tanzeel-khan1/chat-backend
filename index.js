import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRoute from "./routes/userRoute.js";
import cookieParser from "cookie-parser";
import logger from "./middleware/logger.js";
import MessagesRoutes from "./routes/MessagesRoutes.js";
import pushRoute from "./routes/pushRoute.js";
import { app, server } from "./SocketIO/server.js";
import { getCorsOrigins, getBackendUrl } from "./config/urls.js";
app.use(express.json());
app.use(
  cors({
    origin: getCorsOrigins(),
    credentials: true,
  })
);
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
app.use("/api/messages", MessagesRoutes);
app.use("/api/push", pushRoute);

server.listen(PORT, () => {
  console.log(` Server running on port ${PORT} (${getBackendUrl()})`);
});
