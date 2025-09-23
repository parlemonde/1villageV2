// All Environment Variables should be defined here
// Use empty string if the variable can't have a default value
const DEFAULT_ENV_VARIABLES = {
    BETTER_AUTH_SECRET: '1234',
    BETTER_AUTH_URL: 'http://localhost:3000',
    HOST_URL: 'http://localhost:3000',
    ADMIN_PASSWORD: 'Admin1234',
    ADMIN_EMAIL: 'admin@example.org',
    DATABASE_URL: 'postgresql://postgres:example@localhost:5432/un_village',
    CLIENT_ID: '',
    CLIENT_SECRET: '',
    AWS_ACCESS_KEY_ID: 'local',
    AWS_SECRET_ACCESS_KEY: 'local',
    AWS_SESSION_TOKEN: '',
    AWS_REGION: 'local',
    DYNAMODB_TABLE_NAME: '1village',
    DYNAMODB_ENDPOINT: 'http://localhost:8000',
    S3_BUCKET_NAME: '1village',
    NODEMAILER_HOST: 'smtp.ethereal.email',
    NODEMAILER_PORT: '587',
    NODEMAILER_USER: '',
    NODEMAILER_PASS: '',
};

export const getEnvVariable = (variable: keyof typeof DEFAULT_ENV_VARIABLES): string => {
    return process.env[variable] || DEFAULT_ENV_VARIABLES[variable];
};
