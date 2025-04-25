import { motion, MotionProps, Variants } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAnimation } from "@/contexts/AnimationContext";

// Animation variants
const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.3 } }
};

const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
};

const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const staggerChildrenVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.03, 1],
    transition: { 
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
};

interface AnimatedComponentProps extends MotionProps {
  children: ReactNode;
  className?: string;
  animateWhen?: boolean;
}

// Base animated component
export function Animated({
  children,
  className,
  variants = fadeInVariants,
  initial = "hidden",
  animate = "visible",
  exit = "exit",
  animateWhen = true,
  ...props
}: AnimatedComponentProps) {
  // If animation is disabled, render children without animation
  if (!animateWhen) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      animate={animate}
      exit={exit}
      variants={variants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Specialized animated components
export function FadeIn({ className, children, ...props }: AnimatedComponentProps) {
  const { cardAnimations } = useAnimation();
  
  return (
    <Animated 
      variants={fadeInVariants}
      className={className}
      animateWhen={cardAnimations}
      {...props}
    >
      {children}
    </Animated>
  );
}

export function SlideUp({ className, children, ...props }: AnimatedComponentProps) {
  const { cardAnimations } = useAnimation();
  
  return (
    <Animated 
      variants={slideUpVariants}
      className={className}
      animateWhen={cardAnimations}
      {...props}
    >
      {children}
    </Animated>
  );
}

export function SlideRight({ className, children, ...props }: AnimatedComponentProps) {
  const { cardAnimations } = useAnimation();
  
  return (
    <Animated 
      variants={slideRightVariants}
      className={className}
      animateWhen={cardAnimations}
      {...props}
    >
      {children}
    </Animated>
  );
}

export function Scale({ className, children, ...props }: AnimatedComponentProps) {
  const { cardAnimations } = useAnimation();
  
  return (
    <Animated 
      variants={scaleVariants}
      className={className}
      animateWhen={cardAnimations}
      {...props}
    >
      {children}
    </Animated>
  );
}

export function StaggeredContainer({ 
  className, 
  children, 
  ...props 
}: AnimatedComponentProps) {
  const { cardAnimations } = useAnimation();
  
  return (
    <Animated 
      variants={staggerChildrenVariants}
      className={cn("flex flex-col", className)}
      animateWhen={cardAnimations}
      {...props}
    >
      {children}
    </Animated>
  );
}

export function StaggeredItem({ 
  className, 
  children, 
  ...props 
}: AnimatedComponentProps) {
  return (
    <Animated 
      variants={slideUpVariants}
      className={className}
      {...props}
    >
      {children}
    </Animated>
  );
}

export function Pulse({ className, children, ...props }: AnimatedComponentProps) {
  const { cardAnimations } = useAnimation();
  
  return (
    <Animated 
      variants={pulseVariants}
      animate="pulse"
      initial={undefined}
      exit={undefined}
      className={className}
      animateWhen={cardAnimations}
      {...props}
    >
      {children}
    </Animated>
  );
}

export function AnimatedPage({ className, children, ...props }: AnimatedComponentProps) {
  const { pageTransitions } = useAnimation();
  
  return (
    <Animated 
      variants={fadeInVariants}
      className={cn("flex-1 flex flex-col", className)}
      animateWhen={pageTransitions}
      {...props}
    >
      {children}
    </Animated>
  );
}

// Hover animation component
export function HoverCard({ className, children, ...props }: AnimatedComponentProps) {
  const { cardAnimations } = useAnimation();
  
  if (!cardAnimations) {
    return (
      <div className={cn("transition-shadow hover:shadow-md", className)}>
        {children}
      </div>
    );
  }
  
  return (
    <motion.div
      className={cn("transition-shadow", className)}
      whileHover={{ 
        y: -5, 
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}