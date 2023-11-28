import { Router } from 'express';
import checkId from './checkId.js';
import codeAnalyzer from './codeAnalyzer.js';
import codingAssistant from './codingAssistant.js';
import eli5 from './eli5.js';
import generalAssistant from './generalAssistant.js';
import storyGenerator from './storyGenerator.js';
import toneChanger from './toneChanger.js';
import { handleCors } from '@/common/middleWares.js';

const ai = Router();

ai.use(handleCors);
ai.use('/codeanalyzer', codeAnalyzer);
ai.use('/codingassistant', codingAssistant);
ai.use('/eli5', eli5);
ai.use('/storygenerator', storyGenerator);
ai.use('/tonechanger', toneChanger);
ai.use('/generalassistant', generalAssistant);
ai.use('/checkid', checkId);

export default ai;
