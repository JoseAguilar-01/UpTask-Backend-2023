import { User } from '../models/userModel.js';
import { generateId } from '../helpers/generateId.js';
import { generateJWT } from '../helpers/generateJWT.js';
import { forgotPasswordEmail, registerEmail } from '../helpers/email.js';

const createUser = async (req, res) => {
	const { email } = req.body;
	if (!email) {
		return res.status(400).json({ message: 'El email es obligatorio' });
	}

	const duplicateUser = await User.findOne({ email });

	if (duplicateUser) {
		return res.status(400).json({ message: 'Usuario ya existente' });
	}

	try {
		const newUser = new User(req.body);
		newUser.token = generateId();

		await newUser.save();

		const { name, token } = newUser;

		registerEmail({ email, name, token });

		res.json({
			message:
				'Usuario creado exitosamente. Hemos enviado un código de verificación a tu email.',
		});
	} catch (error) {
		console.log('🚀 ~ file: userControllers.js ~ createUser ~ error:', error);

		res.status(500).json({ message: 'Error al crear el usuario.' });
	}
};

const authenticateUser = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		const error = new Error('El email y el password son obligatorios');
		return res.status(400).json({ message: error.message });
	}

	const currentUser = await User.findOne({ email });

	if (!currentUser) {
		const error = new Error('El usuario o email no existe');
		return res.status(404).json({ message: error.message });
	}

	const matchingPassword = await currentUser.checkPassword(password);

	if (!matchingPassword) {
		const error = new Error('El password es incorrecto');
		return res.status(401).json({ message: error.message });
	}

	if (!currentUser.confirmed) {
		const error = new Error('El usuario no ha sido confirmado');
		return res.status(403).json({ message: error.message });
	}

	try {
		const { name, email, _id } = currentUser;

		res.json({ name, email, _id, token: generateJWT(_id) });
	} catch (error) {
		console.log(
			'🚀 ~ file: userControllers.js ~ authenticateUser ~ error:',
			error
		);

		res.status(500).json({ message: 'Error al autenticar el usuario.' });
	}
};

const confirmUser = async (req, res) => {
	const currentUser = await User.findOne({ token: req.params.token });

	if (!currentUser) {
		const error = new Error('El token no existe');
		return res.status(404).json({ message: error.message });
	}

	try {
		currentUser.confirmed = true;
		currentUser.token = '';

		await currentUser.save();

		return res.json({ message: 'Usuario confirmado exitosamente' });
	} catch (error) {
		console.log('🚀 ~ file: userControllers.js ~ confirmUser ~ error:', error);

		res.status(500).json({ message: 'Error al confirmar el usuario.' });
	}
};

const forgotPassword = async (req, res) => {
	const { email } = req.body;

	if (!email) {
		const error = new Error('El email es obligatorio');
		return res.status(404).json({ message: error.message });
	}

	const currentUser = await User.findOne({ email });

	if (!currentUser) {
		const error = new Error('El usuario o email no existe');
		return res.status(404).json({ message: error.message });
	}

	console.log(currentUser);

	try {
		currentUser.token = generateId();
		await currentUser.save();

		const { name, token } = currentUser;

		forgotPasswordEmail({ email, name, token });

		return res.json({
			message:
				'Te hemos enviado un email con las instrucciones para restablecer tu password',
		});
	} catch (error) {
		console.log(
			'🚀 ~ file: userControllers.js ~ forgotPassword ~ error:',
			error
		);

		res.status(500).json({
			message:
				'Error al generar token de autenticación para permitir cambio de contraseña.',
		});
	}
};

const confirmForgotPasswordToken = async (req, res) => {
	const { token } = req.params;

	const currentUser = await User.findOne({ token });

	if (!currentUser) {
		const error = new Error('El token no existe');
		return res.status(404).json({ message: error.message });
	}

	try {
		return res.json({ message: 'Token validado' });
	} catch (error) {
		console.log(
			'🚀 ~ file: userControllers.js ~ confirmForgotPasswordToken ~ error:',
			error
		);

		res.status(500).json({
			message: 'Error al confirmar token para cambiar la contraseña.',
		});
	}
};

const changePassword = async (req, res) => {
	const { token } = req.params;
	const { password } = req.body;

	const currentUser = await User.findOne({ token });

	if (!currentUser) {
		const error = new Error('El token no existe');
		return res.status(404).json({ message: error.message });
	}

	if (!password) {
		const error = new Error('El password es obligatorio');
		return res.status(404).json({ message: error.message });
	}

	try {
		currentUser.password = password;
		currentUser.token = '';
		await currentUser.save();

		return res.json({ message: 'Password restablecido exitosamente' });
	} catch (error) {
		console.log(
			'🚀 ~ file: userControllers.js ~ changePassword ~ error:',
			error
		);

		res.status(500).json({ message: 'Error al cambiar contraseña.' });
	}
};

const profile = (req, res) => {
	const { user } = req;

	return res.json(user);
};

const getUser = async (req, res) => {
	const { email } = req.params;

	try {
		const storedUser = await User.findOne({ email }, 'name email _id');

		if (!storedUser) {
			const error = new Error('El usuario no existe');

			return res.status(404).json({ message: error.message });
		}

		res.json(storedUser);
	} catch (error) {
		console.log('🚀 ~ file: userControllers.js ~ getUser ~ error:', error);
	}
};

export {
	createUser,
	authenticateUser,
	confirmUser,
	forgotPassword,
	confirmForgotPasswordToken,
	changePassword,
	profile,
	getUser,
};
