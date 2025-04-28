import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Search as SearchIcon, 
  Menu as MenuIcon, 
  X as XIcon, 
  User as UserIcon,
  LogOut as LogOutIcon
} from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { formatDate } from '@/lib/utils';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    staleTime: 300000, // 5 minutes
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-primary">
        <div className="container mx-auto px-4 py-1 flex justify-between items-center">
          <div className="text-white text-xs md:text-sm flex space-x-4">
            <span className="hidden md:inline">{formatDate(new Date())}</span>
            <a href="#" className="hover:underline">Subscribe</a>
            <Link href="/auth" className="hover:underline">Newsletter</Link>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-white hover:text-gray-200"><FaFacebookF /></a>
            <a href="#" className="text-white hover:text-gray-200"><FaTwitter /></a>
            <a href="#" className="text-white hover:text-gray-200"><FaInstagram /></a>
            <a href="#" className="text-white hover:text-gray-200"><FaYoutube /></a>
          </div>
        </div>
      </div>
      
      {/* Main header */}
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <button 
          className="md:hidden text-primary text-2xl" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <MenuIcon />
        </button>
        
        <Link href="/" className="text-primary font-bold text-3xl md:text-4xl font-condensed">
          DAILY NEWS
        </Link>
        
        <div className="flex items-center space-x-3">
          <button 
            className="text-gray-700 hover:text-primary text-xl hidden md:block" 
            onClick={() => setIsSearchOpen(true)}
          >
            <SearchIcon />
          </button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden md:flex">
                  <UserIcon className="h-4 w-4 mr-2" />
                  {user.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOutIcon className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth" className="hidden md:block text-darkText hover:text-primary">
              <UserIcon className="inline mr-1" /> Sign In
            </Link>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="bg-white border-t border-b border-gray-200 hidden md:block">
        <div className="container mx-auto px-4">
          <ul className="flex justify-between items-center text-sm font-condensed font-semibold">
            <li>
              <Link href="/" className="inline-block py-3 px-3 hover:text-primary">
                HOME
              </Link>
            </li>
            {categories?.map((category: any) => (
              <li key={category.id}>
                <Link 
                  href={`/category/${category.slug}`} 
                  className="inline-block py-3 px-3 hover:text-primary"
                >
                  {category.name.toUpperCase()}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      <div 
        className={`md:hidden bg-white w-full absolute left-0 top-full shadow-lg ${isMenuOpen ? 'block' : 'hidden'}`}
      >
        <div className="p-4 border-b border-gray-200 flex">
          <form onSubmit={handleSearchSubmit} className="w-full flex">
            <input 
              type="text" 
              placeholder="Search..." 
              className="border border-gray-300 rounded px-3 py-2 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="sm" className="ml-2">
              <SearchIcon className="h-4 w-4" />
            </Button>
          </form>
        </div>
        <div className="p-4 border-b border-gray-200">
          {user ? (
            <div className="space-y-2">
              <p className="font-medium">Welcome, {user.username}</p>
              {user.isAdmin && (
                <Link href="/admin" className="block py-2 px-3 text-center bg-secondary text-white rounded font-medium">
                  Admin Dashboard
                </Link>
              )}
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={handleLogout}
              >
                <LogOutIcon className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Link href="/auth" className="block py-2 px-3 text-center bg-primary text-white rounded font-medium">
              <UserIcon className="h-4 w-4 mr-1 inline" /> Sign In / Register
            </Link>
          )}
        </div>
        <nav>
          <ul className="font-condensed font-semibold">
            <li>
              <Link href="/" className="block py-3 px-4 border-b border-gray-200 hover:bg-gray-100">
                HOME
              </Link>
            </li>
            {categories?.map((category: any) => (
              <li key={category.id}>
                <Link 
                  href={`/category/${category.slug}`} 
                  className="block py-3 px-4 border-b border-gray-200 hover:bg-gray-100"
                >
                  {category.name.toUpperCase()}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Search Daily News</h2>
              <button 
                className="text-gray-500 hover:text-primary text-xl" 
                onClick={() => setIsSearchOpen(false)}
              >
                <XIcon />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit}>
              <div className="flex">
                <input 
                  type="text" 
                  placeholder="Search for news, topics..." 
                  className="border border-gray-300 rounded-l px-4 py-3 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" className="rounded-l-none">Search</Button>
              </div>
            </form>
            <div className="mt-4">
              <h3 className="font-medium mb-2">Popular Searches:</h3>
              <div className="flex flex-wrap gap-2">
                {['Politics', 'Economy', 'Technology', 'Sports'].map(term => (
                  <Button 
                    key={term}
                    variant="outline" 
                    className="rounded-full text-sm h-7" 
                    onClick={() => {
                      setSearchQuery(term);
                      handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent);
                    }}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
