import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { ArticleWithDetails, Category } from "@shared/schema";
import BreakingNews from "@/components/layout/breaking-news";
import HeroSlider from "@/components/articles/hero-slider";
import ArticleCard from "@/components/articles/article-card";
import CategorySection from "@/components/articles/category-section";
import NewsletterForm from "@/components/sidebar/newsletter-form";
import CategoriesWidget from "@/components/sidebar/categories-widget";
import PopularNews from "@/components/sidebar/popular-news";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const categorySlug = params.get('category');
  const searchQuery = params.get('search');

  // Get categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Get articles (filtered or all)
  const { data: articles, isLoading } = useQuery<ArticleWithDetails[]>({
    queryKey: [
      '/api/articles', 
      categorySlug ? `category=${categorySlug}` : '', 
      searchQuery ? `search=${searchQuery}` : ''
    ],
  });

  // Set document title
  useEffect(() => {
    document.title = searchQuery 
      ? `Search: ${searchQuery} - Daily News` 
      : categorySlug 
        ? `${getCategoryName(categorySlug, categories)} - Daily News` 
        : "Daily News - Breaking News, Latest Updates & Headlines";
  }, [searchQuery, categorySlug, categories]);

  // Helper to get category name from slug
  const getCategoryName = (slug: string, categories?: Category[]) => {
    if (!categories) return slug.charAt(0).toUpperCase() + slug.slice(1);
    const category = categories.find(c => c.slug === slug);
    return category ? category.name : (slug.charAt(0).toUpperCase() + slug.slice(1));
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
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

        {/* Advertisement Banner - only on homepage */}
        {!categorySlug && !searchQuery && (
          <div className="mb-8 bg-gray-200 rounded-md p-3 text-center">
            <div className="border border-dashed border-gray-400 py-8 px-4">
              <p className="text-gray-500 font-bold text-lg">ADVERTISEMENT</p>
              <p className="text-gray-500 text-sm">728x90 Banner Ad</p>
            </div>
          </div>
        )}

        {/* Main Content Layout - only on homepage */}
        {!categorySlug && !searchQuery && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2">
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
                  Account
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
                <div className="text-center text-sm text-gray-500">
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
                </div>
              </div>

              {/* Advertisement */}
              <div className="bg-gray-200 rounded-md p-3 text-center mb-6">
                <div className="border border-dashed border-gray-400 py-12 px-4">
                  <p className="text-gray-500 font-bold">ADVERTISEMENT</p>
                  <p className="text-gray-500 text-sm">300x250 Ad</p>
                </div>
              </div>

              {/* Popular News */}
              <PopularNews />

              {/* Newsletter Signup */}
              <NewsletterForm />

              {/* Categories Widget */}
              <CategoriesWidget />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
