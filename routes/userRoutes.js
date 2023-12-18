import express from 'express';
import {
	authenticateUser,
	createUser,
	confirmUser,
	forgotPassword,
	confirmForgotPasswordToken,
	changePassword,
	profile,
	getUser,
} from '../controllers/userControllers.js';
import { checkAuth } from '../middlewares/checkAuth.js';

export const router = express.Router();

router.post('/', createUser);

router.post('/login', authenticateUser);

router.get('/confirm/:token', confirmUser);

router.post('/forgot-password', forgotPassword);

router
	.route('/forgot-password/:token')
	.get(confirmForgotPasswordToken)
	.post(changePassword);

router.get('/profile', checkAuth, profile);

router.get('/:email', checkAuth, getUser);
