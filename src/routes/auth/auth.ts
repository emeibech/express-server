import { handleCors } from '@/common/middleWares.js';
import { Router } from 'express';
import login from './login.js';
import logout from './logout.js';

const auth = Router();

auth.use(handleCors);
auth.use('/login', login);
auth.use('/logout', logout);

export default auth;
