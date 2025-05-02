import { Link } from 'wouter';
import { Heart, MessageSquare, Clock, User } from 'lucide-react';
import { formatDateRelative, truncateText, getCategoryColor } from '@/lib/utils';

interface ArticleCardProps {
  article: {
    id: number;
    title: string;
    slug: string;
    summary: string;
    imageUrl: string;
    categoryName?: string;
    authorName?: string;
    publishedAt: string;
    likesCount?: number;
    commentsCount?: number;
  };
  variant?: 'normal' | 'compact' | 'horizontal';
}

export default function ArticleCard({ article, variant = 'normal' }: ArticleCardProps) {
  const {
    title,
    slug,
    summary,
    imageUrl,
    categoryName = 'News',
    authorName = 'Staff Writer',
    publishedAt,
    likesCount = 0,
    commentsCount = 0
  } = article;
  
  if (variant === 'compact') {
    return (
      <div className="py-3 flex">
        <Link href={`/article/${slug}`}>
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-20 h-20 object-cover rounded mr-3"
          />
        </Link>
        <div>
          <h4 className="font-bold font-condensed">
            <Link href={`/article/${slug}`}>{title}</Link>
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            <Clock className="inline h-3 w-3 mr-1 align-text-bottom" /> {formatDateRelative(publishedAt)}
          </p>
        </div>
      </div>
    );
  }
  
  if (variant === 'horizontal') {
    return (
      <div className="bg-white rounded-md shadow-md overflow-hidden article-card">
        <div className="flex flex-col md:flex-row">
          <Link href={`/article/${slug}`} className="md:w-2/5">
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-48 md:h-full object-cover"
            />
          </Link>
          <div className="p-4 md:w-3/5">
            <span className={`${getCategoryColor(categoryName)} text-white px-2 py-1 text-xs font-bold font-condensed mb-2 inline-block`}>
              {categoryName.toUpperCase()}
            </span>
            <h3 className="text-lg font-bold mb-2 font-condensed">
              <Link href={`/article/${slug}`}>{title}</Link>
            </h3>
            <p className="text-gray-600 text-sm mb-3">{truncateText(summary, 120)}</p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <div>
                <Clock className="inline h-3 w-3 mr-1 align-text-bottom" /> {formatDateRelative(publishedAt)}
              </div>
              <div className="flex space-x-3">
                <button className="flex items-center transition-colors hover:text-primary">
                  <Heart className="h-3 w-3 mr-1" /> {likesCount}
                </button>
                <button className="flex items-center transition-colors hover:text-primary">
                  <MessageSquare className="h-3 w-3 mr-1" /> {commentsCount}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Default card (normal variant)
  return (
    <div className="bg-white rounded-md shadow-md overflow-hidden article-card h-full">
      <Link href={`/article/${slug}`}>
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-4">
        <span className={`${getCategoryColor(categoryName)} text-white px-2 py-1 text-xs font-bold font-condensed mb-2 inline-block`}>
          {categoryName.toUpperCase()}
        </span>
        <h3 className="text-lg font-bold mb-2 font-condensed">
          <Link href={`/article/${slug}`}>{title}</Link>
        </h3>
        <p className="text-gray-600 mb-3 text-sm line-clamp-3">{summary}</p>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div>
            <Clock className="inline h-3 w-3 mr-1 align-text-bottom" /> {formatDateRelative(publishedAt)}
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center transition-colors hover:text-primary">
              <Heart className="h-3 w-3 mr-1" /> {likesCount}
            </button>
            <button className="flex items-center transition-colors hover:text-primary">
              <MessageSquare className="h-3 w-3 mr-1" /> {commentsCount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
