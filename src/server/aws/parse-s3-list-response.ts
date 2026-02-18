export type S3ListResponse = {
    Contents?: Array<{ Key: string }>;
    CommonPrefixes?: Array<{ Prefix: string }>;
    IsTruncated: boolean;
    NextContinuationToken?: string;
};

export function parseS3ListResponse(xml: string): S3ListResponse {
    const getTagContent = (tag: string, text: string): string | null => {
        const match = text.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
        return match ? match[1] : null;
    };

    const getBlocks = (tag: string, text: string): string[] => {
        const regex = new RegExp(`<${tag}>[\\s\\S]*?</${tag}>`, 'g');
        const results: string[] = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
            results.push(match[0]);
        }
        return results;
    };

    const contents = getBlocks('Contents', xml).map((block) => ({
        Key: getTagContent('Key', block) || '',
    }));

    const commonPrefixes = getBlocks('CommonPrefixes', xml).map((block) => ({
        Prefix: getTagContent('Prefix', block) || '',
    }));

    return {
        Contents: contents.length > 0 ? contents : undefined,
        CommonPrefixes: commonPrefixes.length > 0 ? commonPrefixes : undefined,
        IsTruncated: getTagContent('IsTruncated', xml) === 'true',
        NextContinuationToken: getTagContent('NextContinuationToken', xml) || undefined,
    };
}
