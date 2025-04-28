import { useQuery } from "@tanstack/react-query";
import { ArticleWithDetails } from "@shared/schema";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function PopularNews() {
  const { data: popularArticles, isLoading } = useQuery<ArticleWithDetails[]>({
    queryKey: ["/api/articles/popular"],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-md shadow-md p-4 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 w-32 mb-3 pb-2"></div>
        <ol className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <li key={index} className="flex items-start">
              <div className="text-2xl font-bold text-secondary mr-3 w-5">{index + 1}</div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (!popularArticles || popularArticles.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-md shadow-md p-4 mb-6">
      <h3 className="font-bold font-['Roboto_Condensed'] text-lg mb-3 pb-2 border-b border-gray-200">
        MOST READ
      </h3>
      <ol className="space-y-4">
        {popularArticles.slice(0, 5).map((article, index) => (
          <li key={article.id} className="flex items-start">
            <span className="text-2xl font-bold text-secondary mr-3 font-['Roboto_Condensed']">
              {index + 1}
            </span>
            <div>
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
          </li>
        ))}
      </ol>
    </div>
  );
}
