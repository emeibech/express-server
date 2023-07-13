import completionSansHistory from './completionSansHistory.js';

const codeAnalyzer = async (req) => completionSansHistory({
  req,
  sysContent: 'Your task is to analyze the code provided to you and help the user understand what the code does. Provide a brief summary followed by an itemized breakdown (group related items together).',
  userContent: req.query.code,
  temperature: 0.2,
  timeout: 20000,
});

export default codeAnalyzer;
