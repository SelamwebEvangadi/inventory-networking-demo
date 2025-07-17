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

// 🔍 Global middleware to log every request with IP, Host, Method, and Path
app.use((req, res, next) => {
  const ip = req.socket.remoteAddress;
  const host = req.headers.host;
  const route = req.originalUrl;
  const method = req.method;
  console.log(`🔎 ${method} ${route} from ${ip} via ${host}`);
  next();
});

// ✅ Route: POST /submit
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

// ✅ Route: GET /list
app.get("/list", (req, res) => {
  db.query("SELECT item_name, quantity FROM inventory", (err, results) => {
    if (err) {
      console.error("❌ Error fetching inventory:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.status(200).json(results);
  });
});

app.delete("/delete", (req, res) => {
  const { item_name } = req.body;

  if (!item_name) {
    return res.status(400).json({ error: "Missing item_name in request body" });
  }

  db.query(
    "DELETE FROM inventory WHERE item_name = ?",
    [item_name],
    (err, result) => {
      if (err) {
        console.error("❌ Error deleting item:", err);
        return res.status(500).json({ error: "Failed to delete item" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: `Item '${item_name}' not found` });
      }

      console.log(`🗑️ Deleted item: ${item_name}`);
      res.json({ message: `✅ Item '${item_name}' deleted successfully` });
    }
  );
});

// ✅ Route: GET /health
app.get("/health", (req, res) => {
  console.log(`🌡️ Health check from: ${req.socket.remoteAddress}`);
  res.json({ status: "Backend is alive 🔥" });
});

// ✅ Serve static frontend (if any)
app.use(express.static(path.join(__dirname, "../public")));

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

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () =>
  console.log(
    `🚀 Server running at http://${
      process.env.EC2_PUBLIC_IP || "localhost"
    }:${port}`
  )
);
