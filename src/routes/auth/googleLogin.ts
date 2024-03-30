import pool, { getValue } from '@/database/utils.js';
import { Router } from 'express';
import { createSession } from '@/common/utils.js';
import logError from '@/common/logError.js';

const nodeEnv = process.env.NODE_ENV;
const googleLogin = Router();

googleLogin.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Incomplete Parameter.' });
    }

    const [existingUser] = await getValue({
      text: 'SELECT id FROM users WHERE email = $1',
      values: [email],
    });

    if (!existingUser) {
      const newUser = await pool.query(
        'INSERT INTO users (email) VALUES ($1) RETURNING id',
        [email],
      );

      const token = await createSession(newUser.rows[0].id);

      res.cookie('act', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: nodeEnv === 'production',
        signed: true,
      });

      return res.status(200).json({ message: 'Login using Google succeeded!' });
    }

    const token = await createSession(existingUser.id);

    res.cookie('act', token, {
      maxAge: 1000 * 60 * 60 * 24 * 15,
      httpOnly: true,
      sameSite: 'strict',
      secure: nodeEnv === 'production',
      signed: true,
    });

    return res.status(200).json({ message: 'Login using Google succeeded!' });
  } catch (error) {
    res.status(500).json({ error });
    logError(`googleLogin POST at @/routes/auth/: ${error}`);
  }
});

export default googleLogin;
