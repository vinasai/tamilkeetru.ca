import { useQuery } from "@tanstack/react-query";
import { ArticleWithDetails } from "@shared/schema";
import { Link } from "wouter";

interface PopularArticlesProps {
  exclude?: number;
  limit?: number;
}

export default function PopularArticles({ exclude, limit = 4 }: PopularArticlesProps) {
  const { data: articles, isLoading } = useQuery<ArticleWithDetails[]>({
    queryKey: ['/api/articles/popular'],
  });

  if (isLoading) {
    return (
      <>
        {[...Array(limit)].map((_, index) => (
          <div key={index} className="bg-white rounded-md shadow-sm overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-5 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  // Filter out the excluded article and limit the number of results
  const filteredArticles = articles
    .filter(article => !exclude || article.id !== exclude)
    .slice(0, limit);

  if (filteredArticles.length === 0) {
    return null;
  }

  return (
    <>
      {filteredArticles.map(article => (
        <div key={article.id} className="bg-white rounded-md shadow-sm overflow-hidden flex flex-col h-full">
          <div className="relative h-48 overflow-hidden">
            <img 
              src={article.coverImage} 
              alt={article.title} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute top-3 left-3">
              <span className="bg-secondary text-white text-xs px-3 py-1 rounded-full">
                {article.category.name}
              </span>
            </div>
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <Link href={`/article/${article.slug}`}>
              <h3 className="font-bold text-lg mb-2 hover:text-secondary transition-colors line-clamp-2">
                {article.title}
              </h3>
            </Link>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {article.excerpt}
            </p>
            <div className="mt-auto flex justify-between text-gray-500 text-xs">
              <span><i className="far fa-clock mr-1"></i> {new Date(article.createdAt).toLocaleDateString()}</span>
              <span><i className="far fa-comments mr-1"></i> {article.commentCount}</span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}