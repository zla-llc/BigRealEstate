export const useFireIfExists = () => {
  const fireIfExists = (messageId: number, cb?: (messageId: number) => void) =>
    cb ? () => cb(messageId) : undefined;
  return fireIfExists;
};
