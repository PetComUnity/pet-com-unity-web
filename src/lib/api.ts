const API_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api"
).replace(/\/$/, "");

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
};



type ApiEnvelope<T> = {
  data?: T;
  message?: string;
};

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

function getDefaultErrorMessage(status: number) {
  if (status === 401) {
    return "Please sign in to continue.";
  }

  if (status === 403) {
    return "You do not have permission to perform this action.";
  }

  return "Something went wrong";
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, signal, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  const data = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!response.ok) {
    throw new ApiRequestError(
      data.message ?? getDefaultErrorMessage(response.status),
      response.status,
    );
  }

  return data.data as T;
}
