import { getEnvVariable } from '@server/lib/get-env-variable';
import { logger } from '@server/lib/logger';

import { getAwsClient } from './aws-client';

type TranscodeVideosLambdaEvent =
    | {
          filePath: string;
      }
    | {
          key: string;
          bucket: string;
      };
export const invokeTranscodeVideosLambda = async (event: TranscodeVideosLambdaEvent): Promise<boolean> => {
    const lambdaUrl = getEnvVariable('TRANSCODE_VIDEOS_LAMBDA_URL');
    if (!lambdaUrl) {
        return false;
    }
    try {
        const client = getAwsClient();
        const response = client.fetch(`${lambdaUrl}/2015-03-31/functions/${getEnvVariable('TRANSCODE_VIDEOS_LAMBDA_FUNCTION_NAME')}/invocations`, {
            headers: {
                'X-Amz-Invocation-Type': 'Event',
            },
            body: JSON.stringify(event),
        });
        await response;
        return true;
    } catch (error) {
        logger.error(error);
        return false;
    }
};
