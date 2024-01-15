import logError from '@/common/logError.js';
import { comparePasswords, createSession } from '@/common/utils.js';
import { getValue } from '@/database/utils.js';
import { Router } from 'express';

const login = Router();

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

    const token = await createSession(user.id);

    return res.status(200).json({ message: 'Login succeeded!', act: token });
  } catch (error) {
    res.status(500).json({ error });
    logError(`login POST at @/routes/auth/: ${error}`);
  }
});

export default login;
