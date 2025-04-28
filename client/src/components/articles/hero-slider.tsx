import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArticleWithDetails } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function HeroSlider() {
  const { data: featuredArticles, isLoading } = useQuery<ArticleWithDetails[]>({
    queryKey: ["/api/articles/featured"],
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!featuredArticles || featuredArticles.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
    }, 7000);
    
    return () => clearInterval(interval);
  }, [featuredArticles]);

  const handleLike = async (articleId: number, currentLikes: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like articles",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiRequest("POST", `/api/articles/${articleId}/like`, { userId: user.id });
      toast({
        title: "Success!",
        description: "You liked this article."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to like article",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8 bg-white animate-pulse">
        <div className="h-[400px] bg-gray-200"></div>
      </div>
    );
  }

  if (!featuredArticles || featuredArticles.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 relative">
      <Card className="bg-white shadow-md rounded-md overflow-hidden">
        <Carousel
          currentIndex={currentSlide}
          onSelect={setCurrentSlide}
          className="w-full"
        >
          <CarouselContent>
            {featuredArticles.map((article, index) => (
              <CarouselItem key={article.id}>
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-[300px] md:h-[400px] lg:h-[500px] object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 md:p-6">
                      <span className="bg-secondary text-white px-2 py-1 text-xs font-bold font-['Roboto_Condensed'] mb-2 inline-block">
                        {article.category.name.toUpperCase()}
                      </span>
                      <Link href={`/article/${article.slug}`}>
                        <h1 className="text-white text-xl md:text-2xl lg:text-3xl font-bold font-['Roboto_Condensed'] leading-tight hover:underline">
                          {article.title}
                        </h1>
                      </Link>
                      <div className="flex items-center mt-2 text-white text-sm">
                        <span className="mr-4">
                          <i className="far fa-clock mr-1"></i> 
                          {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
                        </span>
                        <span>
                          <i className="far fa-user mr-1"></i> By {article.author.username}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                    <div className="flex items-center">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-gray-500 hover:text-secondary mr-4"
                        onClick={() => handleLike(article.id, article.likeCount)}
                      >
                        <i className="far fa-heart mr-1"></i> {article.likeCount}
                      </Button>
                      <Link href={`/article/${article.slug}#comments`}>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-secondary mr-4">
                          <i className="far fa-comment mr-1"></i> {article.commentCount}
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-secondary">
                        <i className="fas fa-share-alt mr-1"></i> Share
                      </Button>
                    </div>
                    <div className="flex">
                      <CarouselPrevious className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 mr-2" />
                      <CarouselNext className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary text-white" />
                    </div>
                  </div>
                </CardContent>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </Card>
      <div className="flex justify-center mt-4">
        {featuredArticles.map((_, index) => (
          <span
            key={index}
            className={`w-2 h-2 rounded-full mx-1 ${
              index === currentSlide ? "bg-secondary" : "bg-gray-300"
            }`}
            onClick={() => setCurrentSlide(index)}
          ></span>
        ))}
      </div>
    </div>
  );
}
