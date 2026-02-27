import { ROOT_CONTEXT, trace } from '@opentelemetry/api';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';
import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { getEnvVariable } from '@server/lib/get-env-variable';
import { registerOTel } from '@vercel/otel';
import { type Instrumentation } from 'next';

/**
 * Custom OTLPTraceExporter that emits structured logs for request handler spans
 */
class LoggingOTLPTraceExporter extends OTLPTraceExporter {
    override export(spans: ReadableSpan[], resultCallback: (result: { code: number; error?: Error }) => void): void {
        for (const span of spans) {
            if (span.attributes['next.span_type'] === 'BaseServer.handleRequest') {
                this.emitRequestLog(span);
            }
        }
        super.export(spans, resultCallback);
    }

    private emitRequestLog(span: ReadableSpan): void {
        const logger = logs.getLogger('default');
        const spanContext = span.spanContext();

        // Create a context with the span's trace context for log correlation
        const logContext = trace.setSpanContext(ROOT_CONTEXT, spanContext);

        // Convert span endTime [seconds, nanoseconds] to Date for the log timestamp
        const timestamp = new Date(span.endTime[0] * 1000 + span.endTime[1] / 1e6);

        // Calculate duration in milliseconds
        const startMs = span.startTime[0] * 1000 + span.startTime[1] / 1e6;
        const endMs = span.endTime[0] * 1000 + span.endTime[1] / 1e6;
        const durationMs = endMs - startMs;

        // Determine severity based on status code
        const statusCode = span.attributes['http.status_code'] as number | undefined;
        let severityNumber = SeverityNumber.INFO;
        if (statusCode && statusCode >= 500) {
            severityNumber = SeverityNumber.ERROR;
        } else if (statusCode && statusCode >= 400) {
            severityNumber = SeverityNumber.WARN;
        }

        const method = span.attributes['http.method'];
        const target = span.attributes['http.target'];
        logger.emit({
            context: logContext,
            timestamp,
            severityNumber,
            body: `${method} ${target} ${statusCode ?? '-'} ${durationMs.toFixed(2)}ms`,
            attributes: {
                // HTTP attributes
                'http.method': span.attributes['http.method'] as string,
                'http.target': span.attributes['http.target'] as string,
                'http.route': span.attributes['http.route'] as string,
                'http.status_code': statusCode ?? 0,

                // Timing
                'duration.ms': durationMs,

                // Next.js specific
                'next.span_name': span.attributes['next.span_name'] as string,
                'next.route': span.attributes['next.route'] as string,
                'next.rsc': span.attributes['next.rsc'] as boolean,

                // Operation info
                'operation.name': span.attributes['operation.name'] as string,
                'resource.name': span.attributes['resource.name'] as string,

                // CloudFront viewer attributes
                'viewer.country': span.attributes['viewer.country'] as string,
                'viewer.country_region': span.attributes['viewer.country_region'] as string,
                'viewer.country_region_name': span.attributes['viewer.country_region_name'] as string,
                'viewer.city': span.attributes['viewer.city'] as string,
                'viewer.latitude': span.attributes['viewer.latitude'] as string,
                'viewer.longitude': span.attributes['viewer.longitude'] as string,
                'viewer.time_zone': span.attributes['viewer.time_zone'] as string,
                'viewer.address': span.attributes['viewer.address'] as string,
                'viewer.asn': span.attributes['viewer.asn'] as string,
                'viewer.is_desktop': span.attributes['viewer.is_desktop'] as string,
                'viewer.is_mobile': span.attributes['viewer.is_mobile'] as string,
                'viewer.is_tablet': span.attributes['viewer.is_tablet'] as string,
                'viewer.is_smarttv': span.attributes['viewer.is_smarttv'] as string,
            },
        });
    }
}

export function register() {
    if (getEnvVariable('NODE_ENV') !== 'production') {
        return;
    }
    registerOTel({
        serviceName: '1village-v2',
        traceExporter: new LoggingOTLPTraceExporter({
            // Default OTLP HTTP endpoint - configurable via OTEL_EXPORTER_OTLP_ENDPOINT env var
            url: `${getEnvVariable('OTEL_EXPORTER_OTLP_ENDPOINT')}/v1/traces`,
        }),
        attributesFromHeaders: {
            'viewer.country': 'CloudFront-Viewer-Country',
            'viewer.country_region': 'CloudFront-Viewer-Country-Region',
            'viewer.country_region_name': 'CloudFront-Viewer-Country-Region-Name',
            'viewer.city': 'CloudFront-Viewer-City',
            'viewer.latitude': 'CloudFront-Viewer-Latitude',
            'viewer.longitude': 'CloudFront-Viewer-Longitude',
            'viewer.time_zone': 'CloudFront-Viewer-Time-Zone',
            'viewer.address': 'CloudFront-Viewer-Address',
            'viewer.asn': 'CloudFront-Viewer-ASN',
            'viewer.is_desktop': 'CloudFront-Is-Desktop-Viewer',
            'viewer.is_mobile': 'CloudFront-Is-Mobile-Viewer',
            'viewer.is_tablet': 'CloudFront-Is-Tablet-Viewer',
            'viewer.is_smarttv': 'CloudFront-Is-SmartTV-Viewer',
        },
        instrumentations: [new PgInstrumentation()],
    });
    registerLogs();
}

function registerLogs() {
    if (getEnvVariable('NEXT_RUNTIME') !== 'nodejs') {
        return;
    }
    const resource = resourceFromAttributes({
        [ATTR_SERVICE_NAME]: '1village-v2',
    });
    const loggerProvider = new LoggerProvider({
        resource,
        processors: [
            new BatchLogRecordProcessor(
                new OTLPLogExporter({
                    url: `${getEnvVariable('OTEL_EXPORTER_OTLP_ENDPOINT')}/v1/logs`,
                }),
            ),
        ],
    });
    logs.setGlobalLoggerProvider(loggerProvider);
}

// Log errors from Next.js API routes, server components, and server actions
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
    if (getEnvVariable('NODE_ENV') !== 'production' || getEnvVariable('NEXT_RUNTIME') !== 'nodejs') {
        return;
    }
    const logger = logs.getLogger('default');
    const err = error instanceof Error ? error : new Error(String(error));
    const digest = error && typeof error === 'object' && 'digest' in error ? String(error.digest) : '';
    logger.emit({
        severityNumber: SeverityNumber.ERROR,
        body: err.message,
        attributes: {
            'exception.type': err.name,
            'exception.message': err.message,
            'exception.stacktrace': err.stack ?? '',
            'exception.digest': digest,
            'error.kind': 'nextjs.requestError',
            'http.method': request.method,
            'http.route': request.path,
            'nextjs.router_kind': context.routerKind,
            'nextjs.route_path': context.routePath ?? '',
            'nextjs.route_type': context.routeType,
        },
    });
};
