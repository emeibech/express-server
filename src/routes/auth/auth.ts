import { Router } from 'express';
import login from './login.js';
import logout from './logout.js';
import googleLogin from './googleLogin.js';

const auth = Router();
auth.use('/login', login);
auth.use('/logout', logout);
auth.use('/googlelogin', googleLogin);

export default auth;
