// All Environment Variables should be defined here
// Use empty string if the variable can't have a default value
const DEFAULT_ENV_VARIABLES = {
    BETTER_AUTH_SECRET: '01234567890123456789012345678901',
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
    S3_BUCKET_NAME: '',
    NODEMAILER_HOST: 'smtp.ethereal.email',
    NODEMAILER_PORT: '587',
    NODEMAILER_USER: '',
    NODEMAILER_PASS: '',
    TRANSCODE_VIDEOS_LAMBDA_URL: 'http://localhost:9000',
    TRANSCODE_VIDEOS_LAMBDA_FUNCTION_NAME: 'server-transcode-videos',
    OPEN_WEATHER_APP_ID: '979023fcb2e0e3856a982a4e9608a3fa',
};

export const getEnvVariable = (variable: keyof typeof DEFAULT_ENV_VARIABLES): string => {
    return process.env[variable] || DEFAULT_ENV_VARIABLES[variable];
};
