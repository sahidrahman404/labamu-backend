import { ConfigService } from '@/common/config-service';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Effect, Layer, Redacted } from 'effect';
import { NodeSdk } from '@effect/opentelemetry';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';

export const OtelLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const { otel, appEnv } = yield* ConfigService;

    if (!otel.observabilityEnabled) {
      return Layer.empty;
    }

    const headers: Record<string, string> = {};
    const tokenValue = Redacted.value(otel.token);
    if (tokenValue) {
      headers.Authorization = `Bearer ${tokenValue}`;
    }
    if (otel.dataset) {
      headers[otel.headers] = otel.dataset;
    }

    const traceExporter = new OTLPTraceExporter(
      Object.keys(headers).length > 0
        ? {
            url: `${otel.exporterUrl}/v1/traces`,
            headers,
          }
        : {
            url: `${otel.exporterUrl}/v1/traces`,
          },
    );

    const logExporter = new OTLPLogExporter(
      Object.keys(headers).length > 0
        ? {
            url: `${otel.exporterUrl}/v1/logs`,
            headers,
          }
        : {
            url: `${otel.exporterUrl}/v1/logs`,
          },
    );

    return NodeSdk.layer(() => ({
      resource: {
        serviceName: otel.serviceName,
        serviceVersion: otel.serviceVersion,
        attributes: {
          'deployment.environment': appEnv,
        },
      },
      spanProcessor: new BatchSpanProcessor(traceExporter),
      logRecordProcessor: new SimpleLogRecordProcessor(logExporter),
    }));
  }),
);
