import openai from './openaiConfig.js';

const completionSansHistory = async ({
  req,
  sysContent,
  userContent,
  temperature,
  timeout,
}) => {
  try {
    const completion = await openai.createChatCompletion(
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
      },
      { timeout },
    );

    console.log(
      {
        ...req.query,
        data: completion.data,
      },
      completion.data.choices[0].message.content,
    );

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

export default completionSansHistory;
