import ChatHistory from './utils/ChatHistory.js';
import completionWithHistory from './utils/completionWithHistory.js';

const history = ChatHistory('You are a helpful assistant.');

const generalAssistant = async (req) => {
  if (req.query.reset) history.resetHistory();

  const { completion, entries } = await completionWithHistory({
    history: history.getHistory(),
    userContent: req.query.prompt,
    temperature: 0.5,
  });

  history.addEntry(...entries);

  if (history.getTokenEstimate() > 3000) history.summarizeHistory();

  return completion;
};

export default generalAssistant;
