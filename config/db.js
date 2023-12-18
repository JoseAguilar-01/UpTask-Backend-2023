import { connect } from 'mongoose';

export const connectDB = async () => {
	try {
		await connect(process.env.DATABASE_URI);
	} catch (error) {
		throw new Error(`~ file: db.js:8 ~ connectDB ~ error:${error.message}`);
	}
};
