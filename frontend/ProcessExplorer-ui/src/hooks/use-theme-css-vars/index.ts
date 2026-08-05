import type { CSSProperties } from "react";
import { theme } from "antd";

export const useThemeCssVars = (): CSSProperties => {
  const { token } = theme.useToken();

  return {
    "--ant-color-bg-base": token.colorBgBase,
    "--ant-color-bg-container": token.colorBgContainer,
    "--ant-color-bg-elevated": token.colorBgElevated,
    "--ant-color-text": token.colorText,
    "--ant-color-text-secondary": token.colorTextSecondary,
    "--ant-color-border": token.colorBorder,
    "--ant-color-primary": token.colorPrimary,
  } as CSSProperties;
};
