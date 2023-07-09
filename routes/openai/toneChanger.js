import openai from './openaiConfig.js';

const toneChanger = async (req) => {
  try {
    console.log(req.query.readability);
    const completion = await openai.createChatCompletion(
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Your task is to modify the tone and language of the text you will receive so that it sounds ${req.query.tone}. Use very simple language.`,
          },
          {
            role: 'user',
            content: 'People fill their cart or bags casually, no masks, then just walk out like nothing\'s up. Is this a recent thing (and in which case what\'s driving it) or has it always been happening but it\'s getting more attention in social media?.',
          },
        ],
        temperature: 0.5,
      },
      { timeout: 10000 },
    );

    console.log(completion.data);
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
