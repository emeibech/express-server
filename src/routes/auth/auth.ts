import { handleCors } from '@/common/middleWares.js';
import { Router } from 'express';
import login from './login.js';
import logout from './logout.js';
import protectedRoute from './protectedRoute.js';

const auth = Router();

auth.use(handleCors);
auth.use('/login', login);
auth.use('/logout', logout);
auth.use('/pr', protectedRoute);

export default auth;
