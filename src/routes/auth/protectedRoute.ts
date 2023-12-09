import { handleAccess } from '@/common/middleWares.js';
import { Router } from 'express';

const protectedRoute = Router();

protectedRoute.use(handleAccess);

protectedRoute.post('/', async (req, res) => {
  try {
    const { user } = req.body;
    return res
      .status(200)
      .json({ message: 'Protected route is unlocked.', user });
  } catch (error) {
    return res.status(res.statusCode).json({ error });
  }
});

export default protectedRoute;
