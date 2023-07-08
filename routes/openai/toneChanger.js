import openai from './openaiConfig.js';

const toneChanger = async () => {
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: 'Give me three palindromes.',
      }],
    });

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
