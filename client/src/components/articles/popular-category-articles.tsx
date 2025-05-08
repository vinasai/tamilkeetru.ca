import { useQuery } from "@tanstack/react-query";
import { ArticleWithDetails } from "@shared/schema";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

interface PopularCategoryArticlesProps {
  categorySlug: string;
  exclude?: number;
  limit?: number;
}

export default function PopularCategoryArticles({ 
  categorySlug, 
  exclude, 
  limit = 4 
}: PopularCategoryArticlesProps) {
  const { data: articles, isLoading } = useQuery<ArticleWithDetails[]>({
    queryKey: [`/api/articles/category/${categorySlug}`],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(limit)].map((_, index) => (
          <div key={index} className="flex items-start animate-pulse">
            <div className="w-20 h-16 bg-gray-200 flex-shrink-0 mr-3 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return <p className="text-gray-500 text-sm">No articles found</p>;
  }

  // Filter out the excluded article and limit the number of results
  const filteredArticles = articles
    .filter(article => !exclude || article.id !== exclude)
    .slice(0, limit);

  if (filteredArticles.length === 0) {
    return <p className="text-gray-500 text-sm">No articles found</p>;
  }

  return (
    <div className="space-y-4">
      {filteredArticles.map(article => (
        <div key={article.id} className="flex items-start">
          <img 
            src={article.coverImage}
            alt={article.title}
            className="w-20 h-16 object-cover flex-shrink-0 mr-3 rounded"
          />
          <div>
            <Link href={`/article/${article.slug}`}>
              <h4 className="font-semibold text-sm hover:text-secondary line-clamp-2">
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
  );
}