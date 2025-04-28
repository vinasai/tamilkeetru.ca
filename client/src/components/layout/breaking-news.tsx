import { useQuery } from "@tanstack/react-query";
import { Article } from "@shared/schema";
import { Link } from "wouter";

export default function BreakingNews() {
  const { data: breakingNews } = useQuery<Article[]>({
    queryKey: ["/api/articles/breaking"],
  });

  if (!breakingNews || breakingNews.length === 0) {
    return null;
  }

  // Format breaking news headlines into a string
  const breakingNewsText = breakingNews.map(article => article.title).join(' • ');

  return (
    <div className="bg-accent text-darkText py-2 overflow-hidden relative">
      <div className="container mx-auto px-4 flex items-center">
        <span className="bg-secondary text-white px-2 py-1 text-xs font-bold font-['Roboto_Condensed'] mr-4 flex-shrink-0">
          BREAKING
        </span>
        <div className="overflow-hidden whitespace-nowrap">
          <div className="animate-[ticker_20s_linear_infinite] inline-block">
            {breakingNewsText}
          </div>
        </div>
      </div>
    </div>
  );
}
