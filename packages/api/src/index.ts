import express from "express";
import cors from "cors";
import { initDb } from "./db.js";
import { authRouter } from "./auth.js";
import { sitesRouter } from "./sites.js";
import { requireAuth } from "./auth.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

const allowedOrigins = [
  "https://block66-extension-wl3m.vercel.app",
  "https://block66.com",
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g. curl, extension background SW)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return cb(null, true);
    }
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", authRouter);
app.use("/sites", requireAuth, sitesRouter);

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Block66 API listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to initialise database:", err);
    process.exit(1);
  });
