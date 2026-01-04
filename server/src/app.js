const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/taskRoutes");


const authRoutes = require("./routes/authRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); 

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("API is running");
});

module.exports = app;
