import type { AnyValue, AnyValueMap } from '@opentelemetry/api-logs';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';

import { getEnvVariable } from './get-env-variable';

function log(kind: 'info' | 'error' | 'warn' | 'debug', message: AnyValue, attributes?: AnyValueMap) {
    if (getEnvVariable('NODE_ENV') !== 'production') {
        if (attributes !== undefined) {
            // eslint-disable-next-line no-console
            console[kind](message, attributes);
        } else {
            // eslint-disable-next-line no-console
            console[kind](message);
        }
    } else {
        const logger = logs.getLogger('default');
        logger.emit({
            severityNumber:
                kind === 'info'
                    ? SeverityNumber.INFO
                    : kind === 'error'
                      ? SeverityNumber.ERROR
                      : kind === 'warn'
                        ? SeverityNumber.WARN
                        : SeverityNumber.DEBUG,
            body: message,
            attributes,
        });
    }
}

export const logger = {
    info: (message: AnyValue, attributes?: AnyValueMap) => log('info', message, attributes),
    error: (message: AnyValue, attributes?: AnyValueMap) => log('error', message, attributes),
    warn: (message: AnyValue, attributes?: AnyValueMap) => log('warn', message, attributes),
    debug: (message: AnyValue, attributes?: AnyValueMap) => log('debug', message, attributes),
};
