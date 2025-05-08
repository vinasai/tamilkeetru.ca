import { useQuery } from "@tanstack/react-query";
import { ArticleWithDetails } from "@shared/schema";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function OffRoadSection() {
  // Get all articles
  const { data: articles, isLoading } = useQuery<ArticleWithDetails[]>({
    queryKey: ['/api/articles'],
    staleTime: 300000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="w-full py-8 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold font-['Roboto_Condensed'] border-l-4 border-secondary pl-3 mb-6">
            OFF ROAD
          </h2>
          <div className="space-y-4 animate-pulse">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="flex bg-white rounded-md shadow-md overflow-hidden h-36">
                <div className="w-48 h-full bg-gray-200"></div>
                <div className="flex-1 p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Take up to 20 articles for display
  const offRoadArticles = articles?.slice(0, 20) || [];

  if (offRoadArticles.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-8 bg-white">
      <div className="container mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold font-['Roboto_Condensed'] border-l-4 border-secondary pl-3">
            OFF ROAD
          </h2>
          <Link href="/?category=offroad" className="text-secondary text-sm font-medium hover:underline">
            View All <i className="fas fa-chevron-right text-xs ml-1"></i>
          </Link>
        </div>
        
        <div className="space-y-4">
          {offRoadArticles.map((article, index) => (
            <div 
              key={article.id} 
              className="flex bg-white rounded-md shadow-md overflow-hidden transition-transform hover:shadow-lg"
            >
              <div className="w-48 md:w-64 h-36 md:h-40 overflow-hidden flex-shrink-0">
                <Link href={`/article/${article.slug}`}>
                  <img 
                    src={article.coverImage} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/800x600?text=Tamil+Keetru";
                    }}
                  />
                </Link>
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center text-xs font-medium mb-2">
                    <span className="text-secondary">{article.category.name}</span>
                    {/* <span className="mx-2 text-gray-400">•</span> */}
                    {/* <span className="text-gray-500">{index + 1}</span> */}
                  </div>
                  <Link href={`/article/${article.slug}`}>
                    <h3 className="font-bold text-lg hover:text-secondary transition-colors mb-2">
                      {article.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm hidden md:block line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
                <div className="flex items-center text-gray-500 text-xs mt-2">
                  <span>
                    <i className="far fa-clock mr-1"></i> 
                    {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    <i className="far fa-user mr-1"></i> 
                    {article.author.username}
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    <i className="far fa-comment mr-1"></i> 
                    {article.commentCount} Comments
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 