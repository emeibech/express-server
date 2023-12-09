import { Router } from 'express';
import { decodeToken, verifyToken } from '@/common/utils.js';
import { transaction } from '@/database/utils.js';

const logout = Router();

logout.post('/', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Incomplete parameter.' });
    }

    const { payload, expired } = await verifyToken(token);

    if (expired) {
      const { sessionId } = decodeToken(token);

      await transaction([
        {
          text: 'DELETE FROM session WHERE id = $1',
          values: [sessionId],
        },
      ]);
    }

    if (payload) {
      await transaction([
        {
          text: 'DELETE FROM session WHERE id = $1',
          values: [payload],
        },
      ]);
    }

    res.status(200).json({ message: 'Log out successful.' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
});

export default logout;
