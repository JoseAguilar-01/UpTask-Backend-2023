import express from 'express';
import { checkAuth } from '../middlewares/checkAuth.js';
import {
	createTask,
	getTask,
	editTask,
	deleteTask,
	changeTaskStatus,
} from '../controllers/taskControllers.js';

export const router = express.Router();

router.post('/', checkAuth, createTask);

router
	.route('/:id')
	.get(checkAuth, getTask)
	.put(checkAuth, editTask)
	.delete(checkAuth, deleteTask);

router.put('/:id/estate', checkAuth, changeTaskStatus);
