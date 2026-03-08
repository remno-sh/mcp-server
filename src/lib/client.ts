import type { McpError } from "./types.js";

interface ApiResponse<T = unknown> {
  data: T | null;
  meta: { requestId: string; timestamp: string };
  pagination?: { total: number; limit: number; offset: number; hasMore: boolean };
  errors: Array<{ code: string; message: string; field?: string }> | null;
}

const BASE_URL = process.env.REMNO_API_URL || "https://api.remno.sh";
const TIMEOUT_MS = 30_000;

function generateUUIDv7(): string {
  const now = Date.now();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // Timestamp in upper 48 bits
  bytes[0] = (now / 2 ** 40) & 0xff;
  bytes[1] = (now / 2 ** 32) & 0xff;
  bytes[2] = (now / 2 ** 24) & 0xff;
  bytes[3] = (now / 2 ** 16) & 0xff;
  bytes[4] = (now / 2 ** 8) & 0xff;
  bytes[5] = now & 0xff;
  // Version 7
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // Variant 10
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export class RemnoApiError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
    public recoveryHint: string,
  ) {
    super(message);
    this.name = "RemnoApiError";
  }

  toMcpError(): McpError {
    return {
      error_code: this.errorCode,
      message: this.message,
      recovery_hint: this.recoveryHint,
    };
  }
}

function recoveryHintForStatus(status: number, method: string): string {
  switch (status) {
    case 400:
      return "Check the parameters you provided match the expected schema.";
    case 401:
      return "Your API key is invalid or expired. Verify REMNO_API_KEY is set correctly.";
    case 402:
      return "Insufficient wallet balance. Fund your wallet before creating transactions.";
    case 403:
      return "You don't have permission for this action. Check delegation rules.";
    case 404:
      return "Resource not found. Verify the ID is correct.";
    case 409:
      return method === "POST"
        ? "A request with this Idempotency-Key is already in flight. Retry after a short delay."
        : "Conflict — the resource state does not allow this action.";
    case 422:
      return "This Idempotency-Key was used with different parameters. Use a new key.";
    case 429:
      return "Rate limited. Back off and retry after the period indicated in Retry-After header.";
    default:
      return status >= 500
        ? "Server error. Retry with exponential backoff."
        : "Unexpected error. Check the error_code for details.";
  }
}

export async function request<T = unknown>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  apiKey: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}/v1${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (method === "POST") {
    headers["Idempotency-Key"] = generateUUIDv7();
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const json = (await response.json()) as ApiResponse<T>;

    if (!response.ok) {
      const errorCode =
        json.errors?.[0]?.code || `HTTP_${response.status}`;
      const errorMessage =
        json.errors?.[0]?.message || response.statusText;
      throw new RemnoApiError(
        response.status,
        errorCode,
        errorMessage,
        recoveryHintForStatus(response.status, method),
      );
    }

    return json;
  } catch (error) {
    if (error instanceof RemnoApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new RemnoApiError(
        408,
        "TIMEOUT",
        "Request timed out after 30 seconds",
        "The Remno API did not respond in time. Retry or check service status.",
      );
    }
    throw new RemnoApiError(
      0,
      "NETWORK_ERROR",
      error instanceof Error ? error.message : "Unknown network error",
      "Check your network connection and verify REMNO_API_URL is reachable.",
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function get<T = unknown>(
  path: string,
  apiKey: string,
): Promise<ApiResponse<T>> {
  return request<T>("GET", path, apiKey);
}

export async function post<T = unknown>(
  path: string,
  apiKey: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  return request<T>("POST", path, apiKey, body);
}
