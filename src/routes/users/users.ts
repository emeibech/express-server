import { Router } from 'express';
import { createNewUser, isEmailTaken } from '@/database/users.js';
import pool, { getValue, transaction } from '@/database/utils.js';
import { hashPassword } from '@/common/utils.js';

type Key = 'firstname' | 'lastname' | 'email' | 'password' | 'dateOfBirth';
const users = Router();

users.get('/', async (_req, res) => {
  try {
    const users = await getValue({
      text: 'SELECT * FROM users',
    });
    res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
    throw error;
  }
});

users.get('/:userid', async (req, res) => {
  try {
    const userid = req.params.userid;
    const user = await getValue({
      text: 'SELECT * FROM users WHERE id = $1',
      values: [userid],
    });

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
    throw error;
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
    await createNewUser({
      firstname,
      lastname,
      email,
      hashedPassword,
      dateOfBirth,
    });

    res.status(201).json({ response: 'New user created successfully.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
    throw error;
  }
});

users.delete('/:userid', async (req, res) => {
  try {
    const userid = req.params.userid;
    const [user] = await getValue({
      text: 'SELECT email FROM users WHERE id = $1;',
      values: [userid],
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const query = {
      text: 'DELETE FROM users WHERE id = $1',
      values: [userid],
    };

    await pool.query(query);

    res.status(200).json({
      response: `User ${user.email} has been deleted.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
    throw error;
  }
});

users.put('/:userid', async (req, res) => {
  try {
    const userid = req.params.userid;
    const [user] = await getValue({
      text: 'SELECT email FROM users WHERE id = $1;',
      values: [userid],
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
          userid,
        ],
      },
    ]);

    res.status(200).json({
      response: 'User data has been replaced.',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
    throw error;
  }
});

users.patch('/:userid', async (req, res) => {
  try {
    const userid = req.params.userid;

    const [user] = await getValue({
      text: 'SELECT email FROM users WHERE id = $1;',
      values: [userid],
    });

    if (!user) {
      res.status(404).json({ response: 'User not found.' });
      return;
    }

    const updates = req.body;
    const { password } = req.body;
    const hashedPassword = password ? await hashPassword(password) : null;
    const queries = Object.keys(updates).map((key) => {
      return {
        text: getQueries(key as Key),
        values: [key === 'password' ? hashedPassword : updates[key], userid],
      };
    });

    await transaction([...queries]);

    res.status(200).json({
      response: 'User data has been updated.',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
    throw error;
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
