import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { formatDateRelative, getCategoryColor } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const { data: featuredArticles, isLoading } = useQuery({
    queryKey: ['/api/articles/featured'],
    staleTime: 60000, // 1 minute
  });
  
  const articles = featuredArticles || [];
  
  useEffect(() => {
    if (!articles.length) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % articles.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [articles]);
  
  if (isLoading) {
    return (
      <div className="mb-8 relative bg-white shadow-md rounded-md overflow-hidden">
        <div className="animate-pulse">
          <div className="w-full h-[400px] bg-gray-300" />
          <div className="p-6">
            <div className="h-6 w-24 bg-gray-300 mb-2"></div>
            <div className="h-8 w-full bg-gray-300 mb-4"></div>
            <div className="h-4 w-48 bg-gray-300"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!articles.length) {
    return null;
  }
  
  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + articles.length) % articles.length);
  };
  
  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % articles.length);
  };
  
  const currentArticle = articles[currentSlide];
  
  return (
    <div className="mb-8 relative">
      <div className="bg-white shadow-md rounded-md overflow-hidden">
        <div className="relative">
          <Link href={`/article/${currentArticle.slug}`}>
            <img 
              src={currentArticle.imageUrl} 
              alt={currentArticle.title} 
              className="w-full h-[300px] md:h-[400px] lg:h-[500px] object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 md:p-6">
              <span className={`${getCategoryColor(currentArticle.categoryName || '')} text-white px-2 py-1 text-xs font-bold font-condensed mb-2 inline-block`}>
                {currentArticle.categoryName || 'NEWS'}
              </span>
              <h1 className="text-white text-xl md:text-2xl lg:text-3xl font-bold font-condensed leading-tight">
                {currentArticle.title}
              </h1>
              <div className="flex items-center mt-2 text-white text-sm">
                <span className="mr-4"><Clock className="inline h-4 w-4 mr-1" /> {formatDateRelative(currentArticle.publishedAt)}</span>
                <span><User className="inline h-4 w-4 mr-1" /> By {currentArticle.authorName || 'Staff Writer'}</span>
              </div>
            </div>
          </Link>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" asChild className="mr-4">
              <Link href={`/article/${currentArticle.slug}`} className="inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                {currentArticle.likesCount || 0}
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="mr-4">
              <Link href={`/article/${currentArticle.slug}#comments`} className="inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                {currentArticle.commentsCount || 0}
              </Link>
            </Button>
            <Button variant="ghost" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              Share
            </Button>
          </div>
          <div className="flex">
            <Button variant="outline" size="icon" className="rounded-full mr-2" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="default" size="icon" className="rounded-full" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {/* Slider indicator */}
      <div className="flex justify-center mt-4">
        {articles.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full mx-1 ${index === currentSlide ? 'bg-primary' : 'bg-gray-300'}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
