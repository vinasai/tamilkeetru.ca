import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import ArticleCard from './article-card';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategoryColor } from '@/lib/utils';
import { EmptyState } from '@/components/ui/error-state';
import { useDataState } from '@/hooks/use-data-state';

interface CategorySectionProps {
  category: {
    id: number;
    name: string;
    slug: string;
  };
  variant?: 'grid' | 'featured' | 'list';
}

export default function CategorySection({ category, variant = 'featured' }: CategorySectionProps) {
  const { data: articles, isLoading, isEmpty, emptyMessage } = useDataState<any[]>(
    () => fetch(`/api/articles/category/${category.slug}`),
    {
      emptyMessage: `No articles found in ${category.name} category`,
      dependencies: [category.slug]
    }
  );
  
  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold font-condensed border-l-4 ${getCategoryColor(category.name)} pl-3`}>
            {category.name.toUpperCase()}
          </h2>
          <div className="w-20 h-6 bg-gray-200 animate-pulse rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] w-full rounded-md" />
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        </div>
      </section>
    );
  }
  
  if (isEmpty || !articles || articles.length === 0) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold font-condensed border-l-4 ${getCategoryColor(category.name)} pl-3`}>
            {category.name.toUpperCase()}
          </h2>
          <Link href={`/category/${category.slug}`} className="text-secondary text-sm font-medium hover:underline">
            View Category <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1 inline-block">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
        
        <EmptyState 
          title={`No ${category.name} Articles`}
          description={emptyMessage || `There are currently no articles in the ${category.name} category.`}
        />
      </section>
    );
  }
  
  const mainArticle = articles[0];
  const secondaryArticles = articles.slice(1, 4);
  
  if (variant === 'grid') {
    // Grid layout with 3 equal articles
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold font-condensed border-l-4 ${getCategoryColor(category.name)} pl-3`}>
            {category.name.toUpperCase()}
          </h2>
          <Link href={`/category/${category.slug}`} className="text-secondary text-sm font-medium hover:underline">
            More {category.name} <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1 inline-block">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {articles.slice(0, 3).map((article: any) => (
            <div key={article.id} className="bg-white rounded-md shadow-md p-3 article-card">
              <span className="text-xs text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(article.publishedAt).toLocaleDateString()}
              </span>
              <h4 className="font-bold font-condensed mt-2">
                <Link href={`/article/${article.slug}`}>{article.title}</Link>
              </h4>
            </div>
          ))}
        </div>
      </section>
    );
  }
  
  if (variant === 'list') {
    // Horizontal layout with one main article and list
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold font-condensed border-l-4 ${getCategoryColor(category.name)} pl-3`}>
            {category.name.toUpperCase()}
          </h2>
          <Link href={`/category/${category.slug}`} className="text-secondary text-sm font-medium hover:underline">
            More {category.name} <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1 inline-block">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
        
        <ArticleCard article={mainArticle} variant="horizontal" />
      </section>
    );
  }
  
  // Default featured layout (one main article with sidebar list)
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold font-condensed border-l-4 ${getCategoryColor(category.name)} pl-3`}>
          {category.name.toUpperCase()}
        </h2>
        <Link href={`/category/${category.slug}`} className="text-secondary text-sm font-medium hover:underline">
          More {category.name} <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1 inline-block">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main story */}
        <div className="bg-white rounded-md shadow-md overflow-hidden article-card">
          <Link href={`/article/${mainArticle.slug}`}>
            <img 
              src={mainArticle.imageUrl} 
              alt={mainArticle.title} 
              className="w-full h-48 object-cover"
            />
          </Link>
          <div className="p-4">
            <h3 className="text-lg font-bold mb-2 font-condensed">
              <Link href={`/article/${mainArticle.slug}`}>{mainArticle.title}</Link>
            </h3>
            <p className="text-gray-600 text-sm mb-3">{mainArticle.summary}</p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(mainArticle.publishedAt).toLocaleDateString()}
              </div>
              <div className="flex space-x-3">
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {mainArticle.likesCount || 0}
                </span>
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {mainArticle.commentsCount || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary articles */}
        <div className="bg-white rounded-md shadow-md p-4">
          <ul className="divide-y divide-gray-200">
            {secondaryArticles.map((article: any) => (
              <li key={article.id} className="py-3 flex">
                <Link href={`/article/${article.slug}`}>
                  <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="w-20 h-20 object-cover rounded mr-3"
                  />
                </Link>
                <div>
                  <h4 className="font-bold font-condensed">
                    <Link href={`/article/${article.slug}`}>{article.title}</Link>
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
