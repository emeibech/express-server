import completionSansHistory from './completionSansHistory.js';

const ChatHistory = (sysContent) => {
  const history = [{
    role: 'system',
    content: sysContent,
  }];

  const getHistory = () => history;

  const addEntry = (...entry) => {
    history.push(...entry);
    console.log(history);
  };

  const resetHistory = () => history.splice(1, history.length - 1);

  const getTokenEstimate = () => {
    const wordCount = history.reduce((acc, cur) => {
      const wordsLength = cur.content.split(' ').length;
      return acc + wordsLength;
    }, 0);

    const tokenEstimate = Math.round(wordCount * 1.33333);
    return tokenEstimate;
  };

  const editSysContent = (content) => {
    const index = history[0].content.indexOf('conversation:');

    if (index === -1) {
      history[0].content += ` Summary of previous conversation: ${content}`;
    } else {
      history[0].content = history[0].content.slice(0, index + 14) + content;
    }
  };

  const summarizeHistory = async () => {
    try {
      const formattedHistory = history.map(
        (entry) => `{role: ${entry.role}, content: ${entry.content}}`,
      );

      const summary = await completionSansHistory({
        sysContent: 'Summarize conversation history.',
        userContent: `${formattedHistory}`,
        temperature: 0.3,
      });

      resetHistory();
      editSysContent(summary);
    } catch (error) {
      console.error(error);
    }
  };

  return {
    getHistory,
    addEntry,
    resetHistory,
    getTokenEstimate,
    summarizeHistory,
  };
};

export default ChatHistory;
