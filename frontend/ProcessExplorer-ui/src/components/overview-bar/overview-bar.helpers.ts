export const formatDisk = (kbPerSec: number): string => {
    if (kbPerSec < 1) return "0 KB/s";
    if (kbPerSec < 1024) return `${kbPerSec.toFixed(0)} KB/s`;
    return `${(kbPerSec / 1024).toFixed(1)} MB/s`;
};