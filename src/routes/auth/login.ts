import jwt from 'jsonwebtoken';
import { comparePasswords } from '@/common/utils.js';
import { getValue, transaction } from '@/database/utils.js';
import { Router } from 'express';
import { nanoid } from 'nanoid';

const login = Router();
const secret = process.env.JWT_SECRET || 'jyrf45gq978n_97YG4Q5';

login.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Incomplete Parameter.' });
    }

    const [user] = await getValue({
      text: 'SELECT id FROM users WHERE email = $1',
      values: [email],
    });

    if (!user) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const [hashedPassword] = await getValue({
      text: 'SELECT password FROM users WHERE id = $1',
      values: [user.id],
    });

    const passed = await comparePasswords(password, hashedPassword.password);

    if (!passed) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const sessionToken = nanoid();

    await transaction([
      {
        text: 'INSERT INTO session (token, user_id) VALUES ($1, $2)',
        values: [sessionToken, user.id],
      },
    ]);

    const [sessionId] = await getValue({
      text: 'SELECT id FROM session WHERE token = $1',
      values: [sessionToken],
    });

    const payload = { type: 'user', id: user.id, sessionId: sessionId.id };
    const token = jwt.sign(payload, secret, { expiresIn: '15 days' });

    return res.status(200).json({ message: 'Login succeeded!', token });
  } catch (error) {
    console.log(error);
    res.status(res.statusCode).json({ error });
    throw error;
  }
});

export default login;
