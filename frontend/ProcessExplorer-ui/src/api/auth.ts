interface ApiErrorBody {
  message: string;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof (value as Record<string, unknown>).message === "string"
  );
}

export type LoginResult =
  | { ok: true; token: string; expiresInMinutes: number }
  | { ok: false; message: string };

export async function login(
  username: string,
  password: string,
): Promise<LoginResult> {
  let res: Response;
  try {
    res = await fetch(`${import.meta.env.VITE_AUTH_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    return { ok: false, message: "Can not connect to server" };
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {}

  if (!res.ok) {
    const message = isApiErrorBody(body)
      ? body.message
      : `Login failed (HTTP ${res.status})`;
    return { ok: false, message };
  }

  const data = body as { token: string; expiresInMinutes: number };
  return {
    ok: true,
    token: data.token,
    expiresInMinutes: data.expiresInMinutes,
  };
}
