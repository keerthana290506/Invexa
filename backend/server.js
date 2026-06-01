const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

// ================= ROUTES =================
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const salesRoutes = require("./routes/sales"); // ✅ YES, INCLUDED
const stockRoutes = require("./routes/stock");
const dashboardRoutes = require("./routes/dashboard");
const categoryRoutes = require("./routes/category");

// ================= CONFIG =================
dotenv.config();

/* ================= DATABASE ================= */
connectDB();

/* ================= APP INIT ================= */
const app = express();

/* ================= MIDDLEWARE ================= */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

/* ================= TEST ROUTE ================= */
app.get("/", (req, res) => {
  res.send("Invex Backend Running 🚀");
});

/* ================= API ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes); // ✅ SALES ROUTE ADDED
app.use("/api/stock", stockRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/categories", categoryRoutes);

/* ================= HTTP SERVER ================= */
const server = http.createServer(app);

/* ================= SOCKET SETUP ================= */
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://invexa-1-1.onrender.com/api"
    ],
    methods: ["GET", "POST"],
  },
});

/* make io available in controllers */
app.set("io", io);

/* ================= SOCKET EVENTS ================= */
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});