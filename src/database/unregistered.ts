import pool, { transaction } from './utils.js';

export async function insertUnregistered(ip: string) {
  try {
    await transaction([
      {
        text: `
        INSERT INTO unregistered(ip)
        SELECT $1
        WHERE NOT EXISTS (
          SELECT 1
          FROM unregistered
          WHERE ip = $1
        )
      `,
        values: [ip],
      },
    ]);

    console.log('Unregistered IP added');
  } catch (error) {
    console.log('An error occured while inserting unregistered IP');
    throw error;
  }
}

export async function isLimitReached(id: string) {
  try {
    const query = 'SELECT remaining_usage FROM unregistered WHERE id = $1';
    const values = [id];

    const { rows } = await pool.query(query, values);
    const remainingUsage = rows[0]?.remaining_usage;

    return remainingUsage === 0;
  } catch (error) {
    console.log(`Error: ${error}`);
    throw error;
  }
}

export async function decrementRemainingUsage(id: string) {
  try {
    await transaction([
      {
        text: `
      UPDATE unregistered
      SET remaining_usage  = remaining_usage - 1
      WHERE id = $1
        AND remaining_usage > 0;
    `,
        values: [id],
      },
    ]);

    console.log('Remaining Usage decremented');
  } catch (error) {
    console.log(`Error: ${error}`);
    throw error;
  }
}

export async function getTimestamp(id: string) {
  try {
    const query = 'SELECT timestamp FROM unregistered WHERE id = $1';
    const values = [id];

    const { rows } = await pool.query(query, values);
    return rows[0]?.timestamp;
  } catch (error) {
    console.log(`Error: ${error}`);
    throw error;
  }
}

export async function calculateRateLimit(id: string) {
  try {
    const currentTimestamp = await getTimestamp(id);
    const timeNow = Date.now() / 1000;
    const defaultDuration = 30;

    if (timeNow - currentTimestamp >= defaultDuration) {
      await transaction([
        // updates timestamp
        {
          text: `
        UPDATE unregistered
        SET timestamp = EXTRACT(epoch FROM CURRENT_TIMESTAMP)
        WHERE id = $1;
      `,
          values: [id],
        },
        // reset remaining_usage
        {
          text: `
        UPDATE unregistered
        SET remaining_usage  = 5
        WHERE id = $1
      `,
          values: [id],
        },
      ]);
    }

    console.log('Rate limit calculated');
  } catch (error) {
    console.log(`Error: ${error}`);
    throw error;
  }
}
