import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import CreatePollForm from "@/components/polls/CreatePollForm";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [location] = useLocation();
  const { isLoggedIn, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const handleCreatePollClick = () => {
    if (isLoggedIn) {
      setShowCreatePollModal(true);
    } else {
      setAuthMode("login");
      setShowLoginModal(true);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="text-primary font-bold text-xl cursor-pointer">PollWave</span>
              </Link>
            </div>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link href="/">
                <a className={`${location === '/' ? 'text-primary border-primary border-b-2' : 'text-gray-500 hover:text-gray-700'} px-1 pt-1 font-medium`}>
                  Home
                </a>
              </Link>
              <Link href="/my-polls">
                <a className={`${location === '/my-polls' ? 'text-primary border-primary border-b-2' : 'text-gray-500 hover:text-gray-700'} px-1 pt-1 font-medium`}>
                  My Polls
                </a>
              </Link>
              <Link href="/discover">
                <a className={`${location === '/discover' ? 'text-primary border-primary border-b-2' : 'text-gray-500 hover:text-gray-700'} px-1 pt-1 font-medium`}>
                  Discover
                </a>
              </Link>
              <Link href="/about">
                <a className={`${location === '/about' ? 'text-primary border-primary border-b-2' : 'text-gray-500 hover:text-gray-700'} px-1 pt-1 font-medium`}>
                  About
                </a>
              </Link>
            </nav>
          </div>
          <div className="hidden md:flex items-center">
            <Button 
              onClick={handleCreatePollClick} 
              className="bg-primary hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
            >
              Create Poll
            </Button>
            <div className="ml-4">
              {isLoggedIn ? (
                <Button 
                  variant="ghost" 
                  onClick={() => logout()} 
                  className="text-gray-500 hover:text-gray-700 font-medium"
                >
                  Sign out
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={() => setShowLoginModal(true)} 
                  className="text-gray-500 hover:text-gray-700 font-medium"
                >
                  Sign in
                </Button>
              )}
            </div>
          </div>
          <div className="md:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileMenu} 
              className="text-gray-400 hover:text-gray-500"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-white border-t border-gray-200`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link href="/">
            <a 
              className={`${location === '/' ? 'bg-primary-50 text-primary' : 'text-gray-500 hover:bg-gray-50'} block px-3 py-2 rounded-md font-medium`}
              onClick={closeMobileMenu}
            >
              Home
            </a>
          </Link>
          <Link href="/my-polls">
            <a 
              className={`${location === '/my-polls' ? 'bg-primary-50 text-primary' : 'text-gray-500 hover:bg-gray-50'} block px-3 py-2 rounded-md font-medium`}
              onClick={closeMobileMenu}
            >
              My Polls
            </a>
          </Link>
          <Link href="/discover">
            <a 
              className={`${location === '/discover' ? 'bg-primary-50 text-primary' : 'text-gray-500 hover:bg-gray-50'} block px-3 py-2 rounded-md font-medium`}
              onClick={closeMobileMenu}
            >
              Discover
            </a>
          </Link>
          <Link href="/about">
            <a 
              className={`${location === '/about' ? 'bg-primary-50 text-primary' : 'text-gray-500 hover:bg-gray-50'} block px-3 py-2 rounded-md font-medium`}
              onClick={closeMobileMenu}
            >
              About
            </a>
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="px-2 space-y-1">
            <Button
              onClick={() => {
                handleCreatePollClick();
                closeMobileMenu();
              }}
              className="bg-primary text-white w-full text-left hover:bg-primary-600 block px-3 py-2 rounded-md font-medium"
            >
              Create Poll
            </Button>
            {isLoggedIn ? (
              <Button
                onClick={() => {
                  logout();
                  closeMobileMenu();
                }}
                variant="ghost"
                className="text-gray-500 hover:bg-gray-50 w-full text-left block px-3 py-2 rounded-md font-medium"
              >
                Sign out
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setShowLoginModal(true);
                  closeMobileMenu();
                }}
                variant="ghost"
                className="text-gray-500 hover:bg-gray-50 w-full text-left block px-3 py-2 rounded-md font-medium"
              >
                Sign in
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign In</DialogTitle>
          </DialogHeader>
          <LoginForm 
            onSuccess={() => setShowLoginModal(false)} 
            onRegisterClick={() => {
              setShowLoginModal(false);
              setShowSignupModal(true);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Signup Modal */}
      <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create an Account</DialogTitle>
          </DialogHeader>
          <SignupForm 
            onSuccess={() => setShowSignupModal(false)} 
            onLoginClick={() => {
              setShowSignupModal(false);
              setShowLoginModal(true);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Create Poll Modal */}
      <Dialog open={showCreatePollModal} onOpenChange={setShowCreatePollModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a New Poll</DialogTitle>
          </DialogHeader>
          <CreatePollForm onSuccess={() => setShowCreatePollModal(false)} />
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
