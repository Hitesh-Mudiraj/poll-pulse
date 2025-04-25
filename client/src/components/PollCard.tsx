import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShareIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { PollWithVotes } from "@shared/schema";
import { formatDistanceToNow, parseISO } from "date-fns";
import { HoverCard, StaggeredContainer, StaggeredItem, Pulse } from "@/components/ui/animated";
import { useAnimation } from "@/contexts/AnimationContext";

interface PollCardProps {
  poll: PollWithVotes;
  onVoteSuccess: () => void;
}

export default function PollCard({ poll, onVoteSuccess }: PollCardProps) {
  const { user, openAuthModal } = useAuth();
  const { toast } = useToast();
  const progressRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { cardAnimations, chartAnimations } = useAnimation();
  
  const [selectedOption, setSelectedOption] = useState<number | null>(
    poll.userVote !== undefined ? poll.userVote : null
  );
  const [isVoting, setIsVoting] = useState(false);
  const [showResults, setShowResults] = useState(poll.userVote !== undefined);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const options = poll.options as string[];
  const hasVoted = poll.userVote !== undefined;
  
  const getCategoryColor = (category: string) => {
    const categories: Record<string, string> = {
      "Technology": "primary",
      "Food": "green",
      "Entertainment": "blue",
      "Sports": "orange",
      "Education": "purple",
      "Travel": "amber",
    };
    
    return categories[category] || "primary";
  };

  const handleVote = async () => {
    if (!selectedOption && selectedOption !== 0) return;
    
    if (!user) {
      openAuthModal();
      return;
    }
    
    setIsVoting(true);
    
    try {
      await apiRequest("POST", "/api/votes", {
        poll_id: poll.id,
        option_index: selectedOption,
      });
      
      toast({
        title: "Vote successful",
        description: "Your vote has been recorded",
      });
      
      setShowResults(true);
      onVoteSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit vote",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: poll.title,
        text: `Check out this poll: ${poll.title}`,
        url: window.location.origin + `/poll/${poll.id}`,
      }).catch(() => {
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/poll/${poll.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Poll link copied to clipboard",
    });
  };

  const getEndDateText = () => {
    if (!poll.end_date) return "No end date";
    
    const endDate = typeof poll.end_date === 'string' 
      ? parseISO(poll.end_date) 
      : poll.end_date;
      
    return `Ends in ${formatDistanceToNow(endDate)}`;
  };

  const categoryColorClass = getCategoryColor(poll.category);
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <HoverCard>
      <Card className="overflow-hidden relative">
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Badge variant="outline" className={`bg-${categoryColorClass}-50 text-${categoryColorClass}-600 hover:bg-${categoryColorClass}-50`}>
                  {poll.category}
                </Badge>
              </motion.div>
              <motion.h3 
                className="mt-2 text-lg font-medium text-gray-900"
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
              >
                {poll.title}
              </motion.h3>
            </div>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <ShareIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              </Button>
            </motion.div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div 
              className="mt-4 space-y-3"
              initial={cardAnimations ? { opacity: 0, y: 20 } : false}
              animate={cardAnimations ? { opacity: 1, y: 0 } : { opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {showResults ? (
                // Results view with staggered animation
                <StaggeredContainer className="space-y-3">
                  {options.map((option, index) => {
                    const voteCount = poll.voteResults[index] || 0;
                    const percentage = poll.totalVotes > 0 
                      ? Math.round((voteCount / poll.totalVotes) * 100) 
                      : 0;
                      
                    return (
                      <StaggeredItem key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{option}</span>
                          <motion.span 
                            className="text-sm text-gray-500"
                            initial={chartAnimations ? { opacity: 0 } : false}
                            animate={chartAnimations ? { opacity: 1 } : { opacity: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            {percentage}%
                          </motion.span>
                        </div>
                        <div className="relative">
                          <div ref={el => progressRefs.current[index] = el}>
                            <motion.div
                              initial={chartAnimations ? { width: 0 } : false}
                              animate={chartAnimations ? { width: `${percentage}%` } : { width: `${percentage}%` }}
                              transition={{ duration: 0.7, delay: index * 0.1 }}
                              className={`absolute h-2 rounded-lg ${index === poll.userVote ? `bg-${categoryColorClass}-500` : `bg-${categoryColorClass}-400`}`}
                              style={{
                                zIndex: 10
                              }}
                            />
                            <Progress 
                              value={100} 
                              className={`h-2 bg-gray-100`}
                            />
                          </div>
                          {index === poll.userVote && (
                            <motion.span 
                              className="absolute right-0 -top-5 text-xs text-primary-600"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 }}
                            >
                              Your vote
                            </motion.span>
                          )}
                        </div>
                      </StaggeredItem>
                    );
                  })}
                </StaggeredContainer>
              ) : (
                // Voting view with animations
                <RadioGroup value={selectedOption?.toString()} onValueChange={(val) => setSelectedOption(parseInt(val))}>
                  <StaggeredContainer>
                    {options.map((option, index) => (
                      <StaggeredItem key={index}>
                        <motion.div 
                          className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-md transition-colors cursor-pointer"
                          whileHover={{ x: 5 }}
                        >
                          <RadioGroupItem value={index.toString()} id={`option-${poll.id}-${index}`} />
                          <Label htmlFor={`option-${poll.id}-${index}`}>{option}</Label>
                        </motion.div>
                      </StaggeredItem>
                    ))}
                  </StaggeredContainer>
                </RadioGroup>
              )}
            </motion.div>
          </AnimatePresence>
          
          <motion.div 
            className="mt-5 flex items-center justify-between"
            initial={cardAnimations ? { opacity: 0 } : false}
            animate={cardAnimations ? { opacity: 1 } : { opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-sm text-gray-500">{poll.totalVotes} votes</span>
            
            {!showResults ? (
              <Pulse>
                <Button 
                  onClick={handleVote} 
                  disabled={selectedOption === null || isVoting}
                  className={isVoting ? "opacity-70 cursor-not-allowed" : ""}
                >
                  {isVoting ? (
                    <motion.span 
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Voting...
                    </motion.span>
                  ) : "Vote"}
                </Button>
              </Pulse>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  onClick={() => setShowResults(false)} 
                  disabled={!hasVoted && poll.totalVotes === 0}
                >
                  {hasVoted ? "Change Vote" : "Vote"}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </CardContent>
        
        <motion.div
          className="absolute bottom-3 right-3 lg:bottom-5 lg:right-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={toggleExpanded}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </motion.div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardFooter className="bg-gray-50 px-5 py-3 border-t border-gray-200">
                <div className="flex justify-between text-sm w-full">
                  <span className="font-medium text-gray-500">{getEndDateText()}</span>
                  
                  <Link href={`/poll/${poll.id}`}>
                    <motion.a 
                      className="font-medium text-primary-600 hover:text-primary-500"
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      View Details
                    </motion.a>
                  </Link>
                </div>
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </HoverCard>
  );
}
