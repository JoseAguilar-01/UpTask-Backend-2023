import nodemailer from 'nodemailer';

const config = {
	service: 'gmail',
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
        <p>Hola: ${name}. Aquí está tu código de verficación.</p>

        <p>
        Utiliza el siguiente código para confirmar tu cuenta: ${token}
        </p>

		<p>Si tú no solicitaste este código, puedes ignorar este mensaje.</p>
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
