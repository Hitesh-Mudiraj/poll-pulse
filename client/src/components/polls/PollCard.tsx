import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PollWithOptions, PollWithResults } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import PollResults from "./PollResults";
import { MoreVertical } from "lucide-react";

interface PollCardProps {
  poll: PollWithOptions | PollWithResults;
  isVotable?: boolean;
  showResults?: boolean;
}

const PollCard = ({ poll, isVotable = true, showResults = false }: PollCardProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showingResults, setShowingResults] = useState<boolean>(showResults);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Check if poll has results
  const hasPollResults = 'results' in poll;
  const pollWithResults = hasPollResults ? poll as PollWithResults : null;
  
  // Format creation date
  const createdDate = new Date(poll.createdAt);
  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });
  
  // Handle vote mutation
  const voteMutation = useMutation({
    mutationFn: async (optionId: number) => {
      const response = await apiRequest('POST', `/api/polls/${poll.id}/vote`, { optionId });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/polls/${poll.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/polls'] });
      setShowingResults(true);
      toast({
        title: "Vote Submitted",
        description: "Your vote has been recorded!",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to submit vote",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    },
  });

  const handleVote = () => {
    if (!selectedOption) {
      toast({
        variant: "destructive",
        title: "No option selected",
        description: "Please select an option to vote",
      });
      return;
    }
    
    voteMutation.mutate(selectedOption);
  };

  const toggleResults = () => {
    setShowingResults(!showingResults);
  };

  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">{poll.question}</h3>
            <p className="text-gray-500 text-sm">
              Created by <span className="font-medium">{poll.creator?.username || "Anonymous"}</span> • {timeAgo}
            </p>
          </div>
          <div className="text-gray-400 hover:text-gray-500 cursor-pointer">
            <MoreVertical className="h-5 w-5" />
          </div>
        </div>

        {showingResults && pollWithResults ? (
          <PollResults poll={pollWithResults} />
        ) : (
          <div className="mb-5">
            <RadioGroup 
              value={selectedOption?.toString()} 
              onValueChange={(value) => setSelectedOption(parseInt(value))}
              className="space-y-3"
              disabled={!isVotable || voteMutation.isPending}
            >
              {poll.options.map((option) => (
                <div className="flex items-center" key={option.id}>
                  <RadioGroupItem id={`option-${option.id}`} value={option.id.toString()} />
                  <Label htmlFor={`option-${option.id}`} className="ml-3 cursor-pointer text-gray-700">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
        
        {isVotable && !showingResults && (
          <Button 
            onClick={handleVote} 
            className="w-full py-2 px-4 bg-primary hover:bg-primary-600 text-white font-medium rounded-md shadow-sm transition duration-150 ease-in-out"
            disabled={!selectedOption || voteMutation.isPending}
          >
            {voteMutation.isPending ? "Submitting..." : "Vote"}
          </Button>
        )}
        
        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <span>{poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'}</span>
          {pollWithResults && (
            <Button 
              variant="link" 
              onClick={toggleResults} 
              className="text-primary hover:text-primary-600 font-medium p-0 h-auto"
            >
              {showingResults ? "Hide Results" : "See Results"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PollCard;
