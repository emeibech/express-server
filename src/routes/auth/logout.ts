import { Router } from 'express';
import { transaction } from '@/database/utils.js';
import logError from '@/common/logError.js';
import { decodeToken } from '@/common/utils.js';
import { handleAccess } from '@/common/middleWares.js';

const logout = Router();

logout.use(handleAccess);
logout.post('/', async (req, res) => {
  try {
    const act = req.signedCookies.act;
    const { rft } = decodeToken(act);

    await transaction([
      {
        text: 'DELETE FROM refresh_tokens WHERE token = $1',
        values: [rft],
      },
    ]);

    res.clearCookie('act');
    res.status(200).json({ message: 'Log out successful.' });
  } catch (error) {
    res.status(500).json({ message: error });
    logError(`logout POST at @/routes/auth/: ${error}`);
  }
});

export default logout;
