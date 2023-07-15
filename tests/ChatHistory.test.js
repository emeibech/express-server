import { describe, beforeEach, it, expect, vi } from 'vitest';
import ChatHistory from '../routes/openai/ChatHistory.js'
import completionSansHistory from '../routes/openai/completionSansHistory.js';
import dotenv from 'dotenv';

dotenv.config();

describe('ChatHistory unit test', () => {
  describe('getHistory method', () => {
    it('returns the current history', () => {
      const history = ChatHistory('You are a helpful assistant');
  
      expect(history.getHistory()).toEqual([{
        role: 'system',
        content: 'You are a helpful assistant',
      }]);
    });
  });

  describe('addEntry method', () => {
    it('adds a single entry to history', async () => {
      const history = ChatHistory('You are a helpful assistant');
  
      history.addEntry(
        {
          role: 'user',
          content: 'What are you?',
        }
      )
  
      expect(history.getHistory()).toEqual([
        {
        role: 'system',
        content: 'You are a helpful assistant',
        },
        {
          role: 'user',
          content: 'What are you?',
        }
      ]);
    });

    it('adds multiple entries to history', async () => {
      const history = ChatHistory('You are a helpful assistant');
  
      history.addEntry(
        {
          role: 'user',
          content: 'What are you?',
        },
        {
          role: 'assistant',
          content: 'I am a helpful assistant.',
        }
      )
  
      expect(history.getHistory()).toEqual([
        {
        role: 'system',
        content: 'You are a helpful assistant',
        },
        {
          role: 'user',
          content: 'What are you?',
        },
        {
          role: 'assistant',
          content: 'I am a helpful assistant.',
        }
      ]);
    });
  });

  describe('resetHistory method', () => {
    it('removes all entries in history except the first one', async () => {
      const history = ChatHistory('You are a helpful assistant');
  
      history.addEntry(
        {
          role: 'user',
          content: 'What are you?',
        },
        {
          role: 'assistant',
          content: 'I am a helpful assistant.',
        }
      )
  
      history.resetHistory();
  
      expect(history.getHistory()).toEqual([{
        role: 'system',
        content: 'You are a helpful assistant',
      }]);
    });
  });

  describe('getTokenEstimate method', () => {
    it('returns token estimate based on current history', async () => {
      const history = ChatHistory('You are a helpful assistant');
  
      history.addEntry(
        {
          role: 'user',
          content: 'What are you?',
        },
        {
          role: 'assistant',
          content: 'I am a helpful assistant.',
        }
      )
  
      expect(history.getTokenEstimate()).toEqual(17);

      history.addEntry(
        {
          role: 'user',
          content: 'What is the capital of Japan?',
        },
        {
          role: 'assistant',
          content: 'The capital of Japan is Tokyo.',
        }
      )

      expect(history.getTokenEstimate()).toEqual(33);

      history.resetHistory();

      expect(history.getTokenEstimate()).toEqual(7)
    });
  });

  describe('summarizeHistory method', () => {
    beforeEach(() => vi.clearAllMocks());
    
    it('calls completionSansHistory with correct parameters', async () => {
      const sysContent = 'You are a helpful assistant.';
      const temperature = 0.3;
      const history = ChatHistory(sysContent);
      completionSansHistory = vi.fn();

      history.addEntry({ role: 'user', content: 'Tell me about Tokyo' });

      const formattedHistory = history.getHistory().map(
        (entry) => `{role: ${entry.role}, content: ${entry.content}}`,
      );

      await history.summarizeHistory();
      
      expect(completionSansHistory).toHaveBeenCalledTimes(1);
      expect(completionSansHistory).toHaveBeenCalledWith({
        sysContent: 'Summarize conversation history.',
        userContent: `${formattedHistory}`,
        temperature,
      });
    });


    it(
      'resets history and updates system content with summarized history', 
      async () => {
        const history = ChatHistory('Helpful assistant.');

        history.addEntry(
          {
            role: 'user',
            content: 'Tell me about Tokyo.',
          },
          {
            role: 'assistant',
            content: 'Here are some information about Tokyo',
          }
        )

        completionSansHistory = vi.fn();
        const mockResponse = 'Returned summary.';
        const summaryPrefix = 'Summary of previous conversation: ';
        completionSansHistory.mockResolvedValue(mockResponse);

        await history.summarizeHistory();

        expect(history.getHistory()).toEqual([{
          role: 'system',
          content: `Helpful assistant. ${summaryPrefix}${mockResponse}`,
        }]);
      },
    );

    it('restores previous history when error occurs', async () => {
      const history = ChatHistory('Helpful assistant.');

      completionSansHistory = vi.fn();
      const rejectedValue = 'Helpful assistant.'

      completionSansHistory.mockRejectedValue(rejectedValue);

      await history.summarizeHistory();

      expect(history.getHistory()).toEqual([{
        role: 'system',
        content: 'Helpful assistant.',
      }]);
    });
  });
});
