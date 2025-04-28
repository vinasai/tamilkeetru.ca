import { useQuery } from "@tanstack/react-query";
import { ArticleWithDetails } from "@shared/schema";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

interface RelatedArticlesProps {
  articleId: number;
  categoryId: number;
  limit?: number;
}

export default function RelatedArticles({ articleId, categoryId, limit = 3 }: RelatedArticlesProps) {
  const { data: articles, isLoading } = useQuery<ArticleWithDetails[]>({
    queryKey: [`/api/articles/related/${articleId}`, categoryId, limit],
  });

  if (isLoading) {
    return (
      <div>
        <h3 className="text-xl font-bold font-['Roboto_Condensed'] mb-4">Related Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-md overflow-hidden animate-pulse">
              <div className="w-full h-32 bg-gray-200"></div>
              <div className="p-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xl font-bold font-['Roboto_Condensed'] mb-4">Related Articles</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.map(article => (
          <div key={article.id} className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <img 
              src={article.coverImage} 
              alt={article.title} 
              className="w-full h-32 object-cover"
            />
            <div className="p-3">
              <Link href={`/article/${article.slug}`}>
                <h4 className="font-bold font-['Roboto_Condensed'] text-sm hover:text-secondary">
                  {article.title}
                </h4>
              </Link>
              <p className="text-xs text-gray-500 mt-1">
                <i className="far fa-clock mr-1"></i> 
                {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
