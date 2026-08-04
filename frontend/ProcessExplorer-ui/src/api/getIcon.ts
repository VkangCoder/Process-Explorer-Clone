export const getIconUrl = (executablePath: string | null): string | null => {
  if (!executablePath) return null;
  return `${import.meta.env.VITE_URL}/icon?path=${encodeURIComponent(executablePath)}`;
};
