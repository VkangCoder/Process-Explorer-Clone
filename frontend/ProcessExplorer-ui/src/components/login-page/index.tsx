import { Button, Card, Form, Input, Typography } from "antd";
import { LockKeyhole } from "lucide-react";
import { useThemeCssVars } from "../../hooks/use-theme-css-vars";
import styles from "./login-page.module.css";
import { useAppDispatch, useAppSelector } from "../../stores";
import { login } from "../../stores/auth-slice";

const { Title, Text } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
}

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const isLoggingIn = useAppSelector((s) => s.auth.isLoggingIn);
  const cssVars = useThemeCssVars();

  const handleFinish = (values: LoginFormValues) => {
    dispatch(login({ username: values.username, password: values.password }));
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
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoggingIn}
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
