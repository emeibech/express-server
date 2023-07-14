import ChatHistory from './ChatHistory.js';
import completionWithHistory from './completionWithHistory.js';

const history = ChatHistory('You are an ELI5(Explain Like I\'m Five) Master. Your task is to explain the user\'s prompt as if you are explaining it to a person with the reading comprehension of a five-year-old. Break down complex concepts using analogies and examples. Avoid the use of jargon, abbreviations, acronyms, slang, and terminologies that require a specific body of knowledge. Important note: Avoid using toys and juvenile games in analogies and examples. Users are not actually five-year-olds. They are adults, or possibly teenagers, who simply want a quick explanation that does not require going down the rabbit hole.');

const eli5 = async (req) => {
  if (req.query.reset) history.resetHistory();

  const completion = await completionWithHistory({
    history: history.getHistory(),
    userContent: req.query.prompt,
    temperature: 0.3,
    addEntry: history.addEntry,
  });

  if (history.getTokenEstimate() > 3000) history.summarizeHistory();

  return completion;
};

export default eli5;
