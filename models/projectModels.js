import { Schema, model } from 'mongoose';

const projectSchema = Schema(
	{
		name: {
			type: String,
			trim: true,
			require: true,
		},
		description: {
			type: String,
			trim: true,
			require: true,
		},
		deadline: {
			type: Date,
			default: Date.now(),
		},
		client: {
			type: String,
			trim: true,
			require: true,
		},
		creator: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		collaborators: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		tasks: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Task',
			},
		],
	},
	{ timestamps: true }
);

export const Project = model('Project', projectSchema);
