import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

export default function BreakingNews() {
  const { data: breakingArticles, isLoading } = useQuery({
    queryKey: ['/api/articles/breaking'],
    staleTime: 30000, // 30 seconds
  });
  
  if (isLoading) {
    return (
      <div className="bg-accent text-darkText py-2 overflow-hidden relative">
        <div className="container mx-auto px-4 flex items-center">
          <span className="bg-primary text-white px-2 py-1 text-xs font-bold font-condensed mr-4 flex-shrink-0">BREAKING</span>
          <div className="overflow-hidden whitespace-nowrap">
            <span className="inline-block animate-pulse w-full h-4 bg-gray-300 rounded"></span>
          </div>
        </div>
      </div>
    );
  }
  
  if (!breakingArticles || breakingArticles.length === 0) {
    return null;
  }
  
  // Create ticker text from breaking news titles
  const tickerText = breakingArticles.map((article: any) => 
    `${article.title}`
  ).join(' • ');
  
  return (
    <div className="bg-accent text-darkText py-2 overflow-hidden relative">
      <div className="container mx-auto px-4 flex items-center">
        <span className="bg-primary text-white px-2 py-1 text-xs font-bold font-condensed mr-4 flex-shrink-0">BREAKING</span>
        <div className="overflow-hidden whitespace-nowrap">
          <span 
            className="inline-block animate-[ticker_20s_linear_infinite]"
            style={{animation: 'ticker 20s linear infinite'}}
          >
            {breakingArticles.map((article: any, index: number) => (
              <span key={article.id}>
                <Link href={`/article/${article.slug}`} className="hover:underline">
                  {article.title}
                </Link>
                {index < breakingArticles.length - 1 && ' • '}
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
