import { describe, beforeEach, it, expect, vi } from 'vitest';
import completionWithHistory from '../routes/openai/completionWithHistory';
import openai from '../routes/openai/openaiConfig';

describe('completionWithHistory', () => {
  it('returns the completion message content', async () => {
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

    const completionMsg = {
      data: {
        choices: [
          {
            message: {
              content: 'Completed message',
            },
          },
        ],
      },
    };

    openai.createChatCompletion.mockResolvedValue(completionMsg)

    const completion = await completionWithHistory({
      history,
      userContent,
      temperature,
      addEntry,
    });

    expect(completion).toBe(completionMsg.data.choices[0].message.content);
  });

  it('calls addEntry with correct parameters', async () => {
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

    const completionMsg = {
      data: {
        choices: [
          {
            message: {
              content: 'Completed message',
            },
          },
        ],
      },
    };

    openai.createChatCompletion.mockResolvedValue(completionMsg)

    await completionWithHistory({
      history,
      userContent,
      temperature,
      addEntry,
    });

    expect(addEntry).toHaveBeenCalledWith(
      {
        role: 'user',
        content: userContent,
      },
      completionMsg.data.choices[0].message,
    );
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
