import { getValue } from './utils.js';

export async function verifySession(sessionId: string | undefined) {
  try {
    if (!sessionId) throw new Error('sessionId is undefined');

    const timeNow = Math.floor(Date.now() / 1000);

    const [isSessionValid] = await getValue({
      text: 'SELECT exp FROM sessions WHERE id = $1 AND exp > $2;',
      values: [sessionId, timeNow],
    });

    return isSessionValid;
  } catch (error) {
    console.log(error);
    return false;
  }
}
