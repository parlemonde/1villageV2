import type { AnyValue, AnyValueMap } from '@opentelemetry/api-logs';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';

import { getEnvVariable } from './get-env-variable';

const isAnyValue = (value: unknown): value is AnyValue => {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || Array.isArray(value) || typeof value === 'object';
};
const isAnyValueMap = (value?: Record<string, unknown>): value is AnyValueMap => {
    return value !== undefined && Object.values(value).every(isAnyValue);
};

function log(kind: 'info' | 'error' | 'warn' | 'debug', message: unknown, attributes?: Record<string, unknown>) {
    if (typeof window === 'undefined' && getEnvVariable('NODE_ENV') === 'production' && isAnyValue(message)) {
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
            attributes: isAnyValueMap(attributes) ? attributes : undefined,
        });
    } else if (attributes !== undefined) {
        // eslint-disable-next-line no-console
        console[kind](message, attributes);
    } else {
        // eslint-disable-next-line no-console
        console[kind](message);
    }
}

export const logger = {
    info: (message: unknown, attributes?: Record<string, unknown>) => log('info', message, attributes),
    error: (message: unknown, attributes?: Record<string, unknown>) => log('error', message, attributes),
    warn: (message: unknown, attributes?: Record<string, unknown>) => log('warn', message, attributes),
    debug: (message: unknown, attributes?: Record<string, unknown>) => log('debug', message, attributes),
};
