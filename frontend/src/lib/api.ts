const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "/api/v1";

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = localStorage.getItem("payguard_access_token");

    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: requestHeaders,
  });

  let body: unknown = null;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const candidate = body as
      | { detail?: string; message?: string }
      | null;

    throw new ApiError(
      candidate?.detail ||
        candidate?.message ||
        `Request failed with status ${response.status}`,
      response.status,
    );
  }

  return body as T;
}

export async function login(
  merchantSlug: string,
  email: string,
  password: string,
) {
  const response = await apiRequest<Record<string, unknown>>(
    "/auth/login",
    {
      method: "POST",
      auth: false,
      body: JSON.stringify({
        merchant_slug: merchantSlug,
        email,
        password,
      }),
    },
  );

  const nested =
    typeof response.data === "object" &&
    response.data !== null
      ? (response.data as Record<string, unknown>)
      : null;

  const accessToken =
    (response.access_token as string | undefined) ||
    (nested?.access_token as string | undefined);

  if (!accessToken) {
    throw new Error("Login succeeded but no access token was returned.");
  }

  return accessToken;
}


export interface RegisterPayload {
  fullName: string;
  merchantName: string;
  merchantSlug: string;
  email: string;
  password: string;
}

export async function register(
  payload: RegisterPayload,
) {
  const response =
    await apiRequest<Record<string, unknown>>(
      "/auth/register",
      {
        method: "POST",
        auth: false,
        body: JSON.stringify({
          full_name: payload.fullName,
          merchant_name: payload.merchantName,
          merchant_slug: payload.merchantSlug,
          email: payload.email,
          password: payload.password,
        }),
      },
    );

  const nested =
    typeof response.data === "object" &&
    response.data !== null
      ? (response.data as Record<
          string,
          unknown
        >)
      : null;

  const accessToken =
    (response.access_token as
      | string
      | undefined) ||
    (nested?.access_token as
      | string
      | undefined);

  if (!accessToken) {
    throw new Error(
      "Registration succeeded but no access token was returned.",
    );
  }

  return accessToken;
}
