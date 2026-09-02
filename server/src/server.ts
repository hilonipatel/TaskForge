import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "TaskForge API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`TaskForge API running on port ${PORT}`);
});

app.get("/api/db-test", async (_req, res) => {
    try {
      const result = await pool.query("SELECT NOW()");
  
      res.json({
        status: "ok",
        databaseTime: result.rows[0].now,
      });
    } catch (error) {
      console.error(error);
  
      res.status(500).json({
        status: "error",
        message: "Database connection failed",
      });
    }
  });  