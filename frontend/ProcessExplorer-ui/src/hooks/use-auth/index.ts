import { useCallback, useState } from "react";
import { login as loginApi } from "../../api/auth";

const STORAGE_KEY = "process-explorer:auth-token";

const getInitialToken = (): string | null => localStorage.getItem(STORAGE_KEY);

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoggingIn(true);
    setError(null);

    const result = await loginApi(username, password);
    setIsLoggingIn(false);

    if (!result.ok) {
      setError(result.message);
      return false;
    }

    localStorage.setItem(STORAGE_KEY, result.token);
    setToken(result.token);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  }, []);

  return {
    token,
    isAuthenticated: token !== null,
    login,
    logout,
    error,
    isLoggingIn,
  };
};