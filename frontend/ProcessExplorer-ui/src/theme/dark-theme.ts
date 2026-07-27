import { theme, type ThemeConfig } from "antd";

export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorBgBase: "#0B1220",
    colorBgContainer: "#111827",
    colorBgElevated: "#1E293B",
    colorText: "#F8FAFC",
    colorTextSecondary: "#94A3B8",
    colorBorder: "#334155",
    colorPrimary: "#3B82F6",
    borderRadius: 8,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  components: {
    Table: {
      headerBorderRadius: 0,
      borderRadiusLG: 0,
    },
  },
};
