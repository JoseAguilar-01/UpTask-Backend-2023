import express from 'express';
import {
	getAllProjects,
	getProject,
	createProject,
	editProject,
	deleteProject,
	addCollaborator,
	deleteCollaborator,
	getCollaborator,
} from '../controllers/projectControllers.js';
import { checkAuth } from '../middlewares/checkAuth.js';

export const router = express.Router();

router.route('/').get(checkAuth, getAllProjects).post(checkAuth, createProject);

router
	.route('/:id')
	.get(checkAuth, getProject)
	.put(checkAuth, editProject)
	.delete(checkAuth, deleteProject);

router.post('/:id/collaborators', checkAuth, addCollaborator);

router
	.route('/:id/collaborators/:email')
	.get(checkAuth, getCollaborator)
	.delete(checkAuth, deleteCollaborator);
