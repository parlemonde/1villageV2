import { registerService } from '@server/lib/register-service';
import { AwsClient } from 'aws4fetch';

let awsClient: AwsClient | undefined;
export function getAwsClient(): AwsClient {
    if (!awsClient) {
        awsClient = registerService(
            'aws-client',
            () =>
                new AwsClient({
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
                    sessionToken: process.env.AWS_SESSION_TOKEN || undefined,
                    region: process.env.AWS_REGION,
                }),
        );
    }
    return awsClient;
}
