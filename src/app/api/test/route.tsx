import { logger } from '@server/lib/logger';

export async function GET() {
    logger.debug('test debug!');
    logger.info('test info!', {
        someData: [
            12,
            true,
            null,
            {
                foo: 'bar',
                baz: 2,
            },
        ],
    });
    logger.warn('test warn!');
    logger.error('test error! from log');
    throw new Error('test error! that is thrown');
    return new Response('Hello, world!');
}
