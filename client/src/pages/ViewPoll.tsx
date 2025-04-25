import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { 
  Clock, Share2, MessageSquare, ChevronLeft, 
  Shield, AlertCircle, ThumbsUp, Users, Eye 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PieChart, DoughnutChart, chartColors } from "@/components/ui/chart";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { getTimeAgo, formatNumber } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";

export default function ViewPoll() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute<{ id: string }>("/poll/:id");
  const { toast } = useToast();
  const { user, openAuthModal } = useAuth();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isVoting, setIsVoting] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [showChartType, setShowChartType] = useState<"pie" | "doughnut">("doughnut");

  // If no match, redirect to not found
  useEffect(() => {
    if (!match) {
      navigate("/not-found");
    }
  }, [match, navigate]);

  const pollId = match ? parseInt(params.id) : -1;

  // Query for poll details
  const { 
    data: poll, 
    isLoading: isPollLoading,
    refetch: refetchPoll
  } = useQuery({
    queryKey: [`/api/polls/${pollId}`],
    enabled: pollId > 0,
  });

  // Query for poll comments
  const { 
    data: comments, 
    isLoading: isCommentsLoading,
    refetch: refetchComments
  } = useQuery({
    queryKey: [`/api/comments/${pollId}`],
    enabled: pollId > 0 && poll?.allow_comments,
  });

  // Set selected option if user has already voted
  useEffect(() => {
    if (poll && poll.userVote !== undefined) {
      setSelectedOption(poll.userVote);
    }
  }, [poll]);

  if (!match || isPollLoading) {
    return (
      <div className="flex-1 p-4 md:p-8 mt-16 lg:mt-0 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48 mb-8" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="flex-1 p-4 md:p-8 mt-16 lg:mt-0 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Poll Not Found</h2>
              <p className="text-gray-500 mb-6">The poll you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const options = poll.options as string[];
  const hasVoted = poll.userVote !== undefined;
  const isPollEnded = poll.end_date && new Date(poll.end_date) < new Date();

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

  const getEndDateText = () => {
    if (!poll.end_date) return "No end date";
    
    const endDate = typeof poll.end_date === 'string' 
      ? parseISO(poll.end_date) 
      : poll.end_date;
      
    return isPollEnded 
      ? `Ended ${formatDistanceToNow(endDate, { addSuffix: true })}` 
      : `Ends in ${formatDistanceToNow(endDate)}`;
  };

  const prepareChartData = () => {
    const labels = options;
    const data = options.map((_, index) => poll.voteResults[index] || 0);
    
    return {
      labels,
      datasets: [{
        data,
        backgroundColor: chartColors.slice(0, options.length),
        borderWidth: 0
      }]
    };
  };

  const handleVote = async () => {
    if (selectedOption === null) return;
    
    if (isPollEnded) {
      toast({
        title: "Poll ended",
        description: "This poll has ended and no longer accepts votes",
        variant: "destructive",
      });
      return;
    }
    
    if (!user && (!hasVoted || poll.allow_multiple)) {
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
      
      refetchPoll();
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

  const handleComment = async () => {
    if (!comment.trim()) return;
    
    if (!user) {
      openAuthModal();
      return;
    }
    
    setIsCommenting(true);
    
    try {
      await apiRequest("POST", "/api/comments", {
        poll_id: poll.id,
        content: comment.trim(),
      });
      
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
      
      setComment("");
      refetchComments();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setIsCommenting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: poll.title,
        text: `Check out this poll: ${poll.title}`,
        url: window.location.href,
      }).catch(() => {
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Poll link copied to clipboard",
    });
  };

  const categoryColorClass = getCategoryColor(poll.category);

  return (
    <div className="flex-1 p-4 md:p-8 mt-16 lg:mt-0 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Button 
          variant="ghost" 
          className="mb-6 -ml-2 text-gray-600"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={`bg-${categoryColorClass}-50 text-${categoryColorClass}-600 hover:bg-${categoryColorClass}-50`}>
                {poll.category}
              </Badge>
              
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                <span>{getEndDateText()}</span>
              </div>
            </div>
            
            <CardTitle className="text-2xl mt-3">{poll.title}</CardTitle>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-500">{formatNumber(poll.totalVotes)} votes</span>
                </div>
                
                {poll.allow_comments && (
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-500">
                      {isCommentsLoading ? "..." : formatNumber(comments?.length || 0)} comments
                    </span>
                  </div>
                )}
              </div>
              
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left column: Voting options or results */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium">
                  {hasVoted ? "Results" : "Cast Your Vote"}
                </h3>
                
                {isPollEnded && !hasVoted && (
                  <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md flex items-start mb-4">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">This poll has ended and no longer accepts votes.</p>
                  </div>
                )}
                
                {hasVoted ? (
                  // Results view with progress bars
                  <div className="space-y-4">
                    {options.map((option, index) => {
                      const voteCount = poll.voteResults[index] || 0;
                      const percentage = poll.totalVotes > 0 
                        ? Math.round((voteCount / poll.totalVotes) * 100) 
                        : 0;
                        
                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{option}</span>
                            <div className="flex items-center">
                              <span className="text-sm text-gray-500 mr-2">{voteCount} votes</span>
                              <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                            </div>
                          </div>
                          <div className="relative">
                            <Progress 
                              value={percentage} 
                              className={`h-8 ${index === poll.userVote ? `bg-${categoryColorClass}-200` : ""}`}
                            />
                            {index === poll.userVote && (
                              <div className="absolute inset-0 flex items-center px-3">
                                <span className="text-xs font-medium text-primary-600">Your vote</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Vote again button - only show if poll allows multiple votes and isn't ended */}
                    {poll.allow_multiple && !isPollEnded && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setSelectedOption(null)}
                      >
                        Vote Again
                      </Button>
                    )}
                  </div>
                ) : (
                  // Voting view with radio options
                  <div className="space-y-5">
                    <RadioGroup 
                      value={selectedOption?.toString()} 
                      onValueChange={(val) => setSelectedOption(parseInt(val))}
                      disabled={isPollEnded}
                    >
                      {options.map((option, index) => (
                        <div className="flex items-center space-x-2" key={index}>
                          <RadioGroupItem 
                            value={index.toString()} 
                            id={`option-${poll.id}-${index}`}
                            disabled={isPollEnded}
                            className={isPollEnded ? "opacity-50 cursor-not-allowed" : ""}
                          />
                          <Label 
                            htmlFor={`option-${poll.id}-${index}`}
                            className={isPollEnded ? "opacity-50 cursor-not-allowed" : ""}
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    
                    <Button 
                      onClick={handleVote} 
                      disabled={selectedOption === null || isVoting || isPollEnded}
                      className="w-full"
                    >
                      {isVoting ? "Submitting..." : "Submit Vote"}
                    </Button>
                    
                    {poll.allow_multiple && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Shield className="h-3 w-3 mr-1" />
                        <span>Multiple votes allowed</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Right column: Chart visualization */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Visualization</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={showChartType === "doughnut" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowChartType("doughnut")}
                      className="text-xs h-8"
                    >
                      Doughnut
                    </Button>
                    <Button
                      variant={showChartType === "pie" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowChartType("pie")}
                      className="text-xs h-8"
                    >
                      Pie
                    </Button>
                  </div>
                </div>
                
                <div className="h-64">
                  {poll.totalVotes > 0 ? (
                    showChartType === "doughnut" ? (
                      <DoughnutChart data={prepareChartData()} />
                    ) : (
                      <PieChart data={prepareChartData()} />
                    )
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <Eye className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No votes yet</p>
                        <p className="text-sm text-gray-400">Be the first to vote!</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Poll stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-500 mb-1">Total Votes</p>
                    <div className="flex items-center">
                      <ThumbsUp className="h-4 w-4 text-primary-600 mr-1" />
                      <span className="font-medium">{formatNumber(poll.totalVotes)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-500 mb-1">Participants</p>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-blue-600 mr-1" />
                      <span className="font-medium">{formatNumber(Math.ceil(poll.totalVotes * 0.8))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Comments section */}
        {poll.allow_comments && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comments</CardTitle>
            </CardHeader>
            
            <CardContent>
              {/* Comment input */}
              <div className="mb-6">
                <Textarea
                  placeholder="Add your comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mb-2"
                />
                <Button 
                  onClick={handleComment} 
                  disabled={!comment.trim() || isCommenting}
                >
                  {isCommenting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
              
              {/* Comments list */}
              <div className="space-y-4">
                {isCommentsLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex space-x-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  ))
                ) : comments && comments.length > 0 ? (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {comment.user_id ? comment.user_id.toString().substring(0, 2).toUpperCase() : "AN"}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <p className="font-medium text-sm">
                              {comment.user_id ? `User ${comment.user_id}` : "Anonymous"}
                            </p>
                            <span className="text-gray-400 text-xs mx-2">•</span>
                            <p className="text-gray-500 text-xs">
                              {getTimeAgo(comment.created_at)}
                            </p>
                          </div>
                          
                          <p className="text-gray-800">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No comments yet</p>
                    <p className="text-sm text-gray-400">Be the first to comment!</p>
                  </div>
                )}
              </div>
            </CardContent>
            
            {comments && comments.length > 5 && (
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Load More Comments
                </Button>
              </CardFooter>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
