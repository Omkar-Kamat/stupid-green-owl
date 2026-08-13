import type { ApiErrorBody } from "@/lib/api/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "ApiError";
  }
}

function parseErrorCode(body: ApiErrorBody): string {
  if (typeof body.detail === "string") return body.detail;
  if (Array.isArray(body.detail) && body.detail.length > 0) {
    return body.detail.map((item) => item.msg).join("; ");
  }
  return "UNKNOWN_ERROR";
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${API_BASE}/api/v1${path}`;

  const response = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let code = "UNKNOWN_ERROR";
    try {
      const errorBody = (await response.json()) as ApiErrorBody;
      code = parseErrorCode(errorBody);
    } catch {
      code = response.statusText || "UNKNOWN_ERROR";
    }
    throw new ApiError(response.status, code);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
};

export { API_BASE };
