import { useState, useCallback } from 'react';

interface AsyncOperationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  loadingDelay?: number;
}

export const useAsyncOperation = <T = any>() => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (operation: () => Promise<T>, options?: AsyncOperationOptions<T>): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);

        if (options?.loadingDelay) {
          await new Promise((r) => setTimeout(r, options.loadingDelay));
        }

        const result = await operation();
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        options?.onError?.(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { loading, error, execute, reset };
};
