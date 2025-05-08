import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

interface Advertisement {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  backgroundColor: string;
  textColor: string;
  position: string;
  isActive: boolean;
  priority: number;
  startDate: string;
  endDate: string;
}

interface AdDisplayProps {
  position: 'sidebar' | 'footer' | 'article-page' | 'home-page';
  className?: string;
}

export default function AdDisplay({ position, className = '' }: AdDisplayProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  
  // Fetch advertisements from API
  const { data: ads = [], isLoading } = useQuery<Advertisement[]>({
    queryKey: [`/api/advertisements`, position],
    queryFn: async () => {
      const response = await fetch(`/api/advertisements?position=${position}`);
      if (!response.ok) {
        throw new Error('Failed to fetch advertisements');
      }
      return response.json();
    },
    staleTime: 300000, // 5 minutes
  });
  
  // Rotate ads if there are multiple for the position
  useEffect(() => {
    if (ads.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentAdIndex(current => (current + 1) % ads.length);
    }, 10000); // Rotate every 10 seconds
    
    return () => clearInterval(interval);
  }, [ads.length]);
  
  // Get current ad to display before any conditional returns
  const ad = !isLoading && ads.length > 0 ? ads[currentAdIndex] : null;
  
  // Track impression (moved before conditional return)
  useEffect(() => {
    if (!ad) return;
    
    // Call the impression tracking endpoint
    const trackImpression = async () => {
      try {
        await fetch(`/api/advertisements/impression/${ad.id}`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Failed to track impression:', error);
      }
    };
    
    trackImpression();
  }, [ad]);

  // Handle click tracking
  const handleClick = async () => {
    if (!ad) return;
    
    // Call the click tracking endpoint
    try {
      await fetch(`/api/advertisements/click/${ad.id}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  };
  
  // Render nothing if no ads to display or still loading
  if (isLoading || ads.length === 0 || !ad) return null;

  // Render different layouts based on position
  switch (position) {
    case 'sidebar':
      return (
        <div className={`ad-container sidebar-ad mb-6 ${className}`}>
          <a 
            href={ad.linkUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={handleClick}
            className="block overflow-hidden rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div 
              className="bg-opacity-90 p-4"
              style={{ 
                backgroundColor: ad.backgroundColor,
                color: ad.textColor,
              }}
            >
              {ad.imageUrl && (
                <img 
                  src={ad.imageUrl} 
                  alt={ad.title} 
                  className="w-full rounded-t-lg mb-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/300x150?text=Advertisement";
                  }}
                />
              )}
              <h3 className="font-bold mb-1">{ad.title}</h3>
              <p className="text-sm">{ad.description}</p>
            </div>
          </a>
        </div>
      );
      
    case 'footer':
      return (
        <div className={`ad-container footer-ad p-2 ${className}`}>
          <a 
            href={ad.linkUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={handleClick}
            className="flex items-center overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
            style={{ 
              backgroundColor: ad.backgroundColor,
              color: ad.textColor,
            }}
          >
            {ad.imageUrl && (
              <img 
                src={ad.imageUrl} 
                alt={ad.title} 
                className="w-16 h-16 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/160x160?text=Ad";
                }}
              />
            )}
            <div className="px-3">
              <h3 className="font-bold text-sm">{ad.title}</h3>
              <p className="text-xs">{ad.description}</p>
            </div>
          </a>
        </div>
      );
      
    case 'article-page':
      return (
        <div className={`ad-container article-ad my-6 ${className}`}>
          <div className="text-xs text-gray-500 mb-1">Advertisement</div>
          <a 
            href={ad.linkUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={handleClick}
            className="block overflow-hidden rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div 
              className="bg-opacity-90"
              style={{ 
                backgroundColor: ad.backgroundColor,
                color: ad.textColor,
              }}
            >
              {ad.imageUrl && (
                <img 
                  src={ad.imageUrl} 
                  alt={ad.title} 
                  className="w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/800x150?text=Advertisement";
                  }}
                />
              )}
              <div className="p-4">
                <h3 className="font-bold mb-1">{ad.title}</h3>
                <p className="text-sm">{ad.description}</p>
              </div>
            </div>
          </a>
        </div>
      );
      
    case 'home-page':
      return (
        <div className={`ad-container home-ad my-8 ${className}`}>
          <div className="text-xs text-gray-500 mb-1">Advertisement</div>
          <a 
            href={ad.linkUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={handleClick}
            className="block overflow-hidden rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div 
              className="bg-opacity-90 flex flex-col md:flex-row"
              style={{ 
                backgroundColor: ad.backgroundColor,
                color: ad.textColor,
              }}
            >
              {ad.imageUrl && (
                <div className="md:w-1/2">
                  <img 
                    src={ad.imageUrl} 
                    alt={ad.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x300?text=Advertisement";
                    }}
                  />
                </div>
              )}
              <div className="p-6 md:w-1/2 flex flex-col justify-center">
                <h3 className="font-bold text-xl mb-2">{ad.title}</h3>
                <p className="mb-4">{ad.description}</p>
                <div 
                  className="inline-block px-4 py-2 rounded border border-current text-center font-medium hover:bg-opacity-10 hover:bg-white transition-colors"
                >
                  Learn More
                </div>
              </div>
            </div>
          </a>
        </div>
      );
      
    default:
      return null;
  }
} 