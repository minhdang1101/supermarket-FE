import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for handling async operations with loading, error, and data states
 * @template T
 * @param {Function} asyncFunction - Async function to execute
 * @param {Object} options - Hook options
 * @param {boolean} [options.immediate=false] - Execute immediately on mount
 * @param {Array} [options.deps=[]] - Dependencies for immediate execution
 * @returns {Object} - Hook state and controls
 */
export function useAsync(asyncFunction, { immediate = false, deps = [] } = {}) {
  const [state, setState] = useState({
    data: null,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: false,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        isError: false,
        error: null,
        isSuccess: false,
      }));

      try {
        const result = await asyncFunction(...args);
        if (mountedRef.current) {
          setState({
            data: result,
            isLoading: false,
            isError: false,
            error: null,
            isSuccess: true,
          });
        }
        return result;
      } catch (error) {
        if (mountedRef.current) {
          setState({
            data: null,
            isLoading: false,
            isError: true,
            error,
            isSuccess: false,
          });
        }
        throw error;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: false,
    });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...deps]);

  return {
    ...state,
    execute,
    reset,
    setData: (data) => setState((prev) => ({ ...prev, data })),
  };
}

/**
 * Custom hook for handling paginated data fetching
 * @template T
 * @param {Function} fetchFunction - Function that fetches paginated data
 * @param {Object} options - Hook options
 * @returns {Object} - Hook state and controls
 */
export function usePagination(fetchFunction, { initialPage = 0, initialSize = 10 } = {}) {
  const [pagination, setPagination] = useState({
    page: initialPage,
    size: initialSize,
    totalElements: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({});

  const {
    data,
    isLoading,
    isError,
    error,
    execute,
    reset,
  } = useAsync(
    async () => {
      const response = await fetchFunction({
        ...filters,
        page: pagination.page,
        size: pagination.size,
      });
      
      const result = response.data || response;
      setPagination((prev) => ({
        ...prev,
        totalElements: result.totalElements || 0,
        totalPages: result.totalPages || 0,
      }));
      
      return result.content || [];
    },
    { immediate: true, deps: [pagination.page, pagination.size, JSON.stringify(filters)] }
  );

  const goToPage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((size) => {
    setPagination((prev) => ({ ...prev, page: 0, size }));
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, []);

  return {
    data: data || [],
    pagination,
    filters,
    isLoading,
    isError,
    error,
    goToPage,
    setPageSize,
    updateFilters,
    resetFilters,
    refetch: execute,
    reset,
  };
}

export default useAsync;
