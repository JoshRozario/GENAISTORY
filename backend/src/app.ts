import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health';
import eventsRouter from './routes/events';
import storiesRouter from './routes/stories';
import dotenv from 'dotenv';
dotenv.config();

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/health', healthRouter);
  app.use('/api/events', eventsRouter);
  app.use('/api/stories', storiesRouter);

  // example health
  app.get('/api', (req, res) => res.json({ ok: true }));

  return app;
}
