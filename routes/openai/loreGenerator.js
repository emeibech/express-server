import ChatHistory from './utils/ChatHistory.js';
import completionWithHistory from './utils/completionWithHistory.js';

const history = ChatHistory('Your task is to generate a fictional story based on the user\'s prompt. The prompt will contain the subject matter, the style in which you will write the story, and some user-provided context about the subject. Make sure to imply the user-provided context instead of mentioning them directly in the story. Invent names, history, culture, language, or even new concepts to make the story more engaging. Important note: Construct concise sentences and avoid repeating yourself. Balance periodic sentences with loose sentences.');

const loreGenerator = async (req) => {
  if (req.query.reset) history.resetHistory();

  const { completion, entries } = await completionWithHistory({
    history: history.getHistory(),
    userContent: req.query.prompt,
    temperature: Number(req.query.temperature),
  });

  history.addEntry(...entries);

  if (history.getTokenEstimate() > 3000) history.summarizeHistory();

  return completion;
};

export default loreGenerator;
