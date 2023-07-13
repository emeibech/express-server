import ChatHistory from './ChatHistory.js';
import completionWithHistory from './completionWithHistory.js';

const history = ChatHistory('You are a programming assistant. You will receive programming questions, requests for suggestions or recommendations, or prompts to generate code. When answering questions or making suggestions, be sure to use up-to-date information that follow best practices. When generating code, before sending back your response, you must first check your generated code for errors. Important note: The generated code should prioritize maintainability and readability over performance unless told otherwise in the prompt. Be sure to follow best practices.');

const codingAssistant = async (req) => {
  if (req.query.reset) history.resetHistory();

  return completionWithHistory({
    history: history.getHistory(),
    userContent: req.query.prompt,
    temperature: 0.2,
    timeout: 20000,
    addEntry: history.addEntry,
  });
};

export default codingAssistant;
