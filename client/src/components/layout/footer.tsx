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

  return (
    <footer className="bg-darkText text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-lg font-bold font-['Roboto_Condensed'] mb-4">ABOUT US</h4>
            <p className="text-gray-400 text-sm mb-4">
              Daily News delivers timely, accurate reporting on the stories that matter most. 
              Our team of dedicated journalists work around the clock to bring you 
              independent, trustworthy news coverage.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-gray-300"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="text-white hover:text-gray-300"><i className="fab fa-twitter"></i></a>
              <a href="#" className="text-white hover:text-gray-300"><i className="fab fa-instagram"></i></a>
              <a href="#" className="text-white hover:text-gray-300"><i className="fab fa-youtube"></i></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold font-['Roboto_Condensed'] mb-4">LATEST NEWS</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="pb-3 border-b border-gray-700">
                <Link href="/article/global-markets-rally" className="hover:text-white">
                  Global Markets Rally as Central Banks Announce Coordinated Policy
                </Link>
              </li>
              <li className="pb-3 border-b border-gray-700">
                <Link href="/article/tech-giants-announce-ai" className="hover:text-white">
                  Tech Giants Announce New AI Initiative to Address Global Challenges
                </Link>
              </li>
              <li className="pb-3 border-b border-gray-700">
                <Link href="/article/national-team-victory" className="hover:text-white">
                  National Team Secures Dramatic Last-Minute Victory in Tournament Qualifier
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold font-['Roboto_Condensed'] mb-4">CATEGORIES</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {categories.map((category, index) => (
                <li key={index}>
                  <Link href={category.path} className="hover:text-white">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold font-['Roboto_Condensed'] mb-4">CONTACT US</h4>
            <address className="text-sm text-gray-400 not-italic">
              <p className="mb-2"><i className="fas fa-map-marker-alt mr-2"></i> 123 News Street, Cityville</p>
              <p className="mb-2"><i className="fas fa-phone-alt mr-2"></i> (123) 456-7890</p>
              <p className="mb-2"><i className="fas fa-envelope mr-2"></i> contact@dailynews.com</p>
            </address>
            <form className="mt-4" onSubmit={handleNewsletterSubmit}>
              <div className="flex">
                <Input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-gray-700 text-white rounded-r-none focus:ring-secondary border-gray-700"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <Button 
                  type="submit" 
                  className="bg-secondary text-white rounded-l-none hover:bg-secondary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : "Submit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-700 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Daily News. All Rights Reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Cookies Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
