import { Router } from 'express';
import { addEvent, getStats } from '../services/eventService';

const router = Router();

router.post('/', (req, res) => {
  const e = req.body;
  if (!e || !e.userId) return res.status(400).json({ error: 'invalid event' });
  addEvent(e);
  res.status(201).json({ ok: true });
});

router.get('/stats', (req, res) => {
  res.json(getStats());
});

export default router;
