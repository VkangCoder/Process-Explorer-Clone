import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { LockKeyhole } from "lucide-react";
import { useThemeCssVars } from "../../hooks/use-theme-css-vars";
import type { LoginPageProps } from "./login-page.types";
import styles from "./login-page.module.css";

const { Title, Text } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
}

export const LoginPage = ({ onLogin, error, isLoggingIn }: LoginPageProps) => {
  const cssVars = useThemeCssVars();

  const handleFinish = (values: LoginFormValues) => {
    void onLogin(values.username, values.password);
  };

  return (
    <div className={styles.loginPage} style={cssVars}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <LockKeyhole size={28} />
          <Title level={4} style={{ margin: 0 }}>
            Process Explorer
          </Title>
          <Text type="secondary">Sign in to continue</Text>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            className={styles.alert}
          />
        )}

        <Form<LoginFormValues>
          layout="vertical"
          onFinish={handleFinish}
          disabled={isLoggingIn}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Username is required" }]}
          >
            <Input autoFocus />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Password is required" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item className={styles.submitItem}>
            <Button type="primary" htmlType="submit" block loading={isLoggingIn}>
              Sign in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
