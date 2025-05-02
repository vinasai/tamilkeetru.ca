import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Custom hook to scroll to top of the page on navigation,
 * but only for forward navigation (not when using browser back button)
 */
export function useScrollTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to top on forward navigation
    window.scrollTo(0, 0);
  }, [location]);
} 