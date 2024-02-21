import { handleAccess } from '@/common/middleWares.js';
import pool, { getValue } from '@/database/utils.js';
import { Router } from 'express';
import { validateMessages } from './validateMessages.js';
import type { Message } from '@/types/route.js';
import logError from '@/common/logError.js';

const messages = Router();
messages.use(handleAccess);

messages.get('/', async (req, res) => {
  try {
    const conversationId = req.query.conversationid;

    const messages = await getValue({
      text: 'SELECT id, role, content FROM messages WHERE conversation_id = $1',
      values: [conversationId],
    });

    res.status(200).json({ messages: messages.sort((a, b) => a.id - b.id) });
  } catch (error) {
    res.status(500).json({ error });
    logError(`messages GET at @/routes/conversations/messages: ${error}`);
  }
});

messages.post('/', validateMessages, async (req, res) => {
  try {
    const messages = req.body.messages as Message[];
    const conversationId = req.query.conversationid;

    const ids: number[] = [];

    for await (const message of messages) {
      const id = await pool.query(
        `
      INSERT INTO messages (role, content, conversation_id)
        VALUES ($1, $2, $3) RETURNING id
    `,
        [message.role, message.content, conversationId],
      );

      ids.push(id.rows[0].id);
    }

    res.status(200).json({ message: 'Message added.', ids });
  } catch (error) {
    res.status(500).json({ error });
    logError(`messages POST at @/routes/conversations/messages: ${error}`);
  }
});

messages.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    pool.query('DELETE FROM messages WHERE id = $1', [id]);
    res.status(200).json({ message: 'Messages deleted.' });
  } catch (error) {
    res.status(500).json({ error });
    logError(`messages DELETE at @/routes/conversations/messages: ${error}`);
  }
});

export default messages;
