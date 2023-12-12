import { Router } from 'express';
import { decodeToken, verifyToken } from '@/common/utils.js';
import { transaction } from '@/database/utils.js';

const logout = Router();

logout.post('/', async (req, res) => {
  try {
    const { act } = req.body;

    if (!act) {
      return res.status(400).json({ message: 'Incomplete parameter.' });
    }

    const { payload, expired } = await verifyToken(act);

    if (expired) {
      const { sid } = decodeToken(act);

      await transaction([
        {
          text: 'DELETE FROM sessions WHERE id = $1',
          values: [sid],
        },
      ]);
    }

    if (payload) {
      await transaction([
        {
          text: 'DELETE FROM sessions WHERE id = $1',
          values: [payload.sid],
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
