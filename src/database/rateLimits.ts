import pool, { transaction } from './utils.js';

const defaultDuration = 30;
const defaultLimit = 3;

export async function getTimestamp(userId: string) {
  try {
    const query = 'SELECT timestamp FROM rate_limits WHERE user_id = $1';
    const values = [userId];

    const { rows } = await pool.query(query, values);
    return rows[0]?.timestamp;
  } catch (error) {
    console.log('An error occured while geting timestamp: ', error);
  }
}

export async function getRemainingUsage(userId: string) {
  try {
    const query = 'SELECT remaining_usage FROM rate_limits WHERE user_id = $1';
    const values = [userId];

    const { rows } = await pool.query(query, values);
    return rows[0]?.remaining_usage;
  } catch (error) {
    console.log('An error occured while getting remaining usage: ', error);
  }
}

export async function isLimitReached(userId: string) {
  try {
    const remainingUsage = await getRemainingUsage(userId);
    return remainingUsage === 0;
  } catch (error) {
    console.log(`Error: ${error}`);
  }
}

export async function resetRateLimit(userId: string, timestamp: number) {
  try {
    const timeNow = Date.now() / 1000;

    if (timeNow - timestamp >= defaultDuration) {
      await transaction([
        // updates timestamp
        {
          text: `
        UPDATE rate_limits
        SET timestamp = EXTRACT(epoch FROM CURRENT_TIMESTAMP)
        WHERE user_id = $1;
      `,
          values: [userId],
        },
        // reset remaining_usage
        {
          text: `
        UPDATE rate_limits
        SET remaining_usage  = ${defaultLimit}
        WHERE user_id = $1
      `,
          values: [userId],
        },
      ]);
    }

    console.log('Rate limit reset');
  } catch (error) {
    console.log('An error occured while resetting rate limit: ', error);
  }
}

export async function decrementRemainingUsage(userId: string) {
  try {
    await transaction([
      {
        text: `
      UPDATE rate_limits
      SET remaining_usage = remaining_usage - 1
      WHERE user_id = $1
        AND remaining_usage > 0;
    `,
        values: [userId],
      },
    ]);

    console.log('Remaining Usage decremented');
  } catch (error) {
    console.log('An error occured while decrementing usage: ', error);
  }
}
