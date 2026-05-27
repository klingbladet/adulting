import type { Express, Request, Response, NextFunction } from "express";
import client from "prom-client";

export const metricsRegister = new client.Registry();

client.collectDefaultMetrics({
  register: metricsRegister,
  prefix: "adulting_backend_",
});

const httpRequestsTotal = new client.Counter({
  name: "adulting_backend_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"] as const,
});

const httpRequestDurationSeconds = new client.Histogram({
  name: "adulting_backend_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

metricsRegister.registerMetric(httpRequestsTotal);
metricsRegister.registerMetric(httpRequestDurationSeconds);

function normalizeRoute(req: Request): string {
  if (req.route?.path) {
    return req.baseUrl + req.route.path;
  }

  // Fallback om Express inte hittar route, t.ex. 404.
  return req.path || "unknown";
}

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const endTimer = httpRequestDurationSeconds.startTimer();

  res.on("finish", () => {
    // Vi vill inte att /metrics scrape:en ska förorena request-statistiken
    if (req.path === "/metrics") {
      return;
    }

    const labels = {
      method: req.method,
      route: normalizeRoute(req),
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    endTimer(labels);
  });

  next();
}

export function registerMetricsEndpoint(app: Express) {
  app.get("/metrics", async (_req, res) => {
    try {
      res.setHeader("Content-Type", metricsRegister.contentType);
      res.end(await metricsRegister.metrics());
    } catch (error) {
      res.status(500).end("Could not collect metrics");
    }
  });
}