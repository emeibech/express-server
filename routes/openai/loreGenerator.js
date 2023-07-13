import ChatHistory from './ChatHistory.js';
import completionWithHistory from './completionWithHistory.js';

const history = ChatHistory('You are a lore generator. Your task is to generate fictional lore based on the user\'s prompt. The prompt will contain the subject matter and some parameters like genre, setting, tone, along with user-provided context about the subject that should be taken into account but does not necessarily have to be included in your generated lore. Invent names, history, culture, language, or even concepts whenever appropriate. Important note: Construct concise sentences and avoid repeating yourself. Balance periodic sentences with loose sentences.');

const loreGenerator = async (req) => {
  if (req.query.reset) history.resetHistory();

  return completionWithHistory({
    history: history.getHistory(),
    userContent: req.query.prompt,
    temperature: Number(req.query.temperature),
    timeout: 20000,
    addEntry: history.addEntry,
  });
};

export default loreGenerator;
