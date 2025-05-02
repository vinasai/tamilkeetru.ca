import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArticleWithDetails } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import RelatedArticles from "@/components/articles/related-articles";
import PopularCategoryArticles from "@/components/articles/popular-category-articles";
import PopularArticles from "@/components/articles/popular-articles";
import CommentForm from "@/components/comments/comment-form";
import CommentList from "@/components/comments/comment-list";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useScrollTop } from "@/hooks/use-scroll-top";

export default function ArticlePage() {
  const { slug } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  
  // Use the scroll to top hook
  useScrollTop();
  
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
      document.title = `${article.title} - Tamil Keetru`;
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
    const title = article?.title || "Tamil Keetru Article";
    
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
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article Content - 8 cols */}
          <div className="lg:col-span-8">
            <div className="bg-white p-4 md:p-8 shadow-sm rounded-md">
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
                className="w-full h-auto object-cover mb-6 rounded-md"
              />
              
              {/* Article Content - First Half */}
              <div 
                className="prose max-w-none mb-6" 
                dangerouslySetInnerHTML={{ __html: article.content.substring(0, article.content.length / 2) }}
              ></div>
              
              {/* Mid-article Advertisement */}
              <div className="my-8 bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-md text-white flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-lg font-bold mb-1">Tamil Keetru Premium</h3>
                  <p className="text-sm text-white/90">Get unlimited access to exclusive content and ad-free reading</p>
                </div>
                <button className="bg-white text-blue-600 font-bold py-2 px-6 rounded hover:bg-blue-50 transition-colors">
                  Try Free for 7 Days
                </button>
              </div>
              
              {/* Article Content - Second Half */}
              <div 
                className="prose max-w-none mb-6" 
                dangerouslySetInnerHTML={{ __html: article.content.substring(article.content.length / 2) }}
              ></div>
              
              <div className="flex items-center justify-between py-4 border-t border-b border-gray-200 mb-6">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant={isLiked ? "default" : "outline"}
                    size="sm"
                    className={isLiked ? "bg-primary text-white" : "text-gray-500 hover:text-primary flex items-center"}
                    onClick={handleLike}
                  >
                    <i className={`${isLiked ? 'fas' : 'far'} fa-heart mr-1 align-text-bottom`}></i>
                    {article.likeCount} Likes
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="text-gray-500 hover:text-primary flex items-center"
                    onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <i className="far fa-comment mr-1 align-text-bottom"></i>
                    {article.commentCount} Comments
                  </Button>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 hidden sm:inline">Share:</span>
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
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary p-1 h-auto flex items-center" onClick={() => handleShare('email')}>
                    <i className="fas fa-envelope align-text-bottom"></i>
                  </Button>
                </div>
              </div>
              
              {/* Author Bio */}
              <div className="bg-gray-50 p-4 rounded-md mb-8">
                <div className="flex items-start">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${article.author.username}&background=random`} 
                    alt={article.author.username} 
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-lg">{article.author.username}</h4>
                    <p className="text-sm text-gray-600 mb-2">Senior Correspondent at Tamil Keetru</p>
                    <p className="text-sm">
                      Expert in {article.category.name} with over 10 years of journalism experience.
                      Follow for the latest news and in-depth analysis.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Comments Section */}
              <div className="mb-8" id="comments">
                <h3 className="text-xl font-bold font-['Roboto_Condensed'] mb-4">
                  Comments ({article.commentCount})
                </h3>
                
                <CommentForm articleId={article.id} />
                
                <CommentList articleId={article.id} />
              </div>
              
              {/* Related Articles (Top Related News) */}
              <div className="mb-8">
                <h3 className="text-xl font-bold font-['Roboto_Condensed'] mb-4 border-l-4 border-secondary pl-3">
                  TOP RELATED NEWS
                </h3>
                <RelatedArticles 
                  articleId={article.id} 
                  categoryId={article.categoryId} 
                  limit={3}
                />
              </div>
            </div>
          </div>
          
          {/* Sidebar - 4 cols */}
          <div className="lg:col-span-4">
            {/* Sticky Sidebar */}
            <div className="lg:sticky lg:top-24 space-y-8">
              {/* Advertisement */}
              <div className="bg-white p-5 rounded-md shadow-sm">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-md p-5 text-white text-center">
                  <div className="mb-3">
                    <i className="fas fa-podcast text-3xl"></i>
                  </div>
                  <h3 className="font-bold text-xl mb-2">DAILY PODCAST</h3>
                  <p className="text-sm mb-4">Listen to our Tamil Keetru podcast</p>
                  <button className="bg-white text-orange-500 font-bold px-4 py-2 rounded">
                    Listen Now
                  </button>
                </div>
              </div>
              
              {/* Similar Category Articles */}
              <div className="bg-white p-5 rounded-md shadow-sm">
                <h3 className="text-lg font-bold font-['Roboto_Condensed'] mb-4 border-b pb-2">
                  MORE FROM {article.category.name.toUpperCase()}
                </h3>
                <div className="space-y-4">
                  {/* We'll use a query to fetch popular articles from the same category */}
                  <PopularCategoryArticles categoryId={article.categoryId} exclude={article.id} />
                </div>
              </div>
              
              {/* Newsletter Signup */}
              <div className="bg-white p-5 rounded-md shadow-sm">
                <h3 className="text-lg font-bold font-['Roboto_Condensed'] mb-4 border-b pb-2">
                  STAY UPDATED
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Get the Tamil Keetru delivered to your inbox
                </p>
                <form className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder:text-gray-400"
                  />
                  <button className="w-full bg-secondary text-white font-bold py-2 px-4 rounded-md hover:bg-secondary/90 transition-colors">
                    SUBSCRIBE
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    By subscribing, you agree to our <Link href="/privacy-policy" className="text-secondary hover:underline">privacy policy</Link>
                  </p>
                </form>
              </div>
              
              {/* Second Advertisement */}
              <div className="bg-white p-5 rounded-md shadow-sm">
                <div className="border border-dashed border-gray-300 p-8 text-center bg-gray-50 rounded">
                  <p className="text-gray-500 font-bold">ADVERTISEMENT</p>
                  <p className="text-gray-400 text-sm">300x250</p>
                </div>
              </div>
              
              {/* Tags */}
              <div className="bg-white p-5 rounded-md shadow-sm">
                <h3 className="text-lg font-bold font-['Roboto_Condensed'] mb-4 border-b pb-2">
                  TRENDING TOPICS
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Link href="/?search=Politics" className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">
                    Politics
                  </Link>
                  <Link href="/?search=Economy" className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">
                    Economy
                  </Link>
                  <Link href="/?search=Technology" className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">
                    Technology
                  </Link>
                  <Link href="/?search=Health" className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">
                    Health
                  </Link>
                  <Link href="/?search=Climate" className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">
                    Climate
                  </Link>
                  <Link href="/?search=Sports" className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">
                    Sports
                  </Link>
                  <Link href="/?search=Entertainment" className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">
                    Entertainment
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Full Width Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold font-['Roboto_Condensed'] mb-6 border-l-4 border-secondary pl-3">
            YOU MAY ALSO LIKE
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* We'll fetch popular articles across all categories */}
            <PopularArticles exclude={article.id} limit={4} />
          </div>
        </div>
      </div>
    </div>
  );
}
