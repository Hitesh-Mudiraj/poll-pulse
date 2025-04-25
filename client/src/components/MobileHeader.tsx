import { Link } from "wouter";
import { motion } from "framer-motion";
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
    <motion.div 
      className="lg:hidden fixed top-0 left-0 right-0 bg-white z-10 border-b"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }}
    >
      <div className="flex items-center justify-between p-4">
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="text-gray-500"
          >
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Menu className="h-6 w-6" />
            </motion.div>
          </Button>
        </motion.div>
        
        <Link href="/">
          <motion.a 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="h-8 w-8 bg-primary-600 rounded-md flex items-center justify-center text-white mr-2"
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.2 }}
              animate={{ 
                boxShadow: ["0px 0px 0px rgba(0,0,0,0.1)", "0px 4px 8px rgba(0,0,0,0.15)", "0px 0px 0px rgba(0,0,0,0.1)"]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2, 
                repeatType: "reverse" 
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </motion.div>
            <motion.h1 
              className="text-xl font-bold text-gray-800"
              animate={{ 
                background: [
                  "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
                  "linear-gradient(45deg, #764ba2 0%, #667eea 100%)",
                  "linear-gradient(45deg, #667eea 0%, #764ba2 100%)"
                ]
              }}
              style={{ 
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              PollPulse
            </motion.h1>
          </motion.a>
        </Link>
        
        {user ? (
          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Button variant="ghost" size="icon" className="flex items-center justify-center">
              <Avatar>
                <AvatarImage src="" alt={user.name || user.username} />
                <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button variant="default" size="sm" onClick={openAuthModal}>
              Sign In
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
