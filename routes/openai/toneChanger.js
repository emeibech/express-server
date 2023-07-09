import openai from './openaiConfig.js';

const toneChanger = async (req) => {
  try {
    console.log(req.query.tone);
    const completion = await openai.createChatCompletion(
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You will receive two sets of text, one wrapped in <message> tag and the other with <tone> tag. Rewrite the text inside <message> tag in a tone or manner indicated in the <tone> tag. Do not make any reference on the value inside <tone>.',
          },
          {
            role: 'user',
            content: `<message>${req.query.message}</message><tone>${req.query.tone}</tone>`,
          },
        ],
        temperature: 0.6,
      },
      { timeout: 15000 },
    );

    // console.log(completion.data);
    // console.log(completion.data.choices[0].message.content);
    return completion.data.choices[0].message.content;
  } catch (error) {
    if (error.response) {
      return {
        error: {
          status: error.response.status,
          message: error.response.data.error.message,
        },
      };
    }

    return { error: error.message };
  }
};

export default toneChanger;
