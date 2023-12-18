import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';

export const checkAuth = async (req, res, next) => {
	const token = req.headers.authorization;

	if (token && token.startsWith('Bearer')) {
		try {
			const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);

			req.user = await User.findById(decoded.id).select('_id name email');

			return next();
		} catch (error) {
			res.status(404).json({ message: 'Hubo un error' });
		}
	}

	const error = new Error('El token no es válido');
	return res.status(401).json({ message: error.message });
};
