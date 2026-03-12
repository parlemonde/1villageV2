import { getEnvVariable } from '@server/lib/get-env-variable';
import type { Transporter } from 'nodemailer';
import nodemailer from 'nodemailer';

let _transporter: Transporter | null = null;

export const getTransporter = async () => {
    if (_transporter) {
        return _transporter;
    }

    const host = getEnvVariable('NODEMAILER_HOST');
    const port = getEnvVariable('NODEMAILER_PORT');
    const user = getEnvVariable('NODEMAILER_USER');
    const password = getEnvVariable('NODEMAILER_PASS');

    if (!user || !password) {
        const testAccount = await nodemailer.createTestAccount();
        console.log('Created test account:');
        console.log('  User: %s', testAccount.user);
        console.log('  Pass: %s', testAccount.pass);
        _transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        return _transporter;
    }

    _transporter = nodemailer.createTransport({
        host: host ?? 'smtp.ethereal.email',
        port: port ? Number(port) : 587,
        secure: port === '465',
        auth: {
            user: user,
            pass: password,
        },
    });
    return _transporter;
};
