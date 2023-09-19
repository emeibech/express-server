import openai from './openaiConfig.js';

const chatCompletion = async ({
  res,
  sysContent,
  userContent,
  temperature,
}) => {
  try {
    const stream = await openai.chat.completions.create(
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: sysContent,
          },
          {
            role: 'user',
            content: userContent,
          },
        ],
        temperature,
        stream: true,
      },
    );

    res.setHeader('Content-Type', 'text/plain');

    for await (const chunk of stream) {
      const message = chunk.choices[0]?.delta?.content || '';
      res.write(message);
    }
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

export default chatCompletion;
