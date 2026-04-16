require("dotenv").config();
const express = require("express");
const { connectRabbit } = require("./rabbit");
const cors = require('cors');
const key = require("./config/key");


const http = require("http");
let server = "";
const fs = require("fs");
const https = require("https");


const authRoutes = require("./routes/auth.routes");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

var corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    // Allow exact whitelist matches
    if (key.WHITELISTURL.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // Allow ngrok tunnels (dev/testing only)
    if (origin.match(/https?:\/\/[a-zA-Z0-9-]+\.ngrok(-free)?\.app$/)) {
      return callback(null, true);
    }

    console.log("CORS blocked for:", origin);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "arken-backend", timestamp: new Date().toISOString() });
});

app.use("/", authRoutes);

// Global error handler — catches unhandled controller errors (e.g. RPC timeout)
// and returns JSON instead of Express's default HTML 500 page
app.use((err, req, res, next) => {
  console.error("Unhandled route error:", err.message);
  res.status(500).json({ status: false, message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 4000;

if (process.env.USE_SSL === "true") {
  const options = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH),
      requestCert: false
  };
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}

async function startServer(attempt = 1) {
  try {
    await connectRabbit();
    server.listen(PORT, () => {
      console.log(`✅ Producer running on port ${PORT}`);
    });
  } catch (err) {
    const delay = Math.min(5000 * attempt, 30000);
    console.error(`RabbitMQ not ready (attempt ${attempt}): ${err.message} — retrying in ${delay / 1000}s`);
    setTimeout(() => startServer(attempt + 1), delay);
  }
}

startServer();
