import completionSansHistory from './completionSansHistory.js';

const toneChanger = async (req) => completionSansHistory({
  req,
  sysContent: 'You are a language assistant. You will receive two sets of text, one labeled tone and the other message. The value of tone(label) can be a particular tone, e.g., sarcastic, or a particular type of person, e.g., medieval knight. Your task is to transform the message so that it is written in a particular tone, or as if it was written by a particular type of person. Important note: Be subtle with your response. Do not include what tone you are supposed to be written in or what type of person is the supposed writer.',
  userContent: `tone:"${req.query.tone}" message:"${req.query.message}"`,
  temperature: 0.3,
});

export default toneChanger;
