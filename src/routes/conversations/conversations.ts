import { handleAccess } from '@/common/middleWares.js';
import pool, { getValue } from '@/database/utils.js';
import { Router } from 'express';
import messages from './messages/messages.js';
import { getPagedChunk } from './utils.js';

const conversations = Router();
conversations.use(handleAccess);

const chatInterfaces = ['codingassistant', 'generalassistant', 'eli5'];

conversations.get('/', async (req, res) => {
  try {
    const { user } = req.body;
    const chatInterface = req.query.chatinterface;
    const page = Number(req.query.page);
    const length = Number(req.query.length);

    if (chatInterface && !chatInterfaces.includes(chatInterface.toString())) {
      return res.status(404).json({ message: 'chatinterface is invalid.' });
    }

    const conversationData = await getValue({
      text: `
              SELECT id, title, last_updated FROM conversations
                WHERE user_id = $1 AND chat_interface = $2
            `,
      values: [user.uid, chatInterface],
    });

    const latestFirst = conversationData
      .slice()
      .sort((a, b) => b.last_updated - a.last_updated);

    if (!page || !length) {
      return res.status(200).json({ conversationData: latestFirst });
    }

    const chunkedData = getPagedChunk({
      conversations: latestFirst,
      page,
      length,
    });

    const end =
      chunkedData.length < length || latestFirst.length === page * length;

    res.status(200).json({ conversationData: chunkedData, end });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
    throw error;
  }
});

conversations.post('/', async (req, res) => {
  try {
    const { chatInterface, title } = req.body;
    const { uid } = req.body.user;

    if (!chatInterfaces.includes(chatInterface.toString())) {
      return res.status(400).json({ message: 'chatInterface is invalid.' });
    }

    const id = await pool.query(
      `
      INSERT INTO conversations (chat_interface, title, user_id)
        VALUES ($1, $2, $3) RETURNING id, title, last_updated
    `,
      [chatInterface, title, uid],
    );

    res.status(200).json({
      message: 'Conversation created',
      conversation: {
        id: id.rows[0].id,
        title: id.rows[0].title,
        last_updated: id.rows[0].last_updated,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
    throw error;
  }
});

conversations.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM conversations WHERE id = $1', [id]);
    res.status(200).json({ message: 'Conversation deleted.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
    throw error;
  }
});

conversations.patch('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { title, lastUpdated } = req.body;

    const [conversation] = await getValue({
      text: 'SELECT id FROM conversations WHERE id = $1',
      values: [id],
    });

    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found.' });
    }

    if (title) {
      await pool.query('UPDATE conversations SET title = $1 WHERE id = $2', [
        title,
        id,
      ]);
    }

    if (lastUpdated) {
      await pool.query(
        'UPDATE conversations SET last_updated = $1 WHERE id = $2',
        [lastUpdated, id],
      );
    }

    res.status(200).json({ message: 'Conversation title updated.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
    throw error;
  }
});

conversations.use('/messages', messages);

export default conversations;
