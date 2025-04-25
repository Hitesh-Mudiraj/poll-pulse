import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Cog, 
  BarChart2, 
  PlusCircle, 
  Grid2X2, 
  Home, 
  Settings, 
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import AnimationSettingsModal from "./AnimationSettingsModal";

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [location] = useLocation();
  const { user, openAuthModal } = useAuth();
  const [isAnimationSettingsOpen, setIsAnimationSettingsOpen] = useState(false);
  
  // Only show on larger screens
  if (!isOpen) return null;
  
  const handleLogin = () => {
    openAuthModal();
  };
  
  return (
    <motion.div 
      className="bg-white shadow-lg h-full w-64 hidden lg:block"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-4 border-b flex items-center">
          <motion.div 
            className="h-8 w-8 bg-primary-600 rounded-md flex items-center justify-center text-white mr-2"
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </motion.div>
          <h1 className="text-xl font-bold text-gray-800">PollPulse</h1>
        </div>
        
        {/* Navigation Links */}
        <nav className="p-4 flex-grow">
          <div className="space-y-1">
            <Link href="/">
              <motion.a 
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  location === "/" 
                    ? "bg-primary-50 text-primary-600" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Home className="h-5 w-5 mr-2" />
                Dashboard
              </motion.a>
            </Link>
            
            <Link href="/create-poll">
              <motion.a 
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  location === "/create-poll" 
                    ? "bg-primary-50 text-primary-600" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Create Poll
              </motion.a>
            </Link>
            
            <Link href="/my-polls">
              <motion.a 
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  location === "/my-polls" 
                    ? "bg-primary-50 text-primary-600" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <BarChart2 className="h-5 w-5 mr-2" />
                My Polls
              </motion.a>
            </Link>
            
            <Link href="/discover">
              <motion.a 
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  location === "/discover" 
                    ? "bg-primary-50 text-primary-600" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Grid2X2 className="h-5 w-5 mr-2" />
                Discover
              </motion.a>
            </Link>
          </div>
          
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Settings
            </h3>
            <div className="mt-2 space-y-1">
              <motion.button
                className="w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setIsAnimationSettingsOpen(true)}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
                Animations
                <motion.div 
                  className="ml-auto" 
                  animate={{ 
                    rotate: [0, 5, 0, -5, 0],
                    scale: [1, 1.1, 1, 1.1, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                </motion.div>
              </motion.button>
            </div>
          </div>
        </nav>
        
        {/* User Profile Section */}
        {user ? (
          <motion.div 
            className="p-4 border-t flex items-center justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center">
              <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                <Avatar>
                  <AvatarImage src="" alt={user.name || user.username} />
                  <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user.name || user.username}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
              <Button variant="ghost" size="icon">
                <Cog className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            className="p-4 border-t"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <motion.div 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button 
                className="w-full" 
                variant="default"
                onClick={handleLogin}
              >
                Sign In
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
      
      {/* Animation Settings Modal */}
      <AnimationSettingsModal
        isOpen={isAnimationSettingsOpen}
        onClose={() => setIsAnimationSettingsOpen(false)}
      />
    </motion.div>
  );
}
