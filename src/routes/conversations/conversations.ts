import { handleAccess } from '@/common/middleWares.js';
import pool, { getValue } from '@/database/utils.js';
import { Router } from 'express';
import messages from './messages/messages.js';

const conversations = Router();
conversations.use(handleAccess);

const chatInterfaces = ['codingassistant', 'generalassistant', 'eli5'];

conversations.get('/', async (req, res) => {
  try {
    const { user } = req.body;
    const chatInterface = req.query.chatinterface;

    if (chatInterface && !chatInterfaces.includes(chatInterface.toString())) {
      return res.status(404).json({ message: 'chatinterface is invalid.' });
    }

    const conversationData = await getValue({
      text: `
              SELECT id, title, timestamp FROM conversations
                WHERE user_id = $1 AND chat_interface = $2
            `,
      values: [user.uid, chatInterface],
    });

    res
      .status(200)
      .json({ conversationData: conversationData.slice().reverse() });
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
    console.log({ chatInterface, title, uid });

    if (!chatInterfaces.includes(chatInterface.toString())) {
      return res.status(400).json({ message: 'chatInterface is invalid.' });
    }

    const id = await pool.query(
      `
      INSERT INTO conversations (chat_interface, title, user_id)
        VALUES ($1, $2, $3) RETURNING id, title, timestamp
    `,
      [chatInterface, title, uid],
    );

    res.status(200).json({
      message: 'Conversation created',
      conversation: {
        id: id.rows[0].id,
        title: id.rows[0].title,
        timestamp: id.rows[0].timestamp,
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
    const { title } = req.body;

    const [conversation] = await getValue({
      text: 'SELECT id FROM conversations WHERE id = $1',
      values: [id],
    });

    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found.' });
    }

    await pool.query('UPDATE conversations SET title = $1 WHERE id = $2', [
      title,
      id,
    ]);

    res.status(200).json({ message: 'Conversation title updated.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
    throw error;
  }
});

conversations.use('/messages', messages);

export default conversations;
