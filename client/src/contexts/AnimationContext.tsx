import { createContext, useState, useContext, ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';

// Animation context configuration
interface AnimationContextType {
  pageTransitions: boolean;
  cardAnimations: boolean;
  chartAnimations: boolean;
  togglePageTransitions: () => void;
  toggleCardAnimations: () => void;
  toggleChartAnimations: () => void;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

interface AnimationProviderProps {
  children: ReactNode;
}

export function AnimationProvider({ children }: AnimationProviderProps) {
  // Default all animations to true
  const [pageTransitions, setPageTransitions] = useState(true);
  const [cardAnimations, setCardAnimations] = useState(true);
  const [chartAnimations, setChartAnimations] = useState(true);

  const togglePageTransitions = () => setPageTransitions(prev => !prev);
  const toggleCardAnimations = () => setCardAnimations(prev => !prev);
  const toggleChartAnimations = () => setChartAnimations(prev => !prev);

  return (
    <AnimationContext.Provider
      value={{
        pageTransitions,
        cardAnimations,
        chartAnimations,
        togglePageTransitions,
        toggleCardAnimations,
        toggleChartAnimations
      }}
    >
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
}