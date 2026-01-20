import { useState, useCallback } from 'react';

interface UseApiFetchOptions<T> {
  fetcher: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  loadingMessage?: string;
}

export function useApiFetch<T = any>({
  fetcher,
  onSuccess,
  onError,
  loadingMessage = '불러오는 중...',
}: UseApiFetchOptions<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetcher();
      onSuccess?.(data);
      return data;
    } catch (err: any) {
      setError(err?.message || '알 수 없는 오류');
      onError?.(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetcher, onSuccess, onError]);

  return { execute, loading, error };
}
