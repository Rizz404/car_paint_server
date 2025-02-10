import env from "@/configs/environtment";
import { register } from "@/utils/metrics";
import promBundle from "express-prom-bundle";

export const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  metricsPath: "/metrics",
  promClient: {
    collectDefaultMetrics: {
      prefix: "paint_project_",
    },
  },
  customLabels: {
    app: "paint-project",
    env: env.NODE_ENV || "development",
  },
  // Gunakan registry yang sama
  promRegistry: register,
  // Nonaktifkan metrik HTTP default dari express-prom-bundle
  autoregister: false,
  // Berikan prefix berbeda untuk menghindari konflik
  httpDurationMetricName: "paint_project_bundle_http_duration_seconds",
});
