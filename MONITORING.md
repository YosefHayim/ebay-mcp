# Production Monitoring Guide

This guide provides comprehensive monitoring strategies, logging best practices, and observability solutions for production deployments of the eBay API MCP Server.

## Table of Contents

- [Monitoring Overview](#monitoring-overview)
- [Metrics Collection](#metrics-collection)
- [Logging Strategy](#logging-strategy)
- [Alerting & Notifications](#alerting--notifications)
- [Health Checks](#health-checks)
- [Error Tracking](#error-tracking)
- [Performance Monitoring](#performance-monitoring)
- [Security Monitoring](#security-monitoring)
- [Dashboards](#dashboards)
- [Troubleshooting](#troubleshooting)

---

## Monitoring Overview

### Why Monitor?

1. **Detect Issues Early** - Identify problems before users report them
2. **Performance Optimization** - Track bottlenecks and optimize accordingly
3. **Capacity Planning** - Forecast resource needs based on usage trends
4. **Security** - Detect anomalies and potential security threats
5. **Compliance** - Meet SLA/uptime requirements

### Key Observability Pillars

| Pillar | Purpose | Tools |
|--------|---------|-------|
| **Metrics** | Quantitative data (CPU, memory, request rate) | Prometheus, Datadog, CloudWatch |
| **Logs** | Detailed event records (errors, requests) | Winston, Pino, ELK Stack |
| **Traces** | Request flow across services | OpenTelemetry, Jaeger, Zipkin |
| **Alerts** | Proactive issue notifications | PagerDuty, Slack, Email |

---

## Metrics Collection

### Core Metrics to Track

#### 1. Application Metrics

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| **Request Rate** | Requests per second | Varies | >1000 req/s (capacity) |
| **Request Latency** | Response time (p50, p95, p99) | <300ms p95 | >1000ms p99 |
| **Error Rate** | Failed requests / total requests | <1% | >5% for 5 minutes |
| **Token Refresh Rate** | OAuth token refreshes/hour | <1/hour | >5/hour (potential issue) |
| **Rate Limit Usage** | % of eBay rate limit consumed | <80% | >90% (approaching limit) |

#### 2. System Metrics

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| **CPU Usage** | % CPU utilization | <70% | >85% for 5 minutes |
| **Memory Usage** | Heap + RSS memory | <80% | >90% for 5 minutes |
| **Event Loop Lag** | Node.js event loop delay | <10ms | >100ms |
| **File Descriptors** | Open file handles | <80% | >90% of limit |
| **Disk I/O** | Token file read/write rate | <10/min | >100/min |

#### 3. Business Metrics

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| **Active Users** | Concurrent authenticated users | Varies | Sudden 50% drop |
| **Orders Processed** | Orders/hour | Varies | 50% deviation from baseline |
| **Inventory Updates** | Updates/hour | Varies | Complete absence (system down) |
| **Failed Authentications** | Failed OAuth attempts | <5% | >20% (potential attack) |

### Implementing Prometheus Metrics

Install dependencies:

```bash
npm install prom-client
```

Create metrics file (`src/monitoring/metrics.ts`):

```typescript
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

// Create registry
export const register = new Registry();

// Request metrics
export const httpRequestDuration = new Histogram({
  name: 'ebay_mcp_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

export const httpRequestTotal = new Counter({
  name: 'ebay_mcp_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// eBay API metrics
export const ebayApiCallDuration = new Histogram({
  name: 'ebay_api_call_duration_seconds',
  help: 'Duration of eBay API calls',
  labelNames: ['api', 'method', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

export const ebayApiCallTotal = new Counter({
  name: 'ebay_api_calls_total',
  help: 'Total eBay API calls',
  labelNames: ['api', 'method', 'status'],
  registers: [register],
});

export const ebayApiErrorsTotal = new Counter({
  name: 'ebay_api_errors_total',
  help: 'Total eBay API errors',
  labelNames: ['api', 'error_type'],
  registers: [register],
});

// Rate limit metrics
export const ebayRateLimitRemaining = new Gauge({
  name: 'ebay_rate_limit_remaining',
  help: 'Remaining eBay API calls',
  labelNames: ['token_type'],
  registers: [register],
});

// Token metrics
export const tokenRefreshTotal = new Counter({
  name: 'ebay_token_refresh_total',
  help: 'Total OAuth token refreshes',
  labelNames: ['status'],
  registers: [register],
});

// System metrics (optional - use default collectors)
import { collectDefaultMetrics } from 'prom-client';
collectDefaultMetrics({ register, prefix: 'ebay_mcp_' });
```

Add metrics endpoint to HTTP server (`src/server-http.ts`):

```typescript
import { register } from './monitoring/metrics.js';

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

Instrument API calls (`src/api/client.ts`):

```typescript
import { ebayApiCallDuration, ebayApiCallTotal, ebayApiErrorsTotal } from '@/monitoring/metrics.js';

// In request interceptor
axiosInstance.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

// In response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    const duration = (Date.now() - response.config.metadata.startTime) / 1000;
    ebayApiCallDuration.labels(response.config.url, response.config.method, response.status).observe(duration);
    ebayApiCallTotal.labels(response.config.url, response.config.method, response.status).inc();
    return response;
  },
  (error) => {
    ebayApiErrorsTotal.labels(error.config?.url || 'unknown', error.response?.status || 'network_error').inc();
    throw error;
  }
);
```

---

## Logging Strategy

### Log Levels

| Level | Usage | Example | Retention |
|-------|-------|---------|-----------|
| **ERROR** | Critical failures requiring immediate attention | Token refresh failed, API 500 errors | 30 days |
| **WARN** | Potential issues, degraded performance | Rate limit approaching, slow API response | 14 days |
| **INFO** | Normal business events | User authenticated, order created | 7 days |
| **DEBUG** | Detailed diagnostic information | Request/response payloads, token validation | 2 days (dev only) |

### Structured Logging with Pino

Install dependencies:

```bash
npm install pino pino-pretty
```

Create logger (`src/monitoring/logger.ts`):

```typescript
import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  serializers: {
    // Redact sensitive data
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        ...req.headers,
        authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      },
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
});

// Request ID middleware (Express)
export function requestIdMiddleware(req, res, next) {
  req.id = req.headers['x-request-id'] || `${Date.now()}-${Math.random().toString(36)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
}
```

Usage examples:

```typescript
import { logger } from './monitoring/logger.js';

// Info log
logger.info({ userId: 'user123', action: 'create_inventory' }, 'User created inventory item');

// Warning log
logger.warn({ rateLimit: 450, threshold: 500 }, 'Approaching rate limit');

// Error log
logger.error({ err: error, sku: 'ABC123' }, 'Failed to update inventory');

// Request logging (with Express)
app.use((req, res, next) => {
  logger.info({ req }, 'Incoming request');
  res.on('finish', () => {
    logger.info({ req, res }, 'Request completed');
  });
  next();
});
```

### Log Aggregation (Production)

**Option 1: ELK Stack** (Elasticsearch, Logstash, Kibana)

```bash
# Ship logs to Logstash
npm install pino-logstash
```

```typescript
import pino from 'pino';

export const logger = pino({
  transport: {
    target: 'pino-logstash',
    options: {
      host: 'logstash.example.com',
      port: 5000,
      mode: 'tcp',
    },
  },
});
```

**Option 2: Datadog**

```bash
npm install dd-trace pino-datadog
```

**Option 3: CloudWatch (AWS)**

```bash
npm install aws-sdk
```

Ship logs to CloudWatch:

```typescript
import AWS from 'aws-sdk';

const cloudwatchlogs = new AWS.CloudWatchLogs({ region: 'us-east-1' });

async function sendToCloudWatch(logEvent) {
  await cloudwatchlogs.putLogEvents({
    logGroupName: '/ebay-mcp-server',
    logStreamName: process.env.HOSTNAME,
    logEvents: [
      {
        message: JSON.stringify(logEvent),
        timestamp: Date.now(),
      },
    ],
  }).promise();
}
```

---

## Alerting & Notifications

### Alert Rules

#### Critical Alerts (Page immediately)

1. **Service Down**
   - Condition: Health check fails for 2 minutes
   - Action: Page on-call engineer via PagerDuty

2. **High Error Rate**
   - Condition: Error rate >10% for 5 minutes
   - Action: Page on-call engineer

3. **Token Refresh Failures**
   - Condition: >3 consecutive token refresh failures
   - Action: Page on-call engineer + notify security team

#### Warning Alerts (Notify but don't page)

1. **High Memory Usage**
   - Condition: Memory >85% for 10 minutes
   - Action: Slack notification to #ops channel

2. **Rate Limit Approaching**
   - Condition: eBay rate limit >90% consumed
   - Action: Slack notification + email to team

3. **Slow API Responses**
   - Condition: p99 latency >2 seconds for 15 minutes
   - Action: Slack notification

### Alert Configuration Examples

**Prometheus AlertManager** (`alertmanager.yml`):

```yaml
route:
  group_by: ['alertname']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'slack-critical'
  routes:
    - match:
        severity: critical
      receiver: pagerduty
    - match:
        severity: warning
      receiver: slack-warnings

receivers:
  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: '<pagerduty-integration-key>'

  - name: 'slack-critical'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/...'
        channel: '#critical-alerts'
        title: 'Critical: {{ .GroupLabels.alertname }}'

  - name: 'slack-warnings'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/...'
        channel: '#ops-warnings'
        title: 'Warning: {{ .GroupLabels.alertname }}'
```

**Prometheus Alert Rules** (`alerts.yml`):

```yaml
groups:
  - name: ebay_mcp_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(ebay_mcp_http_requests_total{status_code=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} (>10%)"

      - alert: HighMemoryUsage
        expr: (ebay_mcp_nodejs_heap_size_used_bytes / ebay_mcp_nodejs_heap_size_total_bytes) > 0.85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}%"

      - alert: RateLimitApproaching
        expr: ebay_rate_limit_remaining < 100
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "eBay rate limit approaching"
          description: "Only {{ $value }} API calls remaining"
```

---

## Health Checks

### Liveness Probe

Checks if the server is running (used by orchestrators like Kubernetes).

```typescript
// src/server-http.ts
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### Readiness Probe

Checks if the server is ready to accept traffic.

```typescript
app.get('/health/ready', async (req, res) => {
  const checks = {
    server: 'ok',
    tokenStorage: await checkTokenStorage(),
    ebayApi: await checkEbayApiConnection(),
  };

  const allHealthy = Object.values(checks).every((status) => status === 'ok');

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ready' : 'not ready',
    checks,
    timestamp: new Date().toISOString(),
  });
});

async function checkTokenStorage() {
  try {
    const tokenPath = '.ebay-mcp-tokens.json';
    await fs.promises.access(tokenPath, fs.constants.R_OK | fs.constants.W_OK);
    return 'ok';
  } catch {
    return 'error';
  }
}

async function checkEbayApiConnection() {
  try {
    // Lightweight API call (e.g., get user info)
    await api.getUser();
    return 'ok';
  } catch {
    return 'error';
  }
}
```

### Kubernetes Health Check Configuration

```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
    - name: ebay-mcp-server
      image: ebay-mcp-server:latest
      ports:
        - containerPort: 3000
      livenessProbe:
        httpGet:
          path: /health/live
          port: 3000
        initialDelaySeconds: 30
        periodSeconds: 10
        timeoutSeconds: 5
        failureThreshold: 3
      readinessProbe:
        httpGet:
          path: /health/ready
          port: 3000
        initialDelaySeconds: 10
        periodSeconds: 5
        timeoutSeconds: 3
        failureThreshold: 2
```

---

## Error Tracking

### Sentry Integration

Install Sentry SDK:

```bash
npm install @sentry/node @sentry/tracing
```

Configure Sentry (`src/monitoring/sentry.ts`):

```typescript
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { Express } from 'express';

export function initSentry(app: Express) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: 0.1, // Sample 10% of transactions
    beforeSend(event, hint) {
      // Redact sensitive data
      if (event.request) {
        delete event.request.headers?.authorization;
        delete event.request.cookies;
      }
      return event;
    },
  });

  // Sentry request handler (must be first middleware)
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

export function initSentryErrorHandler(app: Express) {
  // Sentry error handler (must be before other error middleware)
  app.use(Sentry.Handlers.errorHandler());
}
```

Usage:

```typescript
// In server-http.ts
import { initSentry, initSentryErrorHandler } from './monitoring/sentry.js';

initSentry(app);

// ... routes ...

initSentryErrorHandler(app);

// Manual error capture
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { operation: 'risky_operation' },
    extra: { customData: 'value' },
  });
  throw error;
}
```

---

## Performance Monitoring

### Application Performance Monitoring (APM)

**Option 1: Datadog APM**

```bash
npm install dd-trace
```

```typescript
// Must be first import!
import 'dd-trace/init';

// Rest of your application
import express from 'express';
// ...
```

**Option 2: New Relic**

```bash
npm install newrelic
```

```typescript
// Must be first require!
require('newrelic');

// Rest of your application
```

**Option 3: OpenTelemetry** (vendor-neutral)

```bash
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
```

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: 'http://localhost:14268/api/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

---

## Security Monitoring

### Track Security Events

```typescript
import { logger } from './monitoring/logger.js';

// Failed authentication attempts
let failedAuthAttempts = 0;

app.use((req, res, next) => {
  if (req.path === '/oauth/token' && res.statusCode === 401) {
    failedAuthAttempts++;
    logger.warn({ ip: req.ip, failedAttempts: failedAuthAttempts }, 'Failed authentication attempt');

    if (failedAuthAttempts > 10) {
      logger.error({ ip: req.ip }, 'Possible brute force attack detected');
      // Trigger alert
    }
  }
  next();
});

// Suspicious token usage
function monitorTokenUsage(tokenInfo) {
  if (tokenInfo.requestsInLastMinute > 1000) {
    logger.warn({ tokenInfo }, 'Abnormally high API usage detected');
  }
}
```

### Rate Limiting Monitoring

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  handler: (req, res) => {
    logger.warn({ ip: req.ip }, 'Rate limit exceeded');
    res.status(429).json({ error: 'Too many requests' });
  },
});

app.use('/api/', limiter);
```

---

## Dashboards

### Grafana Dashboard Example

**Panels to Include**:

1. **Request Rate** - Line graph showing requests/sec over time
2. **Error Rate** - Line graph showing error percentage
3. **Response Times** - Heatmap showing p50/p95/p99 latencies
4. **Memory Usage** - Area chart showing heap usage
5. **Rate Limit Status** - Gauge showing remaining API calls
6. **Active Users** - Single stat showing concurrent users
7. **Top Errors** - Table showing most common error messages

**Sample Dashboard JSON** (import into Grafana):

```json
{
  "dashboard": {
    "title": "eBay MCP Server Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(ebay_mcp_http_requests_total[5m])",
            "legendFormat": "{{ method }} {{ route }}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(ebay_mcp_http_requests_total{status_code=~\"5..\"}[5m]) / rate(ebay_mcp_http_requests_total[5m])",
            "legendFormat": "Error Rate"
          }
        ],
        "type": "graph"
      }
    ]
  }
}
```

---

## Troubleshooting

### Common Monitoring Issues

#### Issue: Metrics not appearing in Prometheus

**Check**:
1. Is `/metrics` endpoint accessible? `curl http://localhost:3000/metrics`
2. Is Prometheus scraping the correct target?
3. Check Prometheus logs for scrape errors

#### Issue: High memory usage in production

**Debug**:
```bash
# Enable Node.js heap snapshot
node --heapsnapshot-signal=SIGUSR2 build/server-http.js

# Trigger snapshot
kill -SIGUSR2 <pid>

# Analyze with Chrome DevTools or heapdump package
```

#### Issue: Logs not appearing in centralized system

**Check**:
1. Verify log transport configuration
2. Check network connectivity to log aggregator
3. Verify log level is not filtering out messages

---

## Best Practices

### ✅ Do's

1. **Set Up Alerts for Critical Paths** - Monitor authentication, order processing, token refresh
2. **Use Structured Logging** - JSON logs for easy parsing and querying
3. **Redact Sensitive Data** - Never log tokens, passwords, or PII
4. **Monitor Business Metrics** - Track orders/hour, revenue, conversion rates
5. **Set Realistic Alert Thresholds** - Avoid alert fatigue with too many false positives
6. **Test Your Alerts** - Regularly verify alerts are working
7. **Document Runbooks** - Create step-by-step guides for common alerts

### ❌ Don'ts

1. **Don't Log Tokens** - Always redact in serializers
2. **Don't Ignore Warnings** - Warnings today become errors tomorrow
3. **Don't Alert on Everything** - Focus on actionable metrics
4. **Don't Forget Log Rotation** - Implement retention policies
5. **Don't Skip Health Checks** - Essential for orchestrators
6. **Don't Monitor in Production Only** - Test monitoring in staging first

---

## Related Documentation

- [PERFORMANCE.md](PERFORMANCE.md) - Performance optimization guide
- [EXAMPLES.md](EXAMPLES.md) - Workflow examples
- [TROUBLESHOOTING.md](README.md#-troubleshooting) - Common issues
- [SECURITY.md](SECURITY.md) - Security best practices

---

**Last Updated**: 2025-11-12
**Version**: 1.1.7
