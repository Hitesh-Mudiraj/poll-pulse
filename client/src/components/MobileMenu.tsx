import { Link, useLocation } from "wouter";
import { X, Home, PlusCircle, BarChart2, Grid2X2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [location] = useLocation();
  const { user, openAuthModal } = useAuth();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose}></div>
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full text-white"
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div className="flex-shrink-0 flex items-center px-4">
            <div className="h-8 w-8 bg-primary-600 rounded-md flex items-center justify-center text-white mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800">PollPulse</h1>
          </div>
          
          <nav className="mt-5 px-2 space-y-1">
            <Link href="/">
              <a onClick={onClose} className={cn(
                "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                location === "/" 
                  ? "bg-primary-50 text-primary-600" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}>
                <Home className="h-5 w-5 mr-2" />
                Dashboard
              </a>
            </Link>
            
            <Link href="/create-poll">
              <a onClick={onClose} className={cn(
                "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                location === "/create-poll" 
                  ? "bg-primary-50 text-primary-600" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}>
                <PlusCircle className="h-5 w-5 mr-2" />
                Create Poll
              </a>
            </Link>
            
            <Link href="/my-polls">
              <a onClick={onClose} className={cn(
                "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                location === "/my-polls" 
                  ? "bg-primary-50 text-primary-600" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}>
                <BarChart2 className="h-5 w-5 mr-2" />
                My Polls
              </a>
            </Link>
            
            <Link href="/discover">
              <a onClick={onClose} className={cn(
                "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                location === "/discover" 
                  ? "bg-primary-50 text-primary-600" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}>
                <Grid2X2 className="h-5 w-5 mr-2" />
                Discover
              </a>
            </Link>
          </nav>
        </div>
        
        {user ? (
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 group block">
              <div className="flex items-center">
                <Avatar>
                  <AvatarImage src="" alt={user.name || user.username} />
                  <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700">{user.name || user.username}</p>
                  <p className="text-sm font-medium text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <Button className="w-full" onClick={() => { onClose(); openAuthModal(); }}>
              Sign In
            </Button>
          </div>
        )}
      </div>
      <div className="flex-shrink-0 w-14"></div>
    </div>
  );
}
