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

  return {
    getHistory,
    addEntry,
    resetHistory,
  };
};

export default ChatHistory;
