import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { Link } from "wouter";

export default function CategoriesWidget() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-md shadow-md p-4 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 w-32 mb-3"></div>
        <ul className="space-y-2">
          {[...Array(8)].map((_, index) => (
            <li key={index} className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 w-24"></div>
              <div className="h-4 bg-gray-200 w-8 rounded-full"></div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-md shadow-md p-4 mb-6">
      <h3 className="font-bold font-['Roboto_Condensed'] text-lg mb-3 pb-2 border-b border-gray-200">
        CATEGORIES
      </h3>
      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category.id} className="flex justify-between items-center">
            <Link 
              href={`/?category=${category.slug}`} 
              className="text-darkText hover:text-secondary"
            >
              {category.name}
            </Link>
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
              {category.postCount}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
