import express from "express";
import { configDotenv } from "dotenv";
configDotenv();
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import authRoutes from './src/routes/auth.routes.js';
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;
// MongoDB connection
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("DB connected!"))
  .catch((err) => console.log("Error : ", err.message));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: [FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);


// Routes
app.use('/api/auth', authRoutes);



// Server start
app.listen(PORT, () => console.log("Server running on PORT : " + PORT));