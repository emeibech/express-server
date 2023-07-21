import { describe, beforeEach, it, expect, vi } from 'vitest';
import completionWithHistory from '../routes/openai/completionWithHistory';
import openai from '../routes/openai/openaiConfig';

describe('completionWithHistory', () => {
  it('returns an obj containing completion and entries props', async () => {
    const history = [
      {
        role: 'assistant',
        content: 'Hello, how can I assist you today?',
      },
    ];

    const userContent = 'What is the weather like today?';
    const temperature = 0.5;
    const addEntry = vi.fn();
    openai.createChatCompletion = vi.fn();

    const completionMock = {
      data: {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Completed message',
            },
          },
        ],
      },
    };

    const completionObj = {
      completion: completionMock.data.choices[0].message.content,
      entries: [
        {
          role: 'user',
          content: userContent,
        },
        { ...completionMock.data.choices[0].message }
      ]
    }

    openai.createChatCompletion.mockResolvedValue(completionMock)

    const completion = await completionWithHistory({
      history,
      userContent,
      temperature,
      addEntry,
    });

    expect(completion).toEqual(completionObj);
  });

  it('returns an error object when an error occurs', async () => {
    const history = [
      {
        role: 'assistant',
        content: 'Hello, how can I assist you today?',
      },
    ];
    const userContent = 'What is the weather like today?';
    const temperature = 0.5;
    const addEntry = vi.fn();

    openai.createChatCompletion = vi.fn();
    openai.createChatCompletion.mockRejectedValue(new Error('API error'));
    const completion = await completionWithHistory({
      history,
      userContent,
      temperature,
      addEntry,
    });

    expect(completion).toEqual({ error: 'API error' });
    expect(addEntry).not.toHaveBeenCalled();
  });
});
