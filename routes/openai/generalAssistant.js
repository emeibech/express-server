import ChatHistory from './ChatHistory.js';
import completionWithHistory from './completionWithHistory.js';

const history = ChatHistory('You are a helpful assistant.');

const generalAssistant = async (req) => {
  if (req.query.reset) history.resetHistory();

  const completion = await completionWithHistory({
    history: history.getHistory(),
    userContent: req.query.prompt,
    temperature: 0.5,
    addEntry: history.addEntry,
  });

  if (history.getTokenEstimate() > 2000) history.summarizeHistory();

  return completion;
};

export default generalAssistant;
