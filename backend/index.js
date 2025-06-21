import express from "express";
import { configDotenv } from "dotenv";
configDotenv();
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import authRoutes from './src/routes/auth.routes.js';
import desktopRoutes from './src/routes/desktop.routes.js';
import fileSystemRoutes from './src/routes/fileSystem.routes.js'; // ADD THIS LINE
import { initializeSystemApps } from './src/services/appService.services.js';
import { initializeUserFileSystem } from './src/services/fileSystem.services.js'; // ADD THIS LINE

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;

// MongoDB connection
mongoose
  .connect(MONGO_URL)
  .then(async () => {
    console.log("DB connected!");
    // Initialize system apps
    await initializeSystemApps();
  })
  .catch((err) => console.log("Error : ", err.message));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/desktop', desktopRoutes);
app.use('/api/filesystem', fileSystemRoutes); // ADD THIS LINE

// **NEW: Health check endpoint**
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Server start
app.listen(PORT, () => console.log("Server running on PORT : " + PORT));