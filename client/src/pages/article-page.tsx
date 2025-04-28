import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArticleWithDetails } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import RelatedArticles from "@/components/articles/related-articles";
import CommentForm from "@/components/comments/comment-form";
import CommentList from "@/components/comments/comment-list";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function ArticlePage() {
  const { slug } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  
  const { data: article, isLoading, error } = useQuery<ArticleWithDetails>({
    queryKey: [`/api/articles/slug/${slug}`],
  });

  // Check if user has liked this article
  useEffect(() => {
    if (user && article) {
      const checkLikeStatus = async () => {
        try {
          const res = await fetch(`/api/articles/${article.id}/likes/${user.id}`);
          setIsLiked(res.ok);
        } catch (error) {
          console.error("Error checking like status:", error);
        }
      };
      
      checkLikeStatus();
    }
  }, [user, article]);

  // Set document title
  useEffect(() => {
    if (article) {
      document.title = `${article.title} - Daily News`;
    }
  }, [article]);

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like articles",
        variant: "destructive"
      });
      return;
    }

    if (!article) return;

    try {
      await apiRequest("POST", `/api/articles/${article.id}/like`, { userId: user.id });
      queryClient.invalidateQueries({ queryKey: [`/api/articles/slug/${slug}`] });
      setIsLiked(true);
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

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = article?.title || "Daily News Article";
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
        break;
      default:
        navigator.clipboard.writeText(url).then(() => {
          toast({
            title: "Link copied!",
            description: "Article link copied to clipboard"
          });
        });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="bg-white p-4 md:p-8 max-w-5xl mx-auto">
          <div className="mb-4">
            <div className="h-4 bg-gray-200 w-20 mb-2 rounded"></div>
            <div className="h-3 bg-gray-200 w-40 rounded"></div>
          </div>
          <div className="h-10 bg-gray-200 w-3/4 mb-4 rounded"></div>
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
            <div>
              <div className="h-4 bg-gray-200 w-32 mb-1 rounded"></div>
              <div className="h-3 bg-gray-200 w-48 rounded"></div>
            </div>
          </div>
          <div className="h-80 bg-gray-200 w-full mb-6 rounded"></div>
          <div className="space-y-4 mb-6">
            <div className="h-4 bg-gray-200 w-full rounded"></div>
            <div className="h-4 bg-gray-200 w-full rounded"></div>
            <div className="h-4 bg-gray-200 w-3/4 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-white p-8 max-w-lg mx-auto rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-4">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-secondary text-white"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-4 md:p-8 max-w-5xl mx-auto">
        <div className="mb-4">
          <span className="bg-secondary text-white px-2 py-1 text-xs font-bold font-['Roboto_Condensed']">
            {article.category.name.toUpperCase()}
          </span>
          <span className="text-xs text-gray-500 ml-3">
            <i className="far fa-clock mr-1"></i> 
            {new Date(article.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
        
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-['Roboto_Condensed'] leading-tight mb-4">
          {article.title}
        </h1>
        
        <div className="flex items-center mb-6">
          <img 
            src={`https://ui-avatars.com/api/?name=${article.author.username}&background=random`} 
            alt={article.author.username} 
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <p className="font-medium">{article.author.username}</p>
            <p className="text-xs text-gray-500">Senior Correspondent</p>
          </div>
        </div>
        
        <img 
          src={article.coverImage} 
          alt={article.title} 
          className="w-full h-auto object-cover mb-6"
        />
        
        <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: article.content }}></div>
        
        <div className="flex items-center justify-between py-4 border-t border-b border-gray-200 mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant={isLiked ? "default" : "outline"}
              size="sm"
              className={isLiked ? "bg-secondary text-white" : "text-gray-500 hover:text-secondary"}
              onClick={handleLike}
            >
              <i className={`${isLiked ? 'fas' : 'far'} fa-heart mr-1`}></i>
              {article.likeCount} Likes
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="text-gray-500 hover:text-secondary"
              onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <i className="far fa-comment mr-1"></i>
              {article.commentCount} Comments
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">Share:</span>
            <Button variant="ghost" size="sm" className="text-[#3b5998] hover:opacity-80 p-1 h-auto" onClick={() => handleShare('facebook')}>
              <i className="fab fa-facebook-f"></i>
            </Button>
            <Button variant="ghost" size="sm" className="text-[#1da1f2] hover:opacity-80 p-1 h-auto" onClick={() => handleShare('twitter')}>
              <i className="fab fa-twitter"></i>
            </Button>
            <Button variant="ghost" size="sm" className="text-[#0077b5] hover:opacity-80 p-1 h-auto" onClick={() => handleShare('linkedin')}>
              <i className="fab fa-linkedin-in"></i>
            </Button>
            <Button variant="ghost" size="sm" className="text-[#25D366] hover:opacity-80 p-1 h-auto" onClick={() => handleShare('whatsapp')}>
              <i className="fab fa-whatsapp"></i>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-secondary p-1 h-auto" onClick={() => handleShare('email')}>
              <i className="fas fa-envelope"></i>
            </Button>
          </div>
        </div>
        
        {/* Comments Section */}
        <div className="mb-6" id="comments">
          <h3 className="text-xl font-bold font-['Roboto_Condensed'] mb-4">
            Comments ({article.commentCount})
          </h3>
          
          <CommentForm articleId={article.id} />
          
          <CommentList articleId={article.id} />
        </div>
        
        {/* Related Articles */}
        <RelatedArticles 
          articleId={article.id} 
          categoryId={article.categoryId} 
        />
      </div>
    </div>
  );
}
