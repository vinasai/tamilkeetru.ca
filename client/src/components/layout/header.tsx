import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useState } from "react";
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
  const [, navigate] = useLocation();

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
    { name: "NEWS", path: "/?category=news" },
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
            <Link href="#" className="hover:underline text-white">Subscribe</Link>
            <Link href="#" className="hover:underline text-white">Newsletter</Link>
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
                    <Link href={category.path} className="block py-3 px-4 border-b border-gray-200 hover:bg-gray-100">
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
                  className="inline-block py-3 px-3 hover:text-secondary"
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
