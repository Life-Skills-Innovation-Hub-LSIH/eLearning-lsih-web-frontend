import { apiRequest } from "./client";

export type HealthResponse = {
  status: "ok" | "degraded";
  app: string;
  environment: string;
  database: "ok" | "error";
  timestamp: string;
};

export function fetchHealth() {
  return apiRequest<HealthResponse>("/health");
}
