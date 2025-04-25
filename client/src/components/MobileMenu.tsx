import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, Home, PlusCircle, BarChart2, Grid2X2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import AnimationSettingsModal from "./AnimationSettingsModal";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [location] = useLocation();
  const { user, openAuthModal } = useAuth();
  const [isAnimationSettingsOpen, setIsAnimationSettingsOpen] = useState(false);
  
  // Menu animation variants
  const menuVariants = {
    closed: {
      x: "-100%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.07,
        delayChildren: 0.2
      }
    }
  };
  
  // Item animation variants
  const itemVariants = {
    closed: { x: -20, opacity: 0 },
    open: { x: 0, opacity: 1 }
  };
  
  // Overlay animation variants
  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <motion.div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75" 
            onClick={onClose}
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            transition={{ duration: 0.2 }}
          />
          
          <motion.div 
            className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
          >
            <motion.div 
              className="absolute top-0 right-0 -mr-12 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full text-white"
                >
                  <span className="sr-only">Close sidebar</span>
                  <motion.div
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
            
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <motion.div 
                className="flex-shrink-0 flex items-center px-4"
                variants={itemVariants}
              >
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
              </motion.div>
              
              <nav className="mt-5 px-2 space-y-1">
                <motion.div variants={itemVariants}>
                  <Link href="/">
                    <motion.a 
                      onClick={onClose} 
                      className={cn(
                        "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                        location === "/" 
                          ? "bg-primary-50 text-primary-600" 
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Home className="h-5 w-5 mr-2" />
                      Dashboard
                    </motion.a>
                  </Link>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Link href="/create-poll">
                    <motion.a 
                      onClick={onClose} 
                      className={cn(
                        "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                        location === "/create-poll" 
                          ? "bg-primary-50 text-primary-600" 
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <PlusCircle className="h-5 w-5 mr-2" />
                      Create Poll
                    </motion.a>
                  </Link>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Link href="/my-polls">
                    <motion.a 
                      onClick={onClose} 
                      className={cn(
                        "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                        location === "/my-polls" 
                          ? "bg-primary-50 text-primary-600" 
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <BarChart2 className="h-5 w-5 mr-2" />
                      My Polls
                    </motion.a>
                  </Link>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Link href="/discover">
                    <motion.a 
                      onClick={onClose} 
                      className={cn(
                        "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                        location === "/discover" 
                          ? "bg-primary-50 text-primary-600" 
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Grid2X2 className="h-5 w-5 mr-2" />
                      Discover
                    </motion.a>
                  </Link>
                </motion.div>
                
                <motion.div
                  variants={itemVariants}
                  className="mt-8 pt-3 border-t border-gray-200"
                >
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Settings
                  </h3>
                  <div className="mt-2">
                    <motion.button
                      className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      onClick={() => setIsAnimationSettingsOpen(true)}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
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
                </motion.div>
              </nav>
            </div>
            
            {user ? (
              <motion.div 
                className="flex-shrink-0 flex border-t border-gray-200 p-4"
                variants={itemVariants}
              >
                <div className="flex-shrink-0 group block w-full">
                  <div className="flex items-center">
                    <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                      <Avatar>
                        <AvatarImage src="" alt={user.name || user.username} />
                        <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <div className="ml-3">
                      <p className="text-base font-medium text-gray-700">{user.name || user.username}</p>
                      <p className="text-sm font-medium text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="flex-shrink-0 flex border-t border-gray-200 p-4"
                variants={itemVariants}
              >
                <motion.div 
                  className="w-full"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button 
                    className="w-full" 
                    onClick={() => { onClose(); openAuthModal(); }}
                  >
                    Sign In
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
          <div className="flex-shrink-0 w-14"></div>
        </div>
      )}
      
      {/* Animation Settings Modal */}
      <AnimationSettingsModal
        isOpen={isAnimationSettingsOpen}
        onClose={() => setIsAnimationSettingsOpen(false)}
      />
    </AnimatePresence>
  );
}
