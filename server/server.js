const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const measurementRoutes = require("./routes/measurements");
const diaryRoutes = require("./routes/diary");
const labReportRoutes = require("./routes/labReports");
const doctorReportRoutes = require("./routes/doctorReports");
const aiRoutes = require("./routes/ai");
const newsRoutes = require("./routes/news");
const appointmentRoutes = require("./routes/appointments");
const referenceRoutes = require("./routes/reference");
const { startCronJob } = require("./jobs/newsFetcher");

const app = express();
dotenv.config();

// Start background jobs
if (process.env.NODE_ENV !== 'test') {
  startCronJob();
}

// Increase payload limit to 50mb
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Debug Middleware: Log all requests
app.use((req, res, next) => {
  console.log(`[DEBUG] Received Request: ${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/lifedoc")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Could not connect to MongoDB", err));
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/lab-reports", labReportRoutes);
app.use("/api/doctor-reports", doctorReportRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/upload", require("./routes/upload"));

app.use("/api/appointments", appointmentRoutes);
app.use("/api/reference", referenceRoutes);

// 404 Handler - If no route matched
app.use((req, res, next) => {
  console.log(`[DEBUG] 404 - Route Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Route not found", path: req.url, method: req.method });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ERROR] Server Error:', err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

const PORT = process.env.SERVER_PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`The server is running on http://localhost:${PORT}`);
    console.log(`Routes registered: /api/doctor-reports, /api/upload, etc.`);
  });
}

module.exports = app;