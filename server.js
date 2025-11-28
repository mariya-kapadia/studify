import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

// Debug print
console.log("Loaded API KEY:", process.env.GROQ_API_KE);

import express from "express";
import cors from "cors";
import aiRoute from "./routes/ai.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/ai", aiRoute);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
