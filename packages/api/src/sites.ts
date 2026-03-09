import { Response, Router } from "express";
import { pool } from "./db.js";
import { AuthRequest } from "./auth.js";

export const sitesRouter = Router();

const now = () => Date.now();

function isValidDomain(domain: string): boolean {
  return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/.test(domain);
}

// Lazily delete expired emergency_access and penalty rows, return clean StorageData
sitesRouter.get("/", async (req: AuthRequest, res: Response) => {
  const uid = req.userId!;
  const nowMs = now();

  await pool.query(
    "DELETE FROM emergency_access WHERE user_id = $1 AND expires_at <= $2",
    [uid, nowMs]
  );
  await pool.query(
    "DELETE FROM penalties WHERE user_id = $1 AND expires_at <= $2",
    [uid, nowMs]
  );
  // Also expire 66-day blocks
  const blockDurationMs = 66 * 24 * 60 * 60 * 1000;
  await pool.query(
    "DELETE FROM blocked_sites WHERE user_id = $1 AND start_timestamp + $2 <= $3",
    [uid, blockDurationMs, nowMs]
  );

  const [sites, emergency, penalties] = await Promise.all([
    pool.query<{ domain: string; start_timestamp: string; emergency_use_count: number }>(
      "SELECT domain, start_timestamp, emergency_use_count FROM blocked_sites WHERE user_id = $1",
      [uid]
    ),
    pool.query<{ domain: string; expires_at: string }>(
      "SELECT domain, expires_at FROM emergency_access WHERE user_id = $1",
      [uid]
    ),
    pool.query<{ domain: string; expires_at: string }>(
      "SELECT domain, expires_at FROM penalties WHERE user_id = $1",
      [uid]
    ),
  ]);

  const blockedSites: Record<string, { domain: string; startTimestamp: number; emergencyUseCount: number }> = {};
  for (const row of sites.rows) {
    blockedSites[row.domain] = {
      domain: row.domain,
      startTimestamp: Number(row.start_timestamp),
      emergencyUseCount: row.emergency_use_count,
    };
  }

  const emergencyAccess: Record<string, { expiresAt: number }> = {};
  for (const row of emergency.rows) {
    emergencyAccess[row.domain] = { expiresAt: Number(row.expires_at) };
  }

  const penaltiesMap: Record<string, { expiresAt: number }> = {};
  for (const row of penalties.rows) {
    penaltiesMap[row.domain] = { expiresAt: Number(row.expires_at) };
  }

  res.json({ blockedSites, emergencyAccess, penalties: penaltiesMap });
});

sitesRouter.post("/", async (req: AuthRequest, res: Response) => {
  const uid = req.userId!;
  const { domain } = req.body as { domain?: string };
  if (!domain) { res.status(400).json({ error: "domain required" }); return; }

  try {
    await pool.query(
      `INSERT INTO blocked_sites (user_id, domain, start_timestamp)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, domain) DO NOTHING`,
      [uid, domain, now()]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

sitesRouter.delete("/:domain", async (req: AuthRequest, res: Response) => {
  const uid = req.userId!;
  const { domain } = req.params;
  if (!isValidDomain(domain)) { res.status(400).json({ error: "Invalid domain" }); return; }
  await pool.query("DELETE FROM blocked_sites WHERE user_id = $1 AND domain = $2", [uid, domain]);
  await pool.query("DELETE FROM emergency_access WHERE user_id = $1 AND domain = $2", [uid, domain]);
  await pool.query("DELETE FROM penalties WHERE user_id = $1 AND domain = $2", [uid, domain]);
  res.json({ ok: true });
});

sitesRouter.post("/:domain/emergency", async (req: AuthRequest, res: Response) => {
  const uid = req.userId!;
  const { domain } = req.params;
  if (!isValidDomain(domain)) { res.status(400).json({ error: "Invalid domain" }); return; }
  const expiresAt = now() + 60 * 60 * 1000; // 60 min

  await pool.query(
    `INSERT INTO emergency_access (user_id, domain, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, domain) DO UPDATE SET expires_at = $3`,
    [uid, domain, expiresAt]
  );
  await pool.query(
    `UPDATE blocked_sites SET emergency_use_count = emergency_use_count + 1
     WHERE user_id = $1 AND domain = $2`,
    [uid, domain]
  );
  res.json({ ok: true });
});

sitesRouter.post("/:domain/penalty", async (req: AuthRequest, res: Response) => {
  const uid = req.userId!;
  const { domain } = req.params;
  if (!isValidDomain(domain)) { res.status(400).json({ error: "Invalid domain" }); return; }
  const expiresAt = now() + 5 * 60 * 1000; // 5 min

  await pool.query(
    `INSERT INTO penalties (user_id, domain, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, domain) DO UPDATE SET expires_at = $3`,
    [uid, domain, expiresAt]
  );
  res.json({ ok: true });
});
