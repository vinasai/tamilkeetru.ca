import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

export default function SitemapPage() {
  useEffect(() => {
    document.title = "Sitemap - Tamil Keetru";
  }, []);

  // Get categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const sections = [
    {
      title: "Main Pages",
      links: [
        { name: "Home", path: "/" },
        { name: "About Us", path: "/about" },
        { name: "Contact", path: "/contact" },
        { name: "Top Stories", path: "/top-stories" },
        { name: "Most Popular", path: "/popular" },
      ]
    },
    {
      title: "News Categories",
      links: categories?.map(category => ({
        name: category.name,
        path: `/?category=${category.slug}`
      })) || []
    },
    {
      title: "User Features",
      links: [
        { name: "Login/Register", path: "/auth" },
        { name: "My Account", path: "/account" },
        { name: "Saved Articles", path: "/account/saved" },
        { name: "Comment History", path: "/account/comments" },
      ]
    },
    {
      title: "Policies & Information",
      links: [
        { name: "Privacy Policy", path: "/privacy-policy" },
        { name: "Terms of Service", path: "/terms-of-service" },
        { name: "Cookies Policy", path: "/cookies-policy" },
        { name: "Advertise with Us", path: "/advertise" },
        { name: "Careers", path: "/careers" },
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sitemap</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-600 mb-8">
            Use this sitemap to navigate to any section of our website. If you can't find what you're looking for,
            please use the search function in the header or <Link href="/contact" className="text-secondary hover:underline">contact us</Link>.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((section, index) => (
              <div key={index}>
                <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">{section.title}</h2>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link 
                        href={link.path} 
                        className="text-gray-700 hover:text-secondary transition-colors flex items-center"
                      >
                        <i className="fas fa-chevron-right text-secondary mr-2 text-xs"></i>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="mt-12 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold mb-4">Additional Resources</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg text-center">
                <i className="fas fa-newspaper text-secondary text-3xl mb-3"></i>
                <h3 className="font-semibold mb-2">Newsletter</h3>
                <p className="text-sm text-gray-600">Subscribe to our newsletter for daily updates</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg text-center">
                <i className="fas fa-mobile-alt text-secondary text-3xl mb-3"></i>
                <h3 className="font-semibold mb-2">Mobile App</h3>
                <p className="text-sm text-gray-600">Download our app for iOS and Android</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg text-center">
                <i className="fas fa-headphones text-secondary text-3xl mb-3"></i>
                <h3 className="font-semibold mb-2">Podcast</h3>
                <p className="text-sm text-gray-600">Listen to our Tamil Keetru podcast</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}