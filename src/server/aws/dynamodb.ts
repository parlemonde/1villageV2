import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { getEnvVariable } from '@server/lib/get-env-variable';

import { getAwsClient } from './aws-client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isAttributeItemObject = (value: unknown): value is { Item: any } => {
    return typeof value === 'object' && value !== null && 'Item' in value;
};

const DYNAMO_DB_URL = getEnvVariable('DYNAMODB_ENDPOINT');
const DYNAMO_DB_TABLE = getEnvVariable('DYNAMODB_TABLE_NAME');
export async function getDynamoDBItem<T>(key: string): Promise<T | undefined> {
    try {
        const aws = getAwsClient();
        const response = await aws.fetch(DYNAMO_DB_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-amz-json-1.0',
                'X-Amz-Target': 'DynamoDB_20120810.GetItem',
            },
            body: JSON.stringify({
                TableName: DYNAMO_DB_TABLE,
                Key: {
                    key: { S: key },
                },
            }),
        });
        const data = await response.json();

        return isAttributeItemObject(data) ? unmarshall(data.Item).value : undefined;
    } catch (e) {
        console.error(e);
        return undefined;
    }
}

export async function deleteDynamoDBItem(key: string): Promise<void> {
    try {
        const aws = getAwsClient();
        await aws.fetch(DYNAMO_DB_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-amz-json-1.0',
                'X-Amz-Target': 'DynamoDB_20120810.DeleteItem',
            },
            body: JSON.stringify({
                TableName: DYNAMO_DB_TABLE,
                Key: {
                    key: { S: key },
                },
            }),
        });
    } catch (e) {
        console.error(e);
    }
}

export async function deleteDynamoDBItems(keys: string[]): Promise<void> {
    try {
        const aws = getAwsClient();
        await aws.fetch(DYNAMO_DB_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-amz-json-1.0',
                'X-Amz-Target': 'DynamoDB_20120810.BatchWriteItem',
            },
            body: JSON.stringify({
                RequestItems: {
                    [DYNAMO_DB_TABLE]: keys.map((key) => ({
                        DeleteRequest: {
                            Key: { key: { S: key } },
                        },
                    })),
                },
            }),
        });
    } catch (e) {
        console.error(e);
    }
}

export async function updateDynamoDBItem<T>(key: string, value: T): Promise<void> {
    try {
        const aws = getAwsClient();
        await aws.fetch(DYNAMO_DB_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-amz-json-1.0',
                'X-Amz-Target': 'DynamoDB_20120810.PutItem',
            },
            body: JSON.stringify({
                TableName: DYNAMO_DB_TABLE,
                Item: marshall({
                    key: key,
                    value: JSON.parse(JSON.stringify(value)), // Deep clone to remove undefined values and class instances
                }),
            }),
        });
    } catch (e) {
        console.error(e);
    }
}

export async function setDynamoDBItem<T>(key: string, value: T | undefined): Promise<void> {
    if (value === undefined) {
        await deleteDynamoDBItem(key);
    } else {
        await updateDynamoDBItem(key, value);
    }
}

export async function scanDynamoDB<T>(query: {
    filterExpression: string;
    expressionAttributeNames?: Record<string, string>;
    expressionAttributeValues?: Record<string, unknown>;
}): Promise<
    {
        key: string;
        value: T;
    }[]
> {
    try {
        const aws = getAwsClient();
        const response = await aws.fetch(DYNAMO_DB_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-amz-json-1.0',
                'X-Amz-Target': 'DynamoDB_20120810.Scan',
            },
            body: JSON.stringify({
                TableName: DYNAMO_DB_TABLE,
                FilterExpression: query.filterExpression,
                ExpressionAttributeValues: query.expressionAttributeValues ? marshall(query.expressionAttributeValues) : undefined,
                ExpressionAttributeNames: query.expressionAttributeNames,
            }),
        });
        const data = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.Items.map((item: any) => unmarshall(item));
    } catch (e) {
        console.error(e);
        return [];
    }
}
