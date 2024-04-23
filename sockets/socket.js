import { Server } from 'socket.io';

export const connectSocket = (server, whitelist) => {
	const io = new Server(server, {
		pingTimeout: 60000,
		cors: {
			origin: whitelist,
		},
	});

	io.on('connection', (socket) => {
		console.log('Connected to socket.io');

		// Define events

		socket.on('openApp', (userEmail) => {
			socket.join(userEmail);
		});

		socket.on('openProject', (projectID) => {
			// This allows create a room with an ID
			socket.join(projectID);
		});

		socket.on('newTask', (task) => {
			io.to(task.project).emit('addedTask', task);
		});

		socket.on('changeTaskStatus', (task) => {
			io.to(task.project._id).emit('changedTaskStatus', task);
		});

		socket.on('deleteTask', (data) => {
			const { projectID, taskID } = data;

			io.to(projectID).emit('deletedTask', taskID);
		});

		socket.on('updateTask', (task) => {
			io.to(task.project._id).emit('udpatedTask', task);
		});

		socket.on('addCollaborator', (data) => {
			const { project, userEmail } = data;

			io.to(userEmail).emit('addedCollaborator', project);
		});

		socket.on('deleteCollaborator', (data) => {
			const { projectID, userEmail } = data;

			io.to(userEmail).emit('deletedCollaborator', projectID);
		});
	});
};
