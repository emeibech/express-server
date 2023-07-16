import { describe, beforeEach, it, expect, vi } from 'vitest';
import completionSansHistory from '../routes/openai/completionSansHistory';
import openai from '../routes/openai/openaiConfig';

describe('completionSansHistory unit test', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the completion message content', async () => {
    const sysContent = 'System message';
    const userContent = 'User message';
    const temperature = 0.5;

    openai.createChatCompletion = vi.fn();
    
    openai.createChatCompletion.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: 'Completed message',
            },
          },
        ],
      },
    });

    const result = await completionSansHistory({
      sysContent,
      userContent,
      temperature,
    });

    expect(openai.createChatCompletion).toHaveBeenCalledWith({
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
    });

    expect(result).toBe('Completed message');
  });

  it('returns an error object when function error occurs', async () => {
    const sysContent = 'System message';
    const userContent = 'User message';
    const temperature = 0.5;

    openai.createChatCompletion = vi.fn()
    openai.createChatCompletion.mockRejectedValue(new Error('Some error'));


    const result = await completionSansHistory({
      sysContent,
      userContent,
      temperature,
    });

    expect(openai.createChatCompletion).toHaveBeenCalledWith({
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
    });

    expect(result).toEqual({ error: 'Some error' });
  });

  it('returns an error object when API error occurs', async () => {
    const sysContent = 'System message';
    const userContent = 'User message';
    const temperature = 0.5;

    openai.createChatCompletion = vi.fn()
    openai.createChatCompletion.mockRejectedValue({
      response: {
        status: 500,
        data: {
          error: {
            message: 'API error',
          },
        },
      },
    });

    const result = await completionSansHistory({
      sysContent,
      userContent,
      temperature,
    });

    expect(openai.createChatCompletion).toHaveBeenCalledWith({
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
    });

    expect(result).toEqual({
      error: {
        status: 500,
        message: 'API error',
      },
    });
  });
});
