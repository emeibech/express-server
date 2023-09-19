import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  try {
    res.json({
      serverStatus: 'Active',
      yourIP: req.header('X-Real-IP'),
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

export default router;
