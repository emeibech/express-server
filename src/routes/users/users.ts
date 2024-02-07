import { Router } from 'express';
import { createNewUser, isEmailTaken } from '@/database/users.js';
import pool, { getValue, transaction } from '@/database/utils.js';
import { hashPassword } from '@/common/utils.js';
import logError from '@/common/logError.js';

type Key = 'firstname' | 'lastname' | 'email' | 'password' | 'dateOfBirth';
const users = Router();

users.get('/', async (_req, res) => {
  try {
    const users = await getValue({ text: 'SELECT * FROM users' });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error });
    logError(`users GET at @/routes/users/: ${error}`);
  }
});

users.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await getValue({
      text: 'SELECT * FROM users WHERE id = $1',
      values: [userId],
    });

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error });
    logError(`users/:id GET at @/routes/users/: ${error}`);
  }
});

users.post('/', async (req, res) => {
  try {
    const { firstname, lastname, password, email, dateOfBirth } = req.body;
    const emailTaken = await isEmailTaken(email);

    if (emailTaken) {
      res.status(409).json({ error: 'Email is already taken.' });
      return;
    }

    if (!firstname || !email || !password || !dateOfBirth) {
      res.status(400).json({ error: 'Incomplete parameter.' });
      return;
    }

    const hashedPassword = await hashPassword(password);

    if (hashedPassword) {
      await createNewUser({
        firstname,
        lastname,
        email,
        hashedPassword,
        dateOfBirth,
      });
    }

    res.status(201).json({ message: 'New user created successfully.' });
  } catch (error) {
    res.status(500).json({ error });
    logError(`users POST at @/routes/users/: ${error}`);
  }
});

users.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const [user] = await getValue({
      text: 'SELECT email FROM users WHERE id = $1;',
      values: [userId],
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    res.status(200).json({
      message: `User ${user.email} has been deleted.`,
    });
  } catch (error) {
    res.status(500).json({ error });
    logError(`users DELETE at @/routes/users/: ${error}`);
  }
});

users.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const [user] = await getValue({
      text: 'SELECT email FROM users WHERE id = $1;',
      values: [userId],
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const { firstname, lastname, email, password, dateOfBirth } = req.body;

    if (!firstname || !email || !password || !dateOfBirth) {
      res.status(400).json({ error: 'Incomplete parameter.' });
      return;
    }

    const hashedPassword = await hashPassword(password);

    await transaction([
      {
        text: `
          UPDATE users
          SET 
            firstname = $1, 
            lastname = $2, 
            email = $3, 
            password = $4, 
            date_of_birth = $5
          WHERE id = $6
        `,
        values: [
          firstname,
          lastname,
          email,
          hashedPassword,
          dateOfBirth,
          userId,
        ],
      },
    ]);

    res.status(200).json({
      message: 'User data has been replaced.',
    });
  } catch (error) {
    res.status(500).json({ error });
    logError(`users PUT at @/routes/users/: ${error}`);
  }
});

users.patch('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const [user] = await getValue({
      text: 'SELECT email FROM users WHERE id = $1;',
      values: [userId],
    });

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const updates = req.body;
    const { password } = req.body;
    const hashedPassword = password ? await hashPassword(password) : null;
    const queries = Object.keys(updates).map((key) => {
      return {
        text: getQueries(key as Key),
        values: [key === 'password' ? hashedPassword : updates[key], userId],
      };
    });

    await transaction([...queries]);

    res.status(200).json({
      message: 'User data has been updated.',
    });
  } catch (error) {
    res.status(500).json({ error });
    logError(`users PATCH at @/routes/users/: ${error}`);
  }
});

function getQueries(key: Key) {
  const queries = {
    firstname: `UPDATE users SET firstname = $1 WHERE id = $2`,
    lastname: `UPDATE users SET lastname = $1 WHERE id = $2`,
    email: `UPDATE users SET email = $1 WHERE id = $2`,
    password: `UPDATE users SET password = $1 WHERE id = $2`,
    dateOfBirth: `UPDATE users SET date_of_birth = $1 WHERE id = $2`,
  };

  return queries[key];
}

export default users;
