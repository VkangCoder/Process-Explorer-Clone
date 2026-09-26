import { message } from "antd";
import { store } from "../store";
import { logout } from "../store/auth-slice";

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem("token");
    const res = await fetch(url, {
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
        store.dispatch(logout());
        message.error("Token expired");
        setTimeout(() => window.location.reload(), 1500);
    }
    return res;
}
