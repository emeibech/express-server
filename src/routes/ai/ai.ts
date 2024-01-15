import { Router } from 'express';
import codeAnalyzer from './codeAnalyzer.js';
import codingAssistant from './codingAssistant.js';
import eli5 from './eli5.js';
import generalAssistant from './generalAssistant.js';
import storyGenerator from './storyGenerator.js';
import toneChanger from './toneChanger.js';
import { handleCors } from '@/common/middleWares.js';
import conversations from './conversations/conversations.js';
import titleCreator from './titleCreator.js';

const ai = Router();

ai.use(handleCors);
ai.use('/codeanalyzer', codeAnalyzer);
ai.use('/codingassistant', codingAssistant);
ai.use('/eli5', eli5);
ai.use('/storygenerator', storyGenerator);
ai.use('/tonechanger', toneChanger);
ai.use('/generalassistant', generalAssistant);
ai.use('/conversations', conversations);
ai.use('/titlecreator', titleCreator);

export default ai;
