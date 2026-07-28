
interface ApiErrorBody {
    message: string;
}

export type KillResult =
    | { ok: true }
    | { ok: false; status: number; message: string };

function isApiErrorBody(value: unknown): value is ApiErrorBody {
    return (
        typeof value === "object" &&
        value !== null &&
        "message" in value &&
        typeof (value as Record<string, unknown>).message === "string"
    );
}

export async function killProcess(
    pid: number,
    startTimeUnixMs: number,
    signal?: AbortSignal,
): Promise<KillResult> {
    let res: Response;
    try {
        res = await fetch(
            `${import.meta.env.VITE_URL}/${pid}/kill`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ startTimeUnixMs }),
                signal,
            },
        );
    } catch (err) {

        const message =
            err instanceof DOMException && err.name === "AbortError"
                ? "Request cancel"
                : "Can not connect to server";
        return { ok: false, status: 0, message };
    }

    if (res.status === 204) {
        return { ok: true };
    }

    let body: unknown = null;
    try {
        body = await res.json();
    } catch {
    }

    const message = isApiErrorBody(body)
        ? body.message
        : `Kill not success (HTTP ${res.status})`;

    return { ok: false, status: res.status, message };
}