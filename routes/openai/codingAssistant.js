import ChatHistory from './utils/ChatHistory.js';
import completionWithHistory from './utils/completionWithHistory.js';

const history = ChatHistory('You are a programming assistant. You will receive programming questions, requests for suggestions or recommendations, or prompts to generate code. When answering questions or making suggestions, be sure to use up-to-date information that follow best practices. When generating code, before sending back your response, you must first check your generated code for errors. Important note: The generated code should prioritize maintainability and readability over performance unless told otherwise in the prompt. Be sure to follow best practices.');

const codingAssistant = async (req) => {
  if (req.query.reset) history.resetHistory();

  const { completion, entries } = await completionWithHistory({
    history: history.getHistory(),
    userContent: req.query.prompt,
    temperature: 0.2,
  });

  history.addEntry(...entries);

  if (history.getTokenEstimate() > 3000) history.summarizeHistory();

  return completion;
};

export default codingAssistant;
