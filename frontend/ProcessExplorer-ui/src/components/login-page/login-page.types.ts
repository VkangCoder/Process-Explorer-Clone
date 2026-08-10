export interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  isLoggingIn: boolean;
}