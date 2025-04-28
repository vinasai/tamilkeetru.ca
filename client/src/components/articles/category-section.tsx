import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArticleWithDetails } from "@shared/schema";
import ArticleCard from "./article-card";

interface CategorySectionProps {
  category: string;
  slug: string;
  limit?: number;
  variant?: "default" | "fullWidth" | "columns";
}

export default function CategorySection({ 
  category, 
  slug, 
  limit = 4,
  variant = "default"
}: CategorySectionProps) {
  const { data: articles, isLoading } = useQuery<ArticleWithDetails[]>({
    queryKey: [`/api/articles/category/${slug}`, limit],
  });

  if (isLoading) {
    return (
      <section className="mb-8 animate-pulse">
        <div className="h-8 bg-gray-200 w-48 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200"></div>
          <div className="h-64 bg-gray-200"></div>
        </div>
      </section>
    );
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  const getCategoryColor = (categoryName: string): string => {
    const colors: Record<string, string> = {
      'Sports': 'border-[#28A745]',
      'Technology': 'border-secondary',
      'Business': 'border-secondary',
      'Entertainment': 'border-[#17a2b8]',
      'Health': 'border-[#dc3545]',
      'Science': 'border-[#6f42c1]',
      'World': 'border-[#fd7e14]',
      'Opinion': 'border-[#6c757d]'
    };

    return colors[categoryName] || 'border-secondary';
  };

  // Standard two-column layout (main article + list)
  if (variant === "default") {
    const mainArticle = articles[0];
    const secondaryArticles = articles.slice(1, limit);

    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold font-['Roboto_Condensed'] border-l-4 ${getCategoryColor(category)} pl-3`}>
            {category.toUpperCase()}
          </h2>
          <Link href={`/?category=${slug}`} className="text-secondary text-sm font-medium hover:underline">
            More {category} <i className="fas fa-chevron-right text-xs ml-1"></i>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mainArticle && (
            <ArticleCard article={mainArticle} />
          )}

          <div className="bg-white rounded-md shadow-md p-4">
            <ul className="divide-y divide-gray-200">
              {secondaryArticles.map((article) => (
                <ArticleCard key={article.id} article={article} variant="list-item" />
              ))}
            </ul>
          </div>
        </div>
      </section>
    );
  }

  // Full-width layout (large article with excerpt + 3 smaller cards below)
  if (variant === "fullWidth") {
    const mainArticle = articles[0];
    const secondaryArticles = articles.slice(1, 4);

    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold font-['Roboto_Condensed'] border-l-4 ${getCategoryColor(category)} pl-3`}>
            {category.toUpperCase()}
          </h2>
          <Link href={`/?category=${slug}`} className="text-secondary text-sm font-medium hover:underline">
            More {category} <i className="fas fa-chevron-right text-xs ml-1"></i>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {mainArticle && (
            <div className="bg-white rounded-md shadow-md overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <img 
                  src={mainArticle.coverImage} 
                  alt={mainArticle.title} 
                  className="w-full md:w-2/5 h-48 md:h-auto object-cover"
                />
                <div className="p-4 md:w-3/5">
                  <Link href={`/article/${mainArticle.slug}`}>
                    <h3 className="text-lg font-bold mb-2 font-['Roboto_Condensed'] hover:text-secondary">
                      {mainArticle.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm mb-3">{mainArticle.excerpt}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div>
                      <i className="far fa-clock mr-1"></i> {new Date(mainArticle.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-3">
                      <span><i className="far fa-heart mr-1"></i> {mainArticle.likeCount}</span>
                      <span><i className="far fa-comment mr-1"></i> {mainArticle.commentCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {secondaryArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Three-column layout
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold font-['Roboto_Condensed'] border-l-4 ${getCategoryColor(category)} pl-3`}>
          {category.toUpperCase()}
        </h2>
        <Link href={`/?category=${slug}`} className="text-secondary text-sm font-medium hover:underline">
          More {category} <i className="fas fa-chevron-right text-xs ml-1"></i>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.slice(0, limit).map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
