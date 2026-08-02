import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index.ts";
import { colaboradores, auditLogs } from "./src/db/schema.ts";
import { eq } from "drizzle-orm";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for large photos
  app.use(express.json({ limit: '50mb' }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/colaboradores", async (req, res) => {
    try {
      const allColaboradores = await db.select().from(colaboradores);
      res.json(allColaboradores);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch colaboradores' });
    }
  });

  app.post("/api/colaboradores", async (req, res) => {
    try {
      if (Array.isArray(req.body)) {
        await db.insert(colaboradores).values(req.body);
      } else {
        await db.insert(colaboradores).values(req.body);
      }
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create colaborador' });
    }
  });

  app.put("/api/colaboradores/:id", async (req, res) => {
    try {
      await db.update(colaboradores).set(req.body).where(eq(colaboradores.id, req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update colaborador' });
    }
  });

  app.delete("/api/colaboradores/:id", async (req, res) => {
    try {
      await db.delete(colaboradores).where(eq(colaboradores.id, req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete colaborador' });
    }
  });

  app.get("/api/audit-logs", async (req, res) => {
    try {
      const logs = await db.select().from(auditLogs);
      res.json(logs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  });

  app.post("/api/audit-logs", async (req, res) => {
    try {
      if (Array.isArray(req.body)) {
        await db.insert(auditLogs).values(req.body);
      } else {
        await db.insert(auditLogs).values(req.body);
      }
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create audit log' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
