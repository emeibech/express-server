import ChatHistory from './ChatHistory.js';
import completionWithHistory from './completionWithHistory.js';

const history = ChatHistory('You are a helpful assistant.');

const generalAssistant = async (req) => {
  if (req.query.reset) history.resetHistory();

  return completionWithHistory({
    history: history.getHistory(),
    userContent: req.query.prompt,
    temperature: 0.5,
    timeout: 15000,
    addEntry: history.addEntry,
  });
};

export default generalAssistant;
