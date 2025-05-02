import { useState, useEffect } from "react";
import { useDatabaseStatus } from "./use-database-status";

export type DataState<T> = {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  error: string | null;
  emptyMessage: string | null;
};

export function useDataState<T>(
  fetcher: () => Promise<Response>,
  options?: {
    initialData?: T | null;
    emptyMessage?: string;
    errorMessage?: string;
    dependencies?: any[];
    autoFetch?: boolean;
  }
) {
  const dbStatus = useDatabaseStatus();
  const [state, setState] = useState<DataState<T>>({
    data: options?.initialData || null,
    isLoading: true,
    isError: false,
    isEmpty: false,
    error: null,
    emptyMessage: null
  });

  const fetchData = async () => {
    // Skip fetch if database is not connected
    if (dbStatus.status === "error" || !dbStatus.connected) {
      setState({
        data: options?.initialData || null,
        isLoading: false,
        isError: true,
        isEmpty: false,
        error: dbStatus.message,
        emptyMessage: null
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetcher();
      const data = await response.json();

      // Check if the response indicates empty data
      if (response.ok && data && (data.status === "empty" || (Array.isArray(data.data) && data.data.length === 0))) {
        setState({
          data: data.data || null,
          isLoading: false,
          isError: false,
          isEmpty: true,
          error: null,
          emptyMessage: data.message || options?.emptyMessage || "No data found"
        });
        return;
      }

      // Check for successful response
      if (response.ok) {
        setState({
          data: data,
          isLoading: false,
          isError: false,
          isEmpty: false,
          error: null,
          emptyMessage: null
        });
        return;
      }

      // Handle error response
      setState({
        data: options?.initialData || null,
        isLoading: false,
        isError: true,
        isEmpty: false,
        error: data.message || options?.errorMessage || "Something went wrong",
        emptyMessage: null
      });
    } catch (error) {
      setState({
        data: options?.initialData || null,
        isLoading: false,
        isError: true,
        isEmpty: false,
        error: options?.errorMessage || "Failed to fetch data",
        emptyMessage: null
      });
    }
  };

  useEffect(() => {
    // Don't auto-fetch if explicitly set to false
    if (options?.autoFetch === false) return;
    
    fetchData();
  }, [dbStatus.connected, ...(options?.dependencies || [])]);

  return {
    ...state,
    refetch: fetchData
  };
} 