import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ArticleWithDetails } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ArticleCardProps {
  article: ArticleWithDetails;
  variant?: "full" | "compact" | "list-item";
}

export default function ArticleCard({ article, variant = "full" }: ArticleCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like articles",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiRequest("POST", `/api/articles/${article.id}/like`, { userId: user.id });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${article.id}`] });
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

  if (variant === "list-item") {
    return (
      <li className="py-3 flex">
        <img 
          src={article.coverImage} 
          alt={article.title} 
          className="w-20 h-20 object-cover rounded mr-3"
        />
        <div>
          <Link href={`/article/${article.slug}`}>
            <h4 className="font-bold font-['Roboto_Condensed'] hover:text-secondary">{article.title}</h4>
          </Link>
          <p className="text-xs text-gray-500 mt-1">
            <i className="far fa-clock mr-1"></i> 
            {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
          </p>
        </div>
      </li>
    );
  }

  if (variant === "compact") {
    return (
      <div className="bg-white rounded-md shadow-md p-3 article-card h-full">
        <span className="text-xs text-gray-500">
          <i className="far fa-clock mr-1"></i> 
          {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
        </span>
        <Link href={`/article/${article.slug}`}>
          <h4 className="font-bold font-['Roboto_Condensed'] mt-2 hover:text-secondary">{article.title}</h4>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-md overflow-hidden article-card h-full transition-transform hover:-translate-y-1">
      <img 
        src={article.coverImage} 
        alt={article.title} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <span className={`${getCategoryColor(article.category.name)} text-white px-2 py-1 text-xs font-bold font-['Roboto_Condensed'] mb-2 inline-block`}>
          {article.category.name.toUpperCase()}
        </span>
        <Link href={`/article/${article.slug}`}>
          <h3 className="text-lg font-bold mb-2 font-['Roboto_Condensed'] hover:text-secondary">
            {article.title}
          </h3>
        </Link>
        <p className="text-gray-600 mb-3 text-sm line-clamp-3">{article.excerpt}</p>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div>
            <i className="far fa-clock mr-1"></i> 
            {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-secondary p-0"
              onClick={handleLike}
            >
              <i className="far fa-heart mr-1"></i> {article.likeCount}
            </Button>
            <Link href={`/article/${article.slug}#comments`}>
              <span><i className="far fa-comment mr-1"></i> {article.commentCount}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCategoryColor(category: string): string {
  const categoryMap: Record<string, string> = {
    'Technology': 'bg-secondary',
    'Politics': 'bg-secondary',
    'Business': 'bg-secondary',
    'Sports': 'bg-[#28A745]',
    'Entertainment': 'bg-[#17a2b8]',
    'Health': 'bg-[#dc3545]',
    'Science': 'bg-[#6f42c1]',
    'World': 'bg-[#fd7e14]',
    'Opinion': 'bg-[#6c757d]'
  };

  return categoryMap[category] || 'bg-secondary';
}
