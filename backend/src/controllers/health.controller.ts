import type { Request, Response } from "express";
import { getDBHealth } from "../lib/db.js";

export const getHealth = async (_req: Request, res: Response): Promise<void> => {
  const db = await getDBHealth();
  const isDbHealthy = db.status === "ok" || db.status === "not_configured";

  res.status(isDbHealthy ? 200 : 503).json({
    status: isDbHealthy ? "ok" : "degraded",
    message: "Backend is running",
    timestamp: new Date().toISOString(),
    db,
  });
};
