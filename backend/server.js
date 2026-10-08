require("dotenv").config({
  path: require("path").join(__dirname, ".env"),
  override: true,
});
const dns = require("node:dns");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const expenseRoutes = require("./routes/expenseRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/expenses", expenseRoutes);
app.use("/", authRoutes);

if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is not defined. Add it to backend/.env");
}

const PORT = process.env.PORT || 5000;
const dnsServers = (process.env.DNS_SERVERS || "")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);

if (dnsServers.length > 0) {
  dns.setServers(dnsServers);
}

const startServer = async () => {
  const mongoUri = (process.env.MONGO_URI || "")
    .trim()
    .replace(/^["']|["']$/g, "");

  if (!mongoUri) {
    throw new Error("MongoDB URI is missing. Set MONGO_URI in backend/.env");
  }

  if (!/^mongodb(?:\+srv)?:\/\//.test(mongoUri)) {
    throw new Error("MongoDB URI must start with mongodb:// or mongodb+srv://");
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exitCode = 1;
  }
};

startServer().catch((error) => {
  console.error("Unable to start server:", error.message);
  process.exit(1);
});