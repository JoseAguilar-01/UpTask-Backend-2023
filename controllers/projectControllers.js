import { Project } from '../models/projectModels.js';
import { User } from '../models/userModel.js';

const createProject = async (req, res) => {
	if (!req.body.name) {
		return res.status(400).json({ message: 'El nombre es obligatorio' });
	}

	const project = new Project({ ...req.body, creator: req.user._id });

	try {
		const storedProject = await project.save();

		return res.json(storedProject);
	} catch (error) {
		console.log(
			'~ file: projectControllers.js ~ createProject ~ error:',
			error
		);

		res.status(500).json({ message: error.message });
	}
};

const getAllProjects = async (req, res) => {
	const { user } = req;

	if (!user?._id) {
		return res.status(404).json({ message: 'El usuario no existe' });
	}

	const projects = await Project.find()
		.or([{ collaborators: [user] }, { creator: [user] }])
		.select('-tasks');

	return res.json(projects);
};

const getProject = async (req, res) => {
	const { id } = req.params;

	let project;

	try {
		project = await Project.findById(id)
			.populate({
				path: 'tasks',
				populate: {
					path: 'completed',
					select: 'email name _id',
				},
			})
			.populate('collaborators', '-confirmed -token -__v -password');
	} catch (error) {
		console.log(`~ file: projectControllers.js ~ getProject ~ error: ${error}`);
	}

	if (!project) {
		const error = new Error('Fallo al intentar buscar el proyecto');

		return res.status(500).json({ message: error.message });
	}

	const isCreator = project.creator.toString() === req.user._id.toString();

	const isCollaborator = project.collaborators.some(
		(collaborator) => collaborator._id.toString() === req.user._id.toString()
	);

	if (!isCreator && !isCollaborator) {
		const error = new Error('No tienes acceso a este proyecto');

		return res.status(401).json({ message: error.message });
	}

	res.json(project);
};

const editProject = async (req, res) => {
	const { id } = req.params;

	let project;

	try {
		project = await Project.findById(id);
	} catch (error) {
		console.log(`~ file: projectControllers.js ~ getProject ~ error: ${error}`);
	}

	if (!project) {
		const error = new Error('El proyecto no existe');

		return res.status(404).json({ message: error.message });
	}

	if (project.creator.toString() !== req.user._id.toString()) {
		const error = new Error('No tienes acceso a este proyecto');

		return res.status(401).json({ message: error.message });
	}

	try {
		project.name = req.body.name || project.name;
		project.description = req.body.description || project.description;
		project.client = req.body.client || project.client;
		project.deadline = req.body.deadline || project.deadline;

		const storedProject = await project.save();

		return res.json(storedProject);
	} catch (error) {
		console.log('~ file: projectControllers.js ~ editProject ~ error:', error);

		res.status(500).json({ message: 'Error al actualizar el proyecto.' });
	}
};

const deleteProject = async (req, res) => {
	const { id } = req.params;

	let project;

	try {
		project = await Project.findById(id);
	} catch (error) {
		console.log(`~ file: projectControllers.js ~ getProject ~ error: ${error}`);
	}

	if (!project) {
		const error = new Error('El proyecto no existe');

		return res.status(404).json({ message: error.message });
	}

	if (project.creator.toString() !== req.user._id.toString()) {
		const error = new Error('No tienes acceso a este proyecto');

		return res.status(401).json({ message: error.message });
	}

	try {
		await project.deleteOne();

		res.json({ message: 'Proyecto eliminado.' });
	} catch (error) {
		console.log(
			'~ file: projectControllers.js ~ deleteProject ~ error:',
			error
		);

		res.status(500).json({ message: 'Error al eliminar el proyecto.' });
	}
};

const getCollaborator = async (req, res) => {
	const { id, email } = req.params;

	let project;

	try {
		project = await Project.findById(id)
			.populate('tasks')
			.populate('collaborators', '-confirmed -token -__v -password');
	} catch (error) {
		console.log(`~ file: projectControllers.js ~ getProject ~ error: ${error}`);
	}

	if (!project) {
		const error = new Error('El proyecto no existe');

		return res.status(404).json({ message: error.message });
	}

	if (project.creator.toString() !== req.user._id.toString()) {
		const error = new Error('No tienes acceso a este proyecto');

		return res.status(401).json({ message: error.message });
	}

	try {
		const storedUser = await User.findOne({ email }, 'email name _id');

		if (!storedUser) {
			return res.status(404).json({ message: 'El usuario no existe' });
		}

		return res.json(storedUser);
	} catch (error) {
		console.log(
			'🚀 ~ file: projectControllers.js ~ getCollaborator ~ error:',
			error
		);
	}
};

const addCollaborator = async (req, res) => {
	const { id } = req.params;
	const { userId } = req.body;

	let user;
	let project;

	try {
		user = await User.findById(userId);

		project = await Project.findById(id);
	} catch (error) {
		console.log(
			'🚀 ~ file: projectControllers.js ~ getCollaborator ~ error:',
			error
		);
	}

	if (!user) {
		return res.status(404).json({ message: 'El usuario no existe' });
	}

	if (!project) {
		return res.status(404).json({ message: 'El proyecto no existe' });
	}

	if (project.creator.toString() !== req.user._id.toString()) {
		return res
			.status(401)
			.json({ message: 'No tienes acceso a este proyecto' });
	}

	if (project.collaborators.includes(userId)) {
		return res
			.status(404)
			.json({ message: 'Este colaborador ya fue agregado' });
	}

	if (project.creator.toString() === userId) {
		return res
			.status(404)
			.json({ message: 'El creador del proyecto no puede ser colaborador' });
	}

	try {
		project.collaborators.push(userId);

		await project.save();

		const { name, _id, email } = user;

		res.json({ _id, name, email });
	} catch (error) {
		console.log(
			`~ file: projectControllers.js ~ addCollaborator ~ error: ${error}`
		);
	}
};

const deleteCollaborator = async (req, res) => {
	const { id, email } = req.params;

	let project;

	try {
		project = await Project.findById(id).populate('collaborators');
	} catch (error) {
		console.log(`~ file: projectControllers.js ~ getProject ~ error: ${error}`);
	}

	if (!project) {
		const error = new Error('El proyecto no existe');

		return res.status(404).json({ message: error.message });
	}

	if (project.creator.toString() !== req.user._id.toString()) {
		const error = new Error('No tienes acceso a este proyecto');

		return res.status(401).json({ message: error.message });
	}

	const filteredCollaborators = project.collaborators.filter(
		(element) => element.email !== email
	);

	project.collaborators = filteredCollaborators;

	await project.save();

	return res.json({ message: 'Colaborador eliminado exitosamente' });
};

export {
	getAllProjects,
	getProject,
	createProject,
	editProject,
	deleteProject,
	getCollaborator,
	addCollaborator,
	deleteCollaborator,
};
