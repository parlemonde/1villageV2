import { getEnvVariable } from '@server/lib/get-env-variable';

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
    try {
        const client = getAwsClient();
        const response = client.fetch(
            `${getEnvVariable('TRANSCODE_VIDEOS_LAMBDA_URL')}/2015-03-31/functions/${getEnvVariable('TRANSCODE_VIDEOS_LAMBDA_FUNCTION_NAME')}/invocations`,
            {
                headers: {
                    'X-Amz-Invocation-Type': 'Event',
                },
                body: JSON.stringify(event),
            },
        );
        // Do not await the response if we are using the local lambda
        if (getEnvVariable('TRANSCODE_VIDEOS_LAMBDA_URL') === 'http://localhost:9000') {
            response.catch(console.error);
        } else {
            await response;
        }
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};
