import { Spin, Typography } from "antd";
import { useThemeCssVars } from "../../hooks/use-theme-css-vars";
import styles from "./loading-screen.module.css";

const { Text } = Typography;

export const LoadingScreen = () => {
  const cssVars = useThemeCssVars();

  return (
    <div className={styles.loadingScreen} style={cssVars}>
      <Spin size="large" />
      <Text type="secondary" className={styles.text}>
        Connecting to Process Explorer…
      </Text>
    </div>
  );
};