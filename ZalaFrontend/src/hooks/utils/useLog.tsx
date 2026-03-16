export const useLog = (logs = false) => {
  const log = (...args: unknown[]) => {
    if (!logs) return;
    console.log(...args);
  };
  return log;
};
