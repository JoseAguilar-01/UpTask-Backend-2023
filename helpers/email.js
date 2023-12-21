import nodemailer from 'nodemailer';

const config = {
	port: process.env.EMAIL_SERVICE_PORT,
	host: process.env.EMAIL_SERVICE_HOST,
	auth: {
		user: process.env.EMAIL_SERVICE_USER,
		pass: process.env.EMAIL_SERVICE_PASS,
	},
};

export const registerEmail = (data) => {
	const { email, name, token } = data;

	const transport = nodemailer.createTransport(config);

	transport.sendMail({
		from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
		to: email,
		subject: 'Uptask - Confirma tu cuenta',
		html: `
        <p>Hola: ${name}. Confirma tu cuenta para empezar a gestionar tus proyectos.</p>

        <p>
        Ya casi terminas, solo falta que sigas el siguiente link para confirmar tu cuenta:
        <a href='${process.env.FRONTEND_URL}/confirm/${token}'>Cofirma tu cuenta</a>
        </p>

		<p>Si tú no creaste esta cuenta, puedes ignorar este mensaje.</p>
        `,
	});
};

export const forgotPasswordEmail = (data) => {
	const { email, name, token } = data;

	const transport = nodemailer.createTransport(config);

	transport.sendMail({
		from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
		to: email,
		subject: 'Uptask - Reestablece tu contraseña',
		html: `
        <p>Hola: ${name}, has solicitado reestablecer tu contraseña.</p>

        <p>
        Ya casi terminas, solo falta que sigas el siguiente link:
        <a href='${process.env.FRONTEND_URL}/forgot-password/${token}'>Reestablecer contraseña</a>
        </p>

		<p>Si tú no solicitaste esta acción, puedes ignorar este mensaje.</p>
        `,
	});
};
