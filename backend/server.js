// backend/server.js

require("dotenv").config(); // Load environment variables

const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public"))); // Serve static frontend files

// MySQL connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
console.log("🔐 ENV:", process.env.DB_USER, process.env.DB_PASSWORD);

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection error:", err);
    process.exit(1); // Exit if DB connection fails
  }
  console.log("✅ Connected to MySQL!");
});

// POST route to handle inventory submissions
app.post("/submit", (req, res) => {
  const { item_name, quantity } = req.body;

  if (!item_name || typeof quantity !== "number") {
    return res.status(400).json({ error: "Invalid input data" });
  }

  console.log("📦 Incoming submission:", { item_name, quantity });

  db.query(
    "INSERT INTO inventory (item_name, quantity) VALUES (?, ?)",
    [item_name, quantity],
    (err) => {
      if (err) {
        console.error("❌ Database error:", err);
        return res.status(500).json({ error: "Failed to insert item" });
      }
      res.status(200).json({
        message: "✅ Item added successfully",
        item_name,
        quantity,
      });
    }
  );
});

// Optional health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "Backend is alive 🔥" });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`🚀 Server running on http://localhost:${port}`)
);
