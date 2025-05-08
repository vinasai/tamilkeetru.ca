import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation, useSearch } from "wouter";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useScrollTop } from "@/hooks/use-scroll-top";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [location, navigate] = useLocation();
  const search = useSearch();
  const [activeCategory, setActiveCategory] = useState('/');

  // Use the scroll to top hook
  useScrollTop();

  // Update active category based on URL from wouter
  useEffect(() => {
    const urlParams = new URLSearchParams(search);
    const category = urlParams.get('category');
    const searchQuery = urlParams.get('search');

    console.log("Header useEffect - location:", location, "search:", search, "category:", category, "searchQuery:", searchQuery);

    if (location === '/') {
      if (category) {
        setActiveCategory(`/?category=${category}`);
      } else if (searchQuery) {
        setActiveCategory('');
      } else {
        setActiveCategory('/');
      }
    } else if (location.startsWith('/article')) {
      // Keep the previously set activeCategory (do nothing here)
      // Or determine based on article data if available/needed
    } else {
      // Other pages (e.g., /auth, /profile)
      setActiveCategory('');
    }
  }, [location, search]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search')?.toString();
    if (query) {
      setIsSearchOpen(false);
      const newSearchQuery = `search=${encodeURIComponent(query)}`;
      navigate(`/?${newSearchQuery}`, { replace: true });
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
    // { name: "OPINION", path: "/?category=opinion" }
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
              {/* <DialogTrigger asChild>
                <button className="hover:underline text-white">Subscribe</button>
              </DialogTrigger> */}
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Subscribe to Tamil Keetru</DialogTitle>
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
            {/* <a href="#" className="text-white hover:text-gray-200"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="text-white hover:text-gray-200"><i className="fab fa-twitter"></i></a>
            <a href="#" className="text-white hover:text-gray-200"><i className="fab fa-instagram"></i></a> */}
            <a href="https://www.youtube.com/@Tamilkeetru25" className="text-white hover:text-gray-200"><i className="fab fa-youtube"></i></a>
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
            <div className="p-4 pt-14 border-b border-gray-200">
              <form className="flex">
                <Input type="text" placeholder="Search..." className="mr-2" />
                <Button type="submit" className="bg-secondary text-white">
                  <i className="fas fa-search flex items-center justify-center"></i>
                </Button>
              </form>
            </div>
            <div className="p-4 border-b border-gray-200">
              {user ? (
                <div className="space-y-2">
                  <div className="font-medium">{user.username}</div>
                  {user.isAdmin ? (
                    <Link href="/admin">
                      <Button variant="outline" className="w-full text-left justify-start">
                        <i className="fas fa-cog mr-2"></i> Admin Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/client-dashboard">
                      <Button variant="outline" className="w-full text-left justify-start">
                        <i className="fas fa-user-circle mr-2"></i> My Dashboard
                      </Button>
                    </Link>
                  )}
                  <Link href="/profile">
                    <Button variant="outline" className="w-full text-left justify-start">
                      <i className="fas fa-user-edit mr-2"></i> Edit Profile
                    </Button>
                  </Link>
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
                      onClick={() => {
                        navigate(category.path, { replace: true });
                        window.scrollTo(0, 0);
                      }}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </SheetContent>
        </Sheet>
        
        <Link href="/" className="text-secondary font-bold text-3xl md:text-4xl mr-10 font-['Roboto_Condensed']">
          Tamil Keetru
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
                <DialogTitle>Search Tamil Keetru</DialogTitle>
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
                    <button type="button" onClick={() => { setIsSearchOpen(false); navigate('/?search=Politics', { replace: true }); }} className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300">Politics</button>
                    <button type="button" onClick={() => { setIsSearchOpen(false); navigate('/?search=Sports', { replace: true }); }} className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300">Sports</button>
                    <button type="button" onClick={() => { setIsSearchOpen(false); navigate('/?search=Economy', { replace: true }); }} className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300">Economy</button>
                    <button type="button" onClick={() => { setIsSearchOpen(false); navigate('/?search=Climate+Change', { replace: true }); }} className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300">Climate Change</button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 focus:outline-none">
                    <Avatar className="h-8 w-8 border border-gray-200">
                      <AvatarFallback className="bg-secondary text-white">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.username}</span>
                    <i className="fas fa-chevron-down text-xs text-gray-500"></i>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {user.isAdmin ? (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer w-full">
                        <i className="fas fa-cog mr-2"></i> Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/client-dashboard" className="cursor-pointer w-full">
                        <i className="fas fa-user-circle mr-2"></i> My Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer w-full">
                      <i className="fas fa-user-edit mr-2"></i> Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    disabled={logoutMutation.isPending}
                    className="cursor-pointer text-red-500 focus:text-black"
                  >
                    {logoutMutation.isPending ? (
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                    ) : (
                      <i className="fas fa-sign-out-alt mr-2"></i>
                    )}
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  onClick={() => {
                    navigate(category.path, { replace: true });
                    window.scrollTo(0, 0);
                  }}
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
