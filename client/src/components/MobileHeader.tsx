import { Link } from "wouter";
import { Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface MobileHeaderProps {
  onMenuToggle: () => void;
}

export default function MobileHeader({ onMenuToggle }: MobileHeaderProps) {
  const { user, openAuthModal } = useAuth();

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-white z-10 border-b">
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="text-gray-500"
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <Link href="/">
          <a className="flex items-center">
            <div className="h-8 w-8 bg-primary-600 rounded-md flex items-center justify-center text-white mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800">PollPulse</h1>
          </a>
        </Link>
        
        {user ? (
          <Button variant="ghost" size="icon" className="flex items-center justify-center">
            <Avatar>
              <AvatarImage src="" alt={user.name || user.username} />
              <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        ) : (
          <Button variant="default" size="sm" onClick={openAuthModal}>
            Sign In
          </Button>
        )}
      </div>
    </div>
  );
}
