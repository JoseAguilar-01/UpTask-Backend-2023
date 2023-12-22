import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	password: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		trim: true,
		unique: true,
	},
	token: {
		type: String,
	},
	confirmed: {
		type: Boolean,
		default: false,
	},
});

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		next();
	}

	// Hash the password before save
	this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.checkPassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

export const User = model('User', userSchema);
