import { Schema, model } from 'mongoose';

const taskSchema = Schema(
	{
		name: {
			type: String,
			require: true,
			trim: true,
		},
		description: {
			type: String,
			require: true,
			trim: true,
		},
		status: {
			type: Boolean,
			require: true,
			default: false,
		},
		priority: {
			type: String,
			require: true,
			enum: ['High', 'Medium', 'Low'],
		},
		project: {
			type: Schema.Types.ObjectId,
			ref: 'Project',
		},
		deadline: {
			type: Date,
			require: true,
			default: Date.now(),
		},
		completed: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{
		timestamps: true,
	}
);

export const Task = model('Task', taskSchema);
