require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const loggerMiddleware = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-production-domain.com"]
        : ["http://localhost:3000", "https://web.telegram.org"],
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(loggerMiddleware);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Bingo Backend API",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
