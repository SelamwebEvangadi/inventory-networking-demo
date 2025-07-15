// backend/server.js

require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public"))); // Serves frontend

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
console.log("🔐 ENV:", process.env.DB_USER, process.env.DB_PASSWORD);

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection error:", err);
    process.exit(1);
  }
  console.log(`[INFO] Connected to DB @ ${new Date().toISOString()}`);
});

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

app.get("/health", (req, res) => {
  res.json({ status: "Backend is alive 🔥" });
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () =>
  console.log(
    `🚀 Server running at http://${
      process.env.EC2_PUBLIC_IP || "localhost"
    }:${port}`
  )
);
