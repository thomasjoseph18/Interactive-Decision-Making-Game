import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();
const LEADERBOARD_PREFIX = "steelshift-score:";

type LeaderboardEntry = {
  id: string;
  name: string;
  score: number;
  date: string;
};

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-318651ea/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/make-server-318651ea/leaderboard", async (c) => {
  try {
    const entries = (await kv.getByPrefix(LEADERBOARD_PREFIX)) as LeaderboardEntry[];
    const leaderboard = entries
      .filter(
        (entry) =>
          entry &&
          typeof entry.id === "string" &&
          typeof entry.name === "string" &&
          Number.isInteger(entry.score),
      )
      .sort((a, b) => b.score - a.score || a.date.localeCompare(b.date))
      .slice(0, 20);

    return c.json({ leaderboard });
  } catch (error) {
    console.log("Failed to load leaderboard:", error);
    return c.json({ error: "Unable to load leaderboard." }, 500);
  }
});

app.post("/make-server-318651ea/leaderboard", async (c) => {
  try {
    const body = await c.req.json();
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 24) : "";
    const score = Number(body.score);

    if (!name || !Number.isInteger(score) || score < 0 || score > 10) {
      return c.json({ error: "A valid name and score are required." }, 400);
    }

    const id = crypto.randomUUID();
    const entry: LeaderboardEntry = {
      id,
      name,
      score,
      date: new Date().toISOString(),
    };

    await kv.set(`${LEADERBOARD_PREFIX}${entry.date}:${id}`, entry);
    return c.json({ entry }, 201);
  } catch (error) {
    console.log("Failed to save leaderboard score:", error);
    return c.json({ error: "Unable to save score." }, 500);
  }
});

Deno.serve(app.fetch);
