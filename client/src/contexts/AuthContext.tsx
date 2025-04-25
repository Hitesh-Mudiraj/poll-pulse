import { createContext, useState, useEffect, ReactNode } from "react";
import { User } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import AuthModal from "@/components/AuthModal";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Check if user is logged in on first render
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setUser(data);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    // Invalidate queries that might depend on auth state
    queryClient.invalidateQueries({ queryKey: ['/api/polls/user'] });
    queryClient.invalidateQueries({ queryKey: ['/api/stats/user'] });
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      setUser(null);
      
      // Invalidate queries that depend on auth state
      queryClient.invalidateQueries({ queryKey: ['/api/polls/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/user'] });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </AuthContext.Provider>
  );
}
