import openai from './openaiConfig.js';

const completionWithHistory = async ({
  history,
  userContent,
  temperature,
}) => {
  const messages = [
    ...history,
    {
      role: 'user',
      content: userContent,
    },
  ];

  try {
    const completion = await openai.createChatCompletion(
      {
        model: 'gpt-3.5-turbo',
        messages,
        temperature,
      },
    );

    console.log(
      { data: completion.data },
      completion.data.choices[0].message.content,
    );

    return {
      entries: [
        {
          role: 'user',
          content: userContent,
        },
        { ...completion.data.choices[0].message },
      ],
      completion: completion.data.choices[0].message.content,
    };
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

export default completionWithHistory;
