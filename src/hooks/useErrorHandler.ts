import { useState, useCallback } from 'react';

interface ErrorState {
  error: string | null;
  isError: boolean;
}

export const useErrorHandler = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false
  });

  const setError = useCallback((error: string | Error | null) => {
    if (error) {
      const errorMessage = error instanceof Error ? error.message : error;
      setErrorState({
        error: errorMessage,
        isError: true
      });
      
      // Log error for debugging
      console.error('Error occurred:', error);
      
      // Auto-clear error after 5 seconds
      setTimeout(() => {
        clearError();
      }, 5000);
    } else {
      setErrorState({
        error: null,
        isError: false
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false
    });
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> => {
    try {
      clearError();
      return await asyncFn();
    } catch (error) {
      const message = errorMessage || (error instanceof Error ? error.message : 'An unexpected error occurred');
      setError(message);
      return null;
    }
  }, [setError, clearError]);

  return {
    error: errorState.error,
    isError: errorState.isError,
    setError,
    clearError,
    handleAsyncError
  };
};