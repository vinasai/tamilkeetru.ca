import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch, Link } from "wouter";
import { ArticleWithDetails, Category } from "@shared/schema";
import BreakingNews from "@/components/layout/breaking-news";
import HeroSlider from "@/components/articles/hero-slider";
import ArticleCard from "@/components/articles/article-card";
import CategorySection from "@/components/articles/category-section";
import NewsletterForm from "@/components/sidebar/newsletter-form";
import CategoriesWidget from "@/components/sidebar/categories-widget";
import PopularNews from "@/components/sidebar/popular-news";
import OffRoadSection from "@/components/off-road-section";
import AdDisplay from "@/components/advertisements/ad-display";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useScrollTop } from "@/hooks/use-scroll-top";
import TopSubscribers from "@/components/sidebar/top-subscribers";

// Add the Advertisement interface
interface Advertisement {
  id: number;
  position: string;
  isActive: boolean;
}

export default function HomePage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const categorySlug = params.get('category');
  const searchQuery = params.get('search');
  
  // Use the scroll to top hook
  useScrollTop();
  
  // State for view options
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortMethod, setSortMethod] = useState<"newest" | "oldest" | "a-z" | "z-a">("newest");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  // Get categories
  const { data: categoriesResponse } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Extract categories array, handling both standard array responses and our custom empty response format
  const categories = Array.isArray(categoriesResponse) 
    ? categoriesResponse 
    : categoriesResponse && typeof categoriesResponse === 'object' && 'data' in categoriesResponse && Array.isArray(categoriesResponse.data) 
      ? categoriesResponse.data 
      : [];

  // Get articles (filtered or all)
  const { data: articles, isLoading } = useQuery<ArticleWithDetails[]>({
    queryKey: [
      categorySlug ? `/api/articles/category/${categorySlug}` : '/api/articles', 
      categorySlug ? `category=${categorySlug}` : '', 
      searchQuery ? `search=${searchQuery}` : ''
    ],
  });

  // Check if home-page advertisements are available
  const { data: homePageAds } = useQuery<Advertisement[]>({
    queryKey: ['/api/advertisements', 'home-page'],
    queryFn: async () => {
      const response = await fetch('/api/advertisements?position=home-page');
      if (!response.ok) {
        throw new Error('Failed to fetch advertisements');
      }
      return response.json();
    },
    staleTime: 300000, // 5 minutes
  });
  
  // Determine if there are active ads for the home-page position
  const hasHomePageAds = homePageAds && homePageAds.length > 0;

  useEffect(() => {
    console.log("articles", articles);
  }, [articles]);

  // Add sorting function for articles with date filtering
  const filteredAndSortedArticles = articles ? [...articles]
    .filter(article => {
      // Apply date filter if it exists
      if (dateFilter) {
        const articleDate = new Date(article.createdAt);
        const filterDate = new Date(dateFilter);
        
        return (
          articleDate.getFullYear() === filterDate.getFullYear() &&
          articleDate.getMonth() === filterDate.getMonth() &&
          articleDate.getDate() === filterDate.getDate()
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortMethod) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "a-z":
          return a.title.localeCompare(b.title);
        case "z-a":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    }) : [];

  // Set document title
  useEffect(() => {
    document.title = searchQuery 
      ? `Search: ${searchQuery} - Tamil Keetru` 
      : categorySlug 
        ? `${getCategoryName(categorySlug, categories)} - Tamil Keetru` 
        : "Tamil Keetru - Breaking News, Latest Updates & Headlines";
  }, [searchQuery, categorySlug, categories]);

  // Helper to get category name from slug
  const getCategoryName = (slug: string, categoriesList?: any[]) => {
    if (!categoriesList || !Array.isArray(categoriesList) || categoriesList.length === 0) {
      return slug.charAt(0).toUpperCase() + slug.slice(1);
    }
    
    // Check if this is a valid category
    const category = categoriesList.find(c => c.slug === slug.toLowerCase());
    
    // Only return capitalized custom category if one of our valid categories wasn't found
    // This prevents arbitrary URL parameters from becoming page titles
    const validCategorySlugs = ["politics", "sports", "business", "entertainment", 
                              "technology", "health", "science", "opinion"];
    
    if (category) {
      return category.name;
    } else if (validCategorySlugs.includes(slug.toLowerCase())) {
      // If slug matches our predefined list but data hasn't loaded yet
      return slug.charAt(0).toUpperCase() + slug.slice(1);
    } else {
      // For invalid categories, use a default title
      return "Category Not Found";
    }
  };

  return (
    <>
      <BreakingNews />
      <div className="container mx-auto px-4 py-6">
        {/* Page Title for category or search */}
        {(categorySlug || searchQuery) && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold font-['Roboto_Condensed']">
              {searchQuery 
                ? `Search Results: ${searchQuery}` 
                : `${getCategoryName(categorySlug!, categories)}`
              }
            </h1>
            <div className="border-b border-gray-300 mt-2 mb-4"></div>
          </div>
        )}

        {/* Hero Banner - only show on home page */}
        {!categorySlug && !searchQuery && <HeroSlider />}

        {/* Filtering and View Options - only show for category or search */}
        {(categorySlug || searchQuery) && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-4 rounded-md shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 mb-3 sm:mb-0">
              <Select value={sortMethod} onValueChange={(value) => setSortMethod(value as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="a-z">A-Z</SelectItem>
                  <SelectItem value="z-a">Z-A</SelectItem>
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={dateFilter ? "border-secondary text-secondary" : ""}
                  >
                    <i className="far fa-calendar-alt mr-2"></i>
                    {dateFilter ? format(dateFilter, "PPP") : "Filter by Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                  {dateFilter && (
                    <div className="p-3 border-t border-gray-200">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setDateFilter(undefined)}
                        className="w-full"
                      >
                        Clear Date Filter
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">View:</span>
              <Button 
                variant={viewMode === "grid" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-3"
              >
                <i className="fas fa-th-large"></i>
              </Button>
              <Button 
                variant={viewMode === "list" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode("list")}
                className="px-3"
              >
                <i className="fas fa-list"></i>
              </Button>
            </div>
          </div>
        )}

        {/* Category/Search Results or Top Stories */}
        {(categorySlug || searchQuery) ? (
          // Show filtered results
          <div className="mb-10">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-md shadow-md overflow-hidden h-[320px] animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !articles || articles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg text-gray-600">No articles found.</p>
                <button 
                  onClick={() => setLocation('/')} 
                  className="mt-4 bg-secondary text-white px-4 py-2 rounded font-medium"
                >
                  Return to Home
                </button>
              </div>
            ) : filteredAndSortedArticles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg text-gray-600">No articles found matching your filters.</p>
                <Button 
                  onClick={() => {
                    setDateFilter(undefined);
                    setSortMethod("newest");
                  }} 
                  className="mt-4 bg-secondary text-white"
                >
                  Clear Filters
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedArticles.map(article => (
                  <ArticleCard key={article.id} article={article} variant="horizontal" />
                ))}
              </div>
            )}
            
            {filteredAndSortedArticles.length > 0 && (
              <div className="mt-6 text-center text-sm text-gray-500">
                Showing {filteredAndSortedArticles.length} {filteredAndSortedArticles.length === 1 ? 'article' : 'articles'}
                {dateFilter && <> from {format(dateFilter, "MMMM d, yyyy")}</>}
              </div>
            )}
          </div>
        ) : (
          // Show Top Stories
          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold font-['Roboto_Condensed'] border-l-4 border-secondary pl-3">
                TOP STORIES
              </h2>
              <button className="text-secondary text-sm font-medium hover:underline">
                View All <i className="fas fa-chevron-right text-xs ml-1"></i>
              </button>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-white rounded-md shadow-md overflow-hidden h-[320px] animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles?.slice(0, 3).map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Advertisement - Full Width */}
        {hasHomePageAds && (
          <div className="mb-12">
            <AdDisplay position="home-page" />
          </div>
        )}

        {/* Main Content Layout - only on homepage */}
        {!categorySlug && !searchQuery && (
          <>
            {/* Featured Grid Layout - Split 1:2:1 */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold font-['Roboto_Condensed'] border-l-4 border-secondary pl-3">
                  TRENDING NOW
                </h2>
                <button className="text-secondary text-sm font-medium hover:underline">
                  View All <i className="fas fa-chevron-right text-xs ml-1"></i>
                </button>
              </div>
              
              {isLoading ? (
                /* Loading Skeleton for Trending Now section */
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
                  {/* Left Column Skeleton */}
                  <div className="md:col-span-1">
                    <div className="relative h-[250px] rounded-md shadow-md overflow-hidden bg-gray-200">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-4">
                        <div className="mb-2">
                          <div className="bg-gray-300 h-5 w-16 rounded"></div>
                        </div>
                        <div className="h-5 bg-gray-300 rounded w-3/4 mb-1"></div>
                        <div className="h-5 bg-gray-300 rounded w-1/2 mb-3"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Center Column Skeleton */}
                  <div className="md:col-span-2">
                    <div className="relative h-[250px] rounded-md shadow-md overflow-hidden bg-gray-200">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-6">
                        <div className="mb-2">
                          <div className="bg-gray-300 h-5 w-20 rounded mr-2 inline-block"></div>
                          <div className="bg-gray-300 h-5 w-20 rounded inline-block"></div>
                        </div>
                        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
                        <div className="h-4 bg-gray-300 rounded w-full mb-3"></div>
                        <div className="flex space-x-4">
                          <div className="h-3 bg-gray-300 rounded w-20"></div>
                          <div className="h-3 bg-gray-300 rounded w-20"></div>
                          <div className="h-3 bg-gray-300 rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column Skeleton */}
                  <div className="md:col-span-1">
                    <div className="relative h-[250px] rounded-md shadow-md overflow-hidden bg-gray-200">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-4">
                        <div className="mb-2">
                          <div className="bg-gray-300 h-5 w-16 rounded"></div>
                        </div>
                        <div className="h-5 bg-gray-300 rounded w-3/4 mb-1"></div>
                        <div className="h-5 bg-gray-300 rounded w-1/2 mb-3"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Featured Left */}
                  <div className="md:col-span-1">
                    {articles && articles.length > 3 && (
                      <div className="relative h-full min-h-[250px] group overflow-hidden rounded-md shadow-md">
                        <img 
                          src={articles[3].coverImage} 
                          alt={articles[3].title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
                          <div className="mb-2">
                            <span className="bg-secondary text-white text-xs px-2 py-1 rounded">
                              {articles[3].category.name}
                            </span>
                          </div>
                          <h3 className="text-white font-semibold mb-1">
                            <Link href={`/article/${articles[3].slug}`} className="hover:text-secondary transition-colors">
                              {articles[3].title}
                            </Link>
                          </h3>
                          <div className="text-white/70 text-xs">
                            <span className="flex items-center"><i className="far fa-clock mr-1"></i> {new Date(articles[3].createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Featured Center */}
                  <div className="md:col-span-2">
                    {articles && articles.length > 0 && (
                      <div className="relative h-full min-h-[250px] group overflow-hidden rounded-md shadow-md">
                        <img 
                          src={articles[0].coverImage} 
                          alt={articles[0].title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col justify-end p-6">
                          <div className="mb-2">
                            <span className="bg-secondary text-white text-xs px-2 py-1 rounded">
                              {articles[0].category.name}
                            </span>
                            {articles[0].isBreaking && (
                              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded ml-2">
                                BREAKING
                              </span>
                            )}
                          </div>
                          <h3 className="text-white font-bold text-xl md:text-2xl mb-2">
                            <Link href={`/article/${articles[0].slug}`} className="hover:text-secondary transition-colors">
                              {articles[0].title}
                            </Link>
                          </h3>
                          <p className="text-white/80 mb-2 text-sm line-clamp-2">
                            {articles[0].excerpt}
                          </p>
                          <div className="text-white/70 text-xs flex items-center space-x-4">
                            <span className="flex items-center"><i className="far fa-clock mr-1"></i> {new Date(articles[0].createdAt).toLocaleDateString()}</span>
                            <span className="flex items-center"><i className="far fa-user mr-1"></i> {articles[0].author.username}</span>
                            <span className="flex items-center"><i className="far fa-comment mr-1"></i> {articles[0].commentCount}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Featured Right */}
                  <div className="md:col-span-1">
                    {articles && articles.length > 4 && (
                      <div className="relative h-full min-h-[250px] group overflow-hidden rounded-md shadow-md">
                        <img 
                          src={articles[4].coverImage} 
                          alt={articles[4].title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
                          <div className="mb-2">
                            <span className="bg-secondary text-white text-xs px-2 py-1 rounded">
                              {articles[4].category.name}
                            </span>
                          </div>
                          <h3 className="text-white font-semibold mb-1">
                            <Link href={`/article/${articles[4].slug}`} className="hover:text-secondary transition-colors">
                              {articles[4].title}
                            </Link>
                          </h3>
                          <div className="text-white/70 text-xs">
                            <span className="flex items-center"><i className="far fa-clock mr-1"></i> {new Date(articles[4].createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Advertisement Banner - only on homepage */}
            {!categorySlug && !searchQuery && hasHomePageAds && (
              <AdDisplay position="home-page" />
            )}

            {/* Three Column Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Column */}
              <div className="lg:col-span-2">
                {/* Editor's Picks - Special Grid */}
                <section className="mb-10">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold font-['Roboto_Condensed'] border-l-4 border-secondary pl-3">
                      EDITOR'S PICKS
                    </h2>
                    <button className="text-secondary text-sm font-medium hover:underline">
                      View All <i className="fas fa-chevron-right text-xs ml-1"></i>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Article 1 */}
                    {articles && articles.length > 1 && (
                      <div className="bg-white rounded-md shadow-md overflow-hidden flex flex-col h-full">
                        <div className="h-40 overflow-hidden">
                          <img 
                            src={articles[1].coverImage} 
                            alt={articles[1].title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-secondary text-white text-xs px-3 py-1 rounded-full">
                              {articles[1].category.name}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-semibold mb-2">
                            <Link href={`/article/${articles[1].slug}`} className="hover:text-secondary transition-colors">
                              {articles[1].title}
                            </Link>
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {articles[1].excerpt}
                          </p>
                          <div className="mt-auto text-gray-500 text-xs">
                            <span><i className="far fa-clock mr-1"></i> {new Date(articles[1].createdAt).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <span><i className="far fa-comments mr-1"></i> {articles[1].commentCount}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Article 2 */}
                    {articles && articles.length > 5 && (
                      <div className="bg-white rounded-md shadow-md overflow-hidden flex flex-col h-full">
                        <div className="h-40 overflow-hidden">
                          <img 
                            src={articles[5].coverImage} 
                            alt={articles[5].title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-secondary text-white text-xs px-3 py-1 rounded-full">
                              {articles[5].category.name}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-semibold mb-2">
                            <Link href={`/article/${articles[5].slug}`} className="hover:text-secondary transition-colors">
                              {articles[5].title}
                            </Link>
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {articles[5].excerpt}
                          </p>
                          <div className="mt-auto text-gray-500 text-xs">
                            <span><i className="far fa-clock mr-1"></i> {new Date(articles[5].createdAt).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <span><i className="far fa-comments mr-1"></i> {articles[5].commentCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Article 3 */}
                    {articles && articles.length > 6 && (
                      <div className="bg-white rounded-md shadow-md overflow-hidden flex flex-col h-full">
                        <div className="h-40 overflow-hidden">
                          <img 
                            src={articles[6].coverImage} 
                            alt={articles[6].title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-secondary text-white text-xs px-3 py-1 rounded-full">
                              {articles[6].category.name}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-semibold mb-2">
                            <Link href={`/article/${articles[6].slug}`} className="hover:text-secondary transition-colors">
                              {articles[6].title}
                            </Link>
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {articles[6].excerpt}
                          </p>
                          <div className="mt-auto text-gray-500 text-xs">
                            <span><i className="far fa-clock mr-1"></i> {new Date(articles[6].createdAt).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <span><i className="far fa-comments mr-1"></i> {articles[6].commentCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Article 4 */}
                    {articles && articles.length > 7 && (
                      <div className="bg-white rounded-md shadow-md overflow-hidden flex flex-col h-full">
                        <div className="h-40 overflow-hidden">
                          <img 
                            src={articles[7].coverImage} 
                            alt={articles[7].title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-secondary text-white text-xs px-3 py-1 rounded-full">
                              {articles[7].category.name}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-semibold mb-2">
                            <Link href={`/article/${articles[7].slug}`} className="hover:text-secondary transition-colors">
                              {articles[7].title}
                            </Link>
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {articles[7].excerpt}
                          </p>
                          <div className="mt-auto text-gray-500 text-xs">
                            <span><i className="far fa-clock mr-1"></i> {new Date(articles[7].createdAt).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <span><i className="far fa-comments mr-1"></i> {articles[7].commentCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
                
                {/* Highlight Advertisement */}
                <div className="mb-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-md p-5 text-white flex flex-col sm:flex-row items-center">
                  <div className="sm:w-1/3 mb-4 sm:mb-0 sm:mr-6 text-center">
                    <i className="fas fa-gift text-4xl mb-2"></i>
                    <h3 className="text-lg font-bold">SPECIAL OFFER</h3>
                  </div>
                  <div className="sm:w-2/3">
                    <p className="font-semibold mb-2">Subscribe today and get 50% off your first year!</p>
                    <p className="text-sm mb-3">Limited time offer. Don't miss out on this exclusive deal.</p>
                    <button className="bg-white text-orange-500 font-bold py-2 px-4 rounded hover:bg-white/90 transition-colors">
                      Subscribe Now
                    </button>
                  </div>
                </div>
                
                {/* Featured Categories */}
                <CategorySection category="Sports" slug="sports" variant="default" />
                <CategorySection category="Technology" slug="technology" variant="default" />
                <CategorySection category="Business" slug="business" variant="fullWidth" />
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Login/Register Widget */}
                <div className="bg-white rounded-md shadow-md p-4 mb-6">
                  <h3 className="font-bold font-['Roboto_Condensed'] text-lg mb-3 pb-2 border-b border-gray-200">
                    ACCOUNT
                  </h3>
                  <p className="text-gray-600 mb-3 text-sm">
                    Sign in to personalize your news feed and save articles.
                  </p>
                  <div className="flex space-x-2 mb-3">
                    <button 
                      onClick={() => setLocation('/auth?tab=login')}
                      className="bg-secondary text-white py-2 px-4 rounded flex-1 font-medium hover:bg-opacity-90"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => setLocation('/auth?tab=register')}
                      className="bg-gray-200 text-darkText py-2 px-4 rounded flex-1 font-medium hover:bg-gray-300"
                    >
                      Register
                    </button>
                  </div>
                  {/* <div className="text-center text-sm text-gray-500">
                    <span>Or continue with</span>
                    <div className="flex justify-center space-x-3 mt-2">
                      <a href="#" className="w-8 h-8 rounded-full bg-[#3b5998] text-white flex items-center justify-center">
                        <i className="fab fa-facebook-f"></i>
                      </a>
                      <a href="#" className="w-8 h-8 rounded-full bg-[#1da1f2] text-white flex items-center justify-center">
                        <i className="fab fa-twitter"></i>
                      </a>
                      <a href="#" className="w-8 h-8 rounded-full bg-[#db4437] text-white flex items-center justify-center">
                        <i className="fab fa-google"></i>
                      </a>
                    </div>
                  </div> */}
                </div>

                {/* Top Subscribers Widget */}
                <TopSubscribers />

                {/* Advertisement */}
                <div className="bg-gradient-to-br from-teal-500 to-blue-500 rounded-md p-4 text-white mb-6">
                  <div className="py-8 px-4 text-center">
                    <div className="rounded-full bg-white/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <i className="fas fa-headphones-alt text-2xl"></i>
                    </div>
                    <h3 className="font-bold text-xl mb-2">Tamil Keetru PODCAST</h3>
                    <p className="text-white/80 mb-4">Listen to our Tamil Keetru podcast and stay informed on the go!</p>
                    <button className="bg-white text-blue-600 font-bold py-2 px-6 rounded-full hover:bg-white/90 transition-colors">
                      Listen Now
                    </button>
                  </div>
                </div>

                {/* Popular News */}
                <PopularNews />

                {/* Second Advertisement */}
                <div className="bg-white rounded-md shadow-md p-3 text-center mb-6">
                  <div className="border border-dashed border-gray-400 py-12 px-4">
                    <p className="text-gray-500 font-bold">ADVERTISEMENT</p>
                    <p className="text-gray-500 text-sm">300x250 Ad</p>
                  </div>
                </div>

                {/* Newsletter Signup */}
                <NewsletterForm />

                {/* Categories Widget */}
                <CategoriesWidget />
              </div>
            </div>
            
            {/* "Off Road" Section - Full Width */}
            {!categorySlug && !searchQuery && (
              <OffRoadSection />
            )}
          </>
        )}
      </div>
    </>
  );
}
