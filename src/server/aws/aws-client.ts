import { getEnvVariable } from '@server/lib/get-env-variable';
import { registerService } from '@server/lib/register-service';
import { AwsClient } from 'aws4fetch';

let awsClient: AwsClient | undefined;
export function getAwsClient(): AwsClient {
    if (!awsClient) {
        awsClient = registerService(
            'aws-client',
            () =>
                new AwsClient({
                    accessKeyId: getEnvVariable('AWS_ACCESS_KEY_ID'),
                    secretAccessKey: getEnvVariable('AWS_SECRET_ACCESS_KEY'),
                    sessionToken: getEnvVariable('AWS_SESSION_TOKEN'),
                    region: getEnvVariable('AWS_REGION'),
                }),
        );
    }
    return awsClient;
}
