import { getValue } from './utils.js';

export async function verifySession(id: string) {
  try {
    const timeNow = Math.floor(Date.now() / 1000);

    const [isSessionValid] = await getValue({
      text: 'SELECT exp FROM session WHERE id = $1 AND exp > $2;',
      values: [id, timeNow],
    });

    return isSessionValid;
  } catch (error) {
    console.log(error);
    return false;
  }
}
