import { Project } from '../models/projectModels.js';
import { Task } from '../models/taskModels.js';

const createTask = async (req, res) => {
	const { project } = req.body;

	let storedProject;

	try {
		storedProject = await Project.findById(project);
	} catch (error) {
		console.log(`~ file: taskControllers.js:11 ~ createTask ~ error: ${error}`);
	}

	if (!storedProject) {
		const error = new Error('El proyecto no existe.');

		return res.status(404).json({ message: error.message });
	}

	if (storedProject.creator.toString() !== req.user._id.toString()) {
		const error = new Error('No tienes acceso a este proyecto.');

		return res.status(401).json({ message: error.message });
	}

	try {
		const storedTask = await Task.create(req.body);

		storedProject.tasks.push(storedTask._id);

		await storedProject.save();

		return res.json(storedTask);
	} catch (error) {
		console.log(
			'🚀 ~ file: taskControllers.js:29 ~ createTask ~ error:',
			error
		);

		res.status(500).json({ message: 'Error al crear la tarea.' });
	}
};

const getTask = async (req, res) => {
	const { id } = req.params;

	let storedTask;

	try {
		storedTask = await Task.findById(id).populate('project');
	} catch (error) {
		console.log('~ file: taskControllers.js:49 ~ getTask ~ error:', error);
	}

	if (!storedTask) {
		const error = new Error('La tarea no pudo ser encontrada.');

		return res.status(404).json({ message: error.message });
	}

	if (storedTask.project.creator.toString() !== req.user._id.toString()) {
		const error = new Error('Acción no válida.');

		return res.status(403).json({ message: error.message });
	}

	return res.json(storedTask);
};

const editTask = async (req, res) => {
	const { id } = req.params;

	let task;

	try {
		task = await Task.findById(id)
			.populate('project')
			.populate('completed', 'email _id name');
	} catch (error) {
		console.log('~ file: taskControllers.js:49 ~ getTask ~ error:', error);
	}

	if (!task) {
		const error = new Error('La tarea no pudo ser encontrada.');

		return res.status(404).json({ message: error.message });
	}

	if (task.project.creator.toString() !== req.user._id.toString()) {
		const error = new Error('Acción no válida.');

		return res.status(403).json({ message: error.message });
	}

	console.log(req.body, task);

	task.name = req.body.name || task.name;
	task.description = req.body.description || task.description;
	task.priority = req.body.priority || task.priority;
	task.deadline = req.body.deadline || task.deadline;
	task.status = req.body.status ?? task.status;

	try {
		const storedTask = await task.save();

		return res.json(storedTask);
	} catch (error) {
		console.log('~ file: taskControllers.js:100 ~ editTask ~ error:', error);

		res.status(500).json({ message: 'Algo salió mal.' });
	}
};

const deleteTask = async (req, res) => {
	const { id } = req.params;

	let task;
	let project;

	try {
		task = await Task.findById(id).populate('project');
		project = await Project.findById(task.project._id);
	} catch (error) {
		console.log('~ file: taskControllers.js:49 ~ getTask ~ error:', error);
	}

	if (!task) {
		const error = new Error('La tarea no pudo ser encontrada.');

		return res.status(404).json({ message: error.message });
	}

	if (
		task.project &&
		task.project?.creator.toString() !== req.user._id.toString()
	) {
		const error = new Error('Acción no válida.');

		return res.status(403).json({ message: error.message });
	}

	try {
		project.tasks.pull(task._id);

		await Promise.all([task.deleteOne(), project.save()]);

		res.json({ message: 'Tarea eliminada.' });
	} catch (error) {
		console.log(
			'🚀 ~ file: taskControllers.js:135 ~ deleteTask ~ error:',
			error
		);

		res.status(500).json({ message: 'Algo salió mal.' });
	}
};

const changeTaskStatus = async (req, res) => {
	const { id } = req.params;

	let task;

	try {
		task = await Task.findById(id)
			.populate('project')
			.populate('completed', 'name _id email');
	} catch (error) {
		console.log('~ file: taskControllers.js:49 ~ getTask ~ error:', error);
	}

	if (!task) {
		const error = new Error('La tarea no pudo ser encontrada.');

		return res.status(404).json({ message: error.message });
	}

	const isCreator = task.project.creator.toString() === req.user._id.toString();

	console.log(task.project);

	const isCollaborator = task.project.collaborators.some(
		(collaborator) => collaborator._id.toString() === req.user._id.toString()
	);

	if (!isCreator && !isCollaborator) {
		const error = new Error('No tienes acceso a este proyecto');

		return res.status(401).json({ message: error.message });
	}

	try {
		task.status = !task.status;
		task.completed = req.user._id;

		const storedTask = await task.save();

		storedTask.completed = req.user;

		return res.json(storedTask);
	} catch (error) {
		console.log(
			'🚀 ~ file: taskControllers.js:135 ~ deleteTask ~ error:',
			error
		);

		res.status(500).json({ message: 'Algo salió mal.' });
	}
};

export { createTask, getTask, editTask, deleteTask, changeTaskStatus };
