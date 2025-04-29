import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [location, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState('/');

  // Update active category based on URL
  useEffect(() => {
    // Extract category from URL if present
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const category = urlParams.get('category');
    
    if (location === '/') {
      setActiveCategory('/');
    } else if (category) {
      setActiveCategory(`/?category=${category}`);
    }
  }, [location]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search')?.toString();
    if (query) {
      setIsSearchOpen(false);
      navigate(`/?search=${encodeURIComponent(query)}`);
    }
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate('/');
  };

  const categories = [
    { name: "HOME", path: "/" },
    { name: "POLITICS", path: "/?category=politics" },
    { name: "SPORTS", path: "/?category=sports" },
    { name: "BUSINESS", path: "/?category=business" },
    { name: "ENTERTAINMENT", path: "/?category=entertainment" },
    { name: "TECHNOLOGY", path: "/?category=technology" },
    { name: "HEALTH", path: "/?category=health" },
    { name: "SCIENCE", path: "/?category=science" },
    { name: "OPINION", path: "/?category=opinion" }
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-secondary">
        <div className="container mx-auto px-4 py-1 flex justify-between items-center">
          <div className="text-white text-xs md:text-sm flex space-x-4">
            <span className="hidden md:inline">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <Dialog>
              <DialogTrigger asChild>
                <button className="hover:underline text-white">Subscribe</button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Subscribe to Daily News</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-gray-600 mb-4">Get exclusive access to premium content and special offers.</p>
                  <div className="space-y-4">
                    <div className="bg-gray-100 p-4 rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold">Monthly Plan</h3>
                        <span className="font-bold text-secondary">$9.99/month</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Unlimited access to all content with no long-term commitment.</p>
                      <Button className="w-full bg-secondary text-white">Subscribe Monthly</Button>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-md border-2 border-secondary">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold">Annual Plan</h3>
                        <div>
                          <span className="font-bold text-secondary">$89.99/year</span>
                          <span className="text-xs bg-secondary text-white px-2 py-1 rounded-full ml-2">SAVE 25%</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Our best value plan with significant savings.</p>
                      <Button className="w-full bg-secondary text-white">Subscribe Annually</Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <button className="hover:underline text-white">Newsletter</button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Subscribe to Our Newsletter</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-gray-600 mb-4">Get the latest news and updates delivered straight to your inbox.</p>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="newsletter-name" className="block text-sm font-medium">Full Name</label>
                      <Input id="newsletter-name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="newsletter-email" className="block text-sm font-medium">Email</label>
                      <Input id="newsletter-email" type="email" placeholder="Your email address" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Interests (Optional)</label>
                      <div className="flex flex-wrap gap-2">
                        {categories.slice(1).map((category, index) => (
                          <label key={index} className="flex items-center space-x-2 text-sm">
                            <input type="checkbox" className="rounded text-secondary" />
                            <span>{category.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button type="submit" className="w-full bg-secondary text-white">Subscribe</Button>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      By subscribing, you agree to our privacy policy and terms of service.
                    </p>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-white hover:text-gray-200"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="text-white hover:text-gray-200"><i className="fab fa-twitter"></i></a>
            <a href="#" className="text-white hover:text-gray-200"><i className="fab fa-instagram"></i></a>
            <a href="#" className="text-white hover:text-gray-200"><i className="fab fa-youtube"></i></a>
          </div>
        </div>
      </div>
      
      {/* Main header */}
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden text-secondary text-2xl">
              <i className="fas fa-bars"></i>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <div className="p-4 border-b border-gray-200">
              <form className="flex">
                <Input type="text" placeholder="Search..." className="mr-2" />
                <Button type="submit" className="bg-secondary text-white">
                  <i className="fas fa-search"></i>
                </Button>
              </form>
            </div>
            <div className="p-4 border-b border-gray-200">
              {user ? (
                <div className="space-y-2">
                  <div className="font-medium">{user.username}</div>
                  {user.isAdmin && (
                    <Link href="/admin">
                      <Button variant="outline" className="w-full text-left justify-start">
                        <i className="fas fa-cog mr-2"></i> Admin Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button 
                    onClick={handleLogout} 
                    className="w-full bg-secondary text-white"
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? (
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                    ) : (
                      <i className="fas fa-sign-out-alt mr-2"></i>
                    )}
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link href="/auth">
                  <Button className="w-full bg-secondary text-white">
                    <i className="fas fa-user mr-2"></i> Sign In / Register
                  </Button>
                </Link>
              )}
            </div>
            <nav>
              <ul className="font-['Roboto_Condensed'] font-semibold">
                {categories.map((category, index) => (
                  <li key={index}>
                    <Link 
                      href={category.path} 
                      className={`block py-3 px-4 border-b border-gray-200 hover:bg-gray-100 ${
                        activeCategory === category.path ? 'text-secondary' : ''
                      }`}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </SheetContent>
        </Sheet>
        
        <Link href="/" className="text-secondary font-bold text-3xl md:text-4xl font-['Roboto_Condensed']">
          DAILY NEWS
        </Link>
        
        <div className="flex items-center space-x-3">
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="text-gray-700 hover:text-secondary text-xl hidden md:flex">
                <i className="fas fa-search"></i>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Search Daily News</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSearchSubmit} className="mt-4">
                <div className="flex">
                  <Input 
                    type="text" 
                    name="search"
                    placeholder="Search for news, topics..." 
                    className="rounded-r-none"
                  />
                  <Button type="submit" className="rounded-l-none bg-secondary text-white">
                    Search
                  </Button>
                </div>
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Popular Searches:</h3>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/?search=Politics" onClick={() => setIsSearchOpen(false)} className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300">Politics</Link>
                    <Link href="/?search=Sports" onClick={() => setIsSearchOpen(false)} className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300">Sports</Link>
                    <Link href="/?search=Economy" onClick={() => setIsSearchOpen(false)} className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300">Economy</Link>
                    <Link href="/?search=Climate" onClick={() => setIsSearchOpen(false)} className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300">Climate Change</Link>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm">{user.username}</span>
              <Button 
                variant="ghost" 
                className="text-darkText hover:text-secondary"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <i className="fas fa-spinner fa-spin mr-1"></i>
                ) : (
                  <i className="fas fa-sign-out-alt mr-1"></i>
                )}
                Sign Out
              </Button>
            </div>
          ) : (
            <Link href="/auth" className="hidden md:block text-darkText hover:text-secondary">
              <i className="fas fa-user mr-1"></i> Sign In
            </Link>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="bg-white border-t border-b border-gray-200 hidden md:block">
        <div className="container mx-auto px-4">
          <ul className="flex justify-between items-center text-sm font-['Roboto_Condensed'] font-semibold">
            {categories.map((category, index) => (
              <li key={index}>
                <Link 
                  href={category.path} 
                  className={`inline-block py-3 px-3 hover:text-secondary transition-colors ${
                    activeCategory === category.path ? 'text-secondary' : ''
                  }`}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
