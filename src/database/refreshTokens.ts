import logError from '@/common/logError.js';
import pool, { getValue } from './utils.js';

export async function verifyRft(rft: number) {
  try {
    const timeNow = Math.floor(Date.now() / 1000);

    const [isRtidValid] = await getValue({
      text: 'SELECT exp FROM refresh_tokens WHERE token = $1 AND exp > $2;',
      values: [rft, timeNow],
    });

    return isRtidValid;
  } catch (error) {
    logError(`verifyRft at @/database/sessions.ts: ${error}`);
    return false;
  }
}

export async function deleteRft(rft: number) {
  try {
    const timeNow = Math.floor(Date.now() / 1000);

    await pool.query({
      text: 'DELETE FROM refresh_tokens WHERE token = $1 AND exp > $2;',
      values: [rft, timeNow],
    });
  } catch (error) {
    logError(`deleteRft at @/database/sessions.ts: ${error}`);
  }
}
