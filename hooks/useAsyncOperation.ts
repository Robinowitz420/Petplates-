// hooks/useAsyncOperation.ts
// Custom hook for handling async operations with loading/error states

import { useState, useCallback } from 'react';
import { handleError, getErrorMessage } from '@/lib/utils/errorHandler';

interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsyncOperation<T, Args extends any[]>(
  asyncFn: (...args: Args) => Promise<T>
) {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args) => {
      setState({ data: null, loading: true, error: null });
      
      try {
        const result = await asyncFn(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (error) {
        const appError = handleError(error);
        const errorMessage = getErrorMessage(appError);
        setState({ data: null, loading: false, error: errorMessage });
        throw appError;
      }
    },
    [asyncFn]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

