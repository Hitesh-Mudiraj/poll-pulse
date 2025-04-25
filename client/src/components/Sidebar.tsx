import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Cog, BarChart2, PlusCircle, Grid2X2, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Only show on larger screens
  if (!isOpen) return null;
  
  return (
    <div className="bg-white shadow-lg h-full w-64 hidden lg:block">
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-4 border-b flex items-center">
          <div className="h-8 w-8 bg-primary-600 rounded-md flex items-center justify-center text-white mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">PollPulse</h1>
        </div>
        
        {/* Navigation Links */}
        <nav className="p-4 flex-grow">
          <div className="space-y-1">
            <Link href="/">
              <a className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                location === "/" 
                  ? "bg-primary-50 text-primary-600" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}>
                <Home className="h-5 w-5 mr-2" />
                Dashboard
              </a>
            </Link>
            
            <Link href="/create-poll">
              <a className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                location === "/create-poll" 
                  ? "bg-primary-50 text-primary-600" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}>
                <PlusCircle className="h-5 w-5 mr-2" />
                Create Poll
              </a>
            </Link>
            
            <Link href="/my-polls">
              <a className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                location === "/my-polls" 
                  ? "bg-primary-50 text-primary-600" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}>
                <BarChart2 className="h-5 w-5 mr-2" />
                My Polls
              </a>
            </Link>
            
            <Link href="/discover">
              <a className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                location === "/discover" 
                  ? "bg-primary-50 text-primary-600" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}>
                <Grid2X2 className="h-5 w-5 mr-2" />
                Discover
              </a>
            </Link>
          </div>
        </nav>
        
        {/* User Profile Section */}
        {user ? (
          <div className="p-4 border-t flex items-center justify-between">
            <div className="flex items-center">
              <Avatar>
                <AvatarImage src="" alt={user.name || user.username} />
                <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user.name || user.username}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Cog className="h-5 w-5 text-gray-400 hover:text-gray-500" />
            </Button>
          </div>
        ) : (
          <div className="p-4 border-t">
            <Button className="w-full" variant="default">Sign In</Button>
          </div>
        )}
      </div>
    </div>
  );
}
