import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShareIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { PollWithVotes } from "@shared/schema";
import { formatDistanceToNow, parseISO } from "date-fns";

interface PollCardProps {
  poll: PollWithVotes;
  onVoteSuccess: () => void;
}

export default function PollCard({ poll, onVoteSuccess }: PollCardProps) {
  const { user, openAuthModal } = useAuth();
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<number | null>(
    poll.userVote !== undefined ? poll.userVote : null
  );
  const [isVoting, setIsVoting] = useState(false);
  const [showResults, setShowResults] = useState(poll.userVote !== undefined);
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
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <Badge variant="outline" className={`bg-${categoryColorClass}-50 text-${categoryColorClass}-600 hover:bg-${categoryColorClass}-50`}>
              {poll.category}
            </Badge>
            <h3 className="mt-2 text-lg font-medium text-gray-900">{poll.title}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <ShareIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
          </Button>
        </div>
        
        <div className="mt-4 space-y-3">
          {showResults ? (
            // Results view
            options.map((option, index) => {
              const voteCount = poll.voteResults[index] || 0;
              const percentage = poll.totalVotes > 0 
                ? Math.round((voteCount / poll.totalVotes) * 100) 
                : 0;
                
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{option}</span>
                    <span className="text-sm text-gray-500">{percentage}%</span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={percentage} 
                      className={`h-2 ${index === poll.userVote ? `bg-${categoryColorClass}-200` : ""}`}
                    />
                    {index === poll.userVote && (
                      <span className="absolute right-0 -top-5 text-xs text-primary-600">Your vote</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            // Voting view
            <RadioGroup value={selectedOption?.toString()} onValueChange={(val) => setSelectedOption(parseInt(val))}>
              {options.map((option, index) => (
                <div className="flex items-center space-x-2" key={index}>
                  <RadioGroupItem value={index.toString()} id={`option-${poll.id}-${index}`} />
                  <Label htmlFor={`option-${poll.id}-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
        
        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm text-gray-500">{poll.totalVotes} votes</span>
          
          {!showResults ? (
            <Button 
              onClick={handleVote} 
              disabled={selectedOption === null || isVoting}
              className={isVoting ? "opacity-70 cursor-not-allowed" : ""}
            >
              {isVoting ? "Voting..." : "Vote"}
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => setShowResults(false)} 
              disabled={!hasVoted && poll.totalVotes === 0}
            >
              {hasVoted ? "Change Vote" : "Vote"}
            </Button>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 px-5 py-3 border-t border-gray-200">
        <div className="flex justify-between text-sm w-full">
          <span className="font-medium text-gray-500">{getEndDateText()}</span>
          
          <Link href={`/poll/${poll.id}`}>
            <a className="font-medium text-primary-600 hover:text-primary-500">View Details</a>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
