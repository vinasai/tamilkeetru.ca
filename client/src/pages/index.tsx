import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { HeroSection } from "@/components/sections/hero-section";
import { FeaturedArticles } from "@/components/sections/featured-articles";
import { LatestArticles } from "@/components/sections/latest-articles";
import { PopularArticles } from "@/components/sections/popular-articles";
import { CategoryArticles } from "@/components/sections/category-articles";
import { Article, Category } from "@shared/schema";
import AdDisplay from "@/components/advertisements/ad-display";

export default function HomePage() {
// ... existing code ...

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Featured Articles */}
        <FeaturedArticles articles={featuredArticles} isLoading={isArticlesLoading} />
        
        {/* Advertisement banner after featured section */}
        <AdDisplay position="home-page" />

        {/* Latest and Popular Articles Section */}
        <LatestArticles articles={latestArticles} isLoading={isArticlesLoading} />
        <PopularArticles articles={popularArticles} isLoading={isArticlesLoading} />
      </div>
    
  );
}
// ... existing code ...
