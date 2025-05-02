import { useQuery } from "@tanstack/react-query";
import { Article } from "@shared/schema";
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";

export default function BreakingNews() {
  const { data: breakingNews } = useQuery<Article[]>({
    queryKey: ["/api/articles/breaking"],
  });
  
  const tickerRef = useRef<HTMLDivElement>(null);
  const [tickerWidth, setTickerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [duplicates, setDuplicates] = useState(1);

  // Calculate how many duplicates we need to fill the ticker based on container width
  useEffect(() => {
    if (!tickerRef.current || !containerRef.current || !breakingNews) return;
    
    const calculateDuplicates = () => {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const tickerItemWidth = tickerRef.current?.offsetWidth || 0;
      
      if (tickerItemWidth === 0) return;
      
      // We need at least 2 copies to create the infinite loop effect
      // Add more if needed to fill the container width
      const needed = Math.max(2, Math.ceil((containerWidth * 2) / tickerItemWidth));
      setDuplicates(needed);
      setTickerWidth(tickerItemWidth);
    };
    
    calculateDuplicates();
    
    const resizeObserver = new ResizeObserver(calculateDuplicates);
    if (tickerRef.current) {
      resizeObserver.observe(tickerRef.current);
    }
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    window.addEventListener('resize', calculateDuplicates);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateDuplicates);
    };
  }, [breakingNews]);

  if (!breakingNews || breakingNews.length === 0) {
    return null;
  }

  return (
    <div className="bg-accent text-darkText py-2 overflow-hidden">
      <div className="container mx-auto px-4 flex items-center">
        <span className="bg-secondary text-white px-2 py-1 text-xs font-bold font-['Roboto_Condensed'] mr-4 flex-shrink-0">
          BREAKING
        </span>
        
        <div 
          ref={containerRef}
          className="overflow-hidden whitespace-nowrap relative"
        >
          {/* The ticker container with animation */}
          <div 
            className="animate-marquee inline-block"
            style={{
              animationDuration: `${Math.max(20, tickerWidth / 20)}s`, // Adjust speed based on content width
            }}
          >
            {/* Original ticker content */}
            <div ref={tickerRef} className="inline-flex items-center">
              {breakingNews.map((article, index) => (
                <Link 
                  key={`original-${article.id}`} 
                  href={`/article/${article.slug}`}
                  className="inline-block hover:text-secondary transition-colors"
                >
                  <span>{article.title}</span>
                  {index < breakingNews.length - 1 && (
                    <span className="mx-3 text-secondary">•</span>
                  )}
                </Link>
              ))}
            </div>
            
            {/* Duplicate the content to create a seamless loop effect */}
            {Array.from({ length: duplicates }).map((_, dupIndex) => (
              <div key={`duplicate-${dupIndex}`} className="inline-flex items-center">
                {breakingNews.map((article, index) => (
                  <Link 
                    key={`duplicate-${dupIndex}-${article.id}`} 
                    href={`/article/${article.slug}`}
                    className="inline-block  transition-colors"
                  >
                    <span>{article.title}</span>
                    {index < breakingNews.length - 1 && (
                      <span className="mx-3 text-secondary">•</span>
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
