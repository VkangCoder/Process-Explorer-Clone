export interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  error: string | null;
  isLoggingIn: boolean;
}
