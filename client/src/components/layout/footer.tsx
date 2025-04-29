import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/newsletters", { email });
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter."
      });
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["/api/newsletters"] });
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { name: "Politics", path: "/?category=politics" },
    { name: "Business", path: "/?category=business" },
    { name: "Technology", path: "/?category=technology" },
    { name: "Sports", path: "/?category=sports" },
    { name: "Entertainment", path: "/?category=entertainment" },
    { name: "Health", path: "/?category=health" },
    { name: "Science", path: "/?category=science" },
    { name: "World", path: "/?category=world" }
  ];

  const quickLinks = [
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "Careers", path: "/careers" },
    { name: "Advertise", path: "/advertise" },
    { name: "Top Stories", path: "/top-stories" },
    { name: "Most Viewed", path: "/popular" },
  ];

  return (
    <footer className="bg-white text-darkText pt-16 pb-6 border-t border-gray-200 shadow-sm">
      {/* Newsletter Banner */}
      <div className="container mx-auto px-4 mb-12">
        <div className="bg-secondary rounded-lg p-6 md:p-8 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:mr-8 text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold font-['Roboto_Condensed'] mb-2 text-white">SUBSCRIBE TO OUR NEWSLETTER</h3>
            <p className="text-white/80">Get the latest news and updates delivered straight to your inbox</p>
          </div>
          <form onSubmit={handleNewsletterSubmit} className="w-full md:w-auto flex-1 max-w-md">
            <div className="flex">
              <Input 
                type="email" 
                placeholder="Your email address" 
                className="rounded-r-none bg-white border-white text-darkText placeholder-gray-400 focus:border-white"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Button 
                type="submit" 
                className="rounded-l-none bg-white text-secondary hover:bg-white/90 font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : "SUBSCRIBE"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="mb-6">
              <Link href="/" className="text-darkText font-bold text-3xl font-['Roboto_Condensed'] flex items-center">
                <img src="/logo.png" alt="Daily News Logo" className="h-10 mr-2" />
                DAILY NEWS
              </Link>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Daily News delivers timely, accurate reporting on the stories that matter most. 
              Our team of dedicated journalists work around the clock to bring you 
              independent, trustworthy news coverage.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center transition-colors hover:bg-secondary hover:text-white">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center transition-colors hover:bg-secondary hover:text-white">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center transition-colors hover:bg-secondary hover:text-white">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center transition-colors hover:bg-secondary hover:text-white">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold font-['Roboto_Condensed'] mb-6 relative text-darkText">
              <span className="inline-block border-b-2 border-secondary pb-2">LATEST NEWS</span>
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="pb-4 border-b border-gray-200">
                <Link href="/article/global-markets-rally" className="text-darkText hover:text-secondary transition-colors">
                  Global Markets Rally as Central Banks Cut Interest Rates
                </Link>
                <p className="text-gray-500 text-xs mt-1"><i className="far fa-clock mr-1"></i> April 25, 2025</p>
              </li>
              <li className="pb-4 border-b border-gray-200">
                <Link href="/article/ai-climate-change-prediction" className="text-darkText hover:text-secondary transition-colors">
                  New AI Model Can Predict Climate Change Impacts with Unprecedented Accuracy
                </Link>
                <p className="text-gray-500 text-xs mt-1"><i className="far fa-clock mr-1"></i> April 23, 2025</p>
              </li>
              <li className="pb-4 border-b border-gray-200">
                <Link href="/article/cancer-treatment-breakthrough" className="text-darkText hover:text-secondary transition-colors">
                  Revolutionary Cancer Treatment Shows 90% Success Rate in Clinical Trials
                </Link>
                <p className="text-gray-500 text-xs mt-1"><i className="far fa-clock mr-1"></i> April 22, 2025</p>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold font-['Roboto_Condensed'] mb-6 relative text-darkText">
              <span className="inline-block border-b-2 border-secondary pb-2">CATEGORIES</span>
            </h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {categories.map((category, index) => (
                <li key={index}>
                  <Link 
                    href={category.path} 
                    className="text-darkText hover:text-secondary transition-colors flex items-center"
                  >
                    <i className="fas fa-chevron-right text-secondary mr-2 text-xs"></i>
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            <h4 className="text-lg font-bold font-['Roboto_Condensed'] mt-8 mb-6 relative text-darkText">
              <span className="inline-block border-b-2 border-secondary pb-2">QUICK LINKS</span>
            </h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.path} 
                    className="text-darkText hover:text-secondary transition-colors flex items-center"
                  >
                    <i className="fas fa-chevron-right text-secondary mr-2 text-xs"></i>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold font-['Roboto_Condensed'] mb-6 relative text-darkText">
              <span className="inline-block border-b-2 border-secondary pb-2">CONTACT US</span>
            </h4>
            <address className="text-sm text-gray-600 not-italic space-y-4 mb-6">
              <div className="flex">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <i className="fas fa-map-marker-alt text-secondary"></i>
                </div>
                <div>
                  <p>123 News Street, Downtown</p>
                  <p>Cityville, NY 10001</p>
                </div>
              </div>
              <div className="flex">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <i className="fas fa-phone-alt text-secondary"></i>
                </div>
                <div>
                  <p>Newsroom: (123) 456-7890</p>
                  <p>Support: (123) 456-7891</p>
                </div>
              </div>
              <div className="flex">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <i className="fas fa-envelope text-secondary"></i>
                </div>
                <div>
                  <p>contact@dailynews.com</p>
                  <p>advertise@dailynews.com</p>
                </div>
              </div>
            </address>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <h5 className="text-sm font-semibold mb-3 text-darkText">MOBILE APP</h5>
              <div className="flex space-x-3">
                <a href="#" className="bg-gray-200 text-gray-700 hover:bg-secondary hover:text-white transition-colors p-2 rounded flex items-center">
                  <i className="fab fa-apple text-xl mr-2"></i>
                  <div className="text-xs">
                    <span className="block">Download on</span>
                    <span className="font-semibold">App Store</span>
                  </div>
                </a>
                <a href="#" className="bg-gray-200 text-gray-700 hover:bg-secondary hover:text-white transition-colors p-2 rounded flex items-center">
                  <i className="fab fa-google-play text-xl mr-2"></i>
                  <div className="text-xs">
                    <span className="block">Get it on</span>
                    <span className="font-semibold">Google Play</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Daily News. All Rights Reserved.</p>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-x-6 gap-y-2 justify-center">
            <Link href="/privacy-policy" className="text-darkText hover:text-secondary transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="text-darkText hover:text-secondary transition-colors">Terms of Service</Link>
            <Link href="/cookies-policy" className="text-darkText hover:text-secondary transition-colors">Cookies Policy</Link>
            <Link href="/sitemap" className="text-darkText hover:text-secondary transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
