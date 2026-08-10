import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { login as loginApi } from "../../api/auth";
import { decodeJwtExpMs } from "./use-auth.helpers";

const STORAGE_KEY = "process-explorer:auth-token";

const getInitialToken = (): string | null => localStorage.getItem(STORAGE_KEY);

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoggingIn(true);
    const result = await loginApi(username, password);
    setIsLoggingIn(false);

    if (!result.ok) {
      message.error(result.message);
      return false;
    }

    localStorage.setItem(STORAGE_KEY, result.token);
    setToken(result.token);
    return true;
  }, []);

  // reason có giá trị -> logout "bị động" (hết hạn / server từ chối) -> báo cho
  // user biết vì sao. Logout thủ công (bấm nút) thì không cần thông báo gì cả.
  const logout = useCallback((reason?: string) => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);

    if (reason) {
      message.error(reason);
    }
  }, []);

  // Tự động logout đúng lúc token hết hạn — kể cả token cũ nạp lại từ
  // localStorage lúc load trang (không cần đợi 1 request nào 401 mới biết).
  useEffect(() => {
    if (!token) return;

    const expMs = decodeJwtExpMs(token);
    if (expMs === null) return;

    const remainingMs = expMs - Date.now();
    if (remainingMs <= 0) {
      logout("Your session has expired. Please sign in again.");
      return;
    }

    const timer = setTimeout(() => {
      logout("Your session has expired. Please sign in again.");
    }, remainingMs);

    return () => clearTimeout(timer);
  }, [token, logout]);

  return {
    token,
    isAuthenticated: token !== null,
    login,
    logout,
    isLoggingIn,
  };
};