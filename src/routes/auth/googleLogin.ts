import pool, { getValue } from '@/database/utils.js';
import { Router } from 'express';
import { createSession } from '@/common/utils.js';

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

      return res
        .status(200)
        .json({ message: 'Login using Google succeeded!', act: token });
    }

    const token = await createSession(existingUser.id);

    return res
      .status(200)
      .json({ message: 'Login using Google succeeded!', act: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
    throw error;
  }
});

export default googleLogin;
