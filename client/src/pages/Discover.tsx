import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ClipboardList, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PollCard from "@/components/PollCard";
import { PollWithVotes } from "@shared/schema";

// Categories
const categories = [
  "All",
  "Technology",
  "Food",
  "Entertainment",
  "Sports",
  "Education",
  "Travel",
  "Other"
];

export default function Discover() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [randomPollLoading, setRandomPollLoading] = useState(false);

  // Query for trending polls
  const { 
    data: trendingPolls, 
    isLoading: trendingLoading,
    refetch: refetchTrending
  } = useQuery({
    queryKey: ['/api/polls/trending', 6],
    queryFn: async () => {
      const res = await fetch("/api/polls/trending?limit=6");
      if (!res.ok) throw new Error("Failed to fetch trending polls");
      return res.json();
    }
  });

  // Query for recent polls
  const { 
    data: recentPolls, 
    isLoading: recentLoading,
    refetch: refetchRecent
  } = useQuery({
    queryKey: ['/api/polls/recent', 9],
    queryFn: async () => {
      const res = await fetch("/api/polls/recent?limit=9");
      if (!res.ok) throw new Error("Failed to fetch recent polls");
      return res.json();
    }
  });

  // Query for a random poll
  const { 
    data: randomPoll, 
    refetch: fetchRandomPoll
  } = useQuery({
    queryKey: ['/api/polls/random'],
    enabled: false,
  });

  const handleGetRandomPoll = async () => {
    setRandomPollLoading(true);
    try {
      await fetchRandomPoll();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a random poll",
        variant: "destructive",
      });
    } finally {
      setRandomPollLoading(false);
    }
  };

  useEffect(() => {
    // Fetch a random poll on component mount
    handleGetRandomPoll();
  }, []);

  const handlePollVoted = () => {
    refetchTrending();
    refetchRecent();
  };

  // Filter polls by search query and category
  const filterPolls = (polls: PollWithVotes[] | undefined) => {
    if (!polls) return [];
    
    return polls.filter(poll => {
      const matchesSearch = !searchQuery || 
        poll.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || 
        poll.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  };

  const filteredTrending = filterPolls(trendingPolls);
  const filteredRecent = filterPolls(recentPolls);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Content Header */}
      <header className="bg-white shadow-sm lg:pl-0 lg:pr-6 pt-4 pb-4 flex items-center justify-between lg:border-b hidden lg:flex">
        <div className="px-4 md:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Discover Polls</h1>
        </div>
        <div className="flex space-x-4 mr-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search polls..."
              className="bg-gray-100 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="h-5 w-5 text-gray-400 absolute right-3 top-2.5" />
          </div>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 lg:py-8 md:px-6 lg:px-8 bg-gray-50 mt-16 lg:mt-0">
        {/* Page Header (mobile only) */}
        <div className="lg:hidden mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Discover Polls</h1>
          <div className="mt-4 space-y-3">
            <Input
              type="text"
              placeholder="Search polls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Random Poll Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Random Poll</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGetRandomPoll}
              disabled={randomPollLoading}
            >
              {randomPollLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Get Another
            </Button>
          </div>
          
          {randomPollLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : randomPoll ? (
            <div className="max-w-xl mx-auto">
              <PollCard poll={randomPoll} onVoteSuccess={handleGetRandomPoll} />
            </div>
          ) : (
            <Card className="w-full py-8">
              <CardContent className="flex flex-col items-center justify-center">
                <p className="text-gray-500">No random poll available</p>
                <Button onClick={handleGetRandomPoll} variant="outline" className="mt-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Main Content with Tabs */}
        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="trending">Trending Polls</TabsTrigger>
            <TabsTrigger value="recent">Recent Polls</TabsTrigger>
          </TabsList>
          
          {/* Category filters (for mobile and tablets) */}
          {(selectedCategory !== "All" || searchQuery) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedCategory !== "All" && (
                <Badge className="bg-primary-100 text-primary-600 hover:bg-primary-200 border-0">
                  {selectedCategory}
                  <button 
                    className="ml-1 hover:text-primary-800"
                    onClick={() => setSelectedCategory("All")}
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {searchQuery && (
                <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-0">
                  "{searchQuery}"
                  <button 
                    className="ml-1 hover:text-gray-800"
                    onClick={() => setSearchQuery("")}
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {(selectedCategory !== "All" || searchQuery) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                >
                  Clear All
                </Button>
              )}
            </div>
          )}
          
          {/* Trending Polls Tab */}
          <TabsContent value="trending">
            {trendingLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredTrending.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrending.map((poll: PollWithVotes) => (
                  <PollCard key={poll.id} poll={poll} onVoteSuccess={handlePollVoted} />
                ))}
              </div>
            ) : (
              <Card className="w-full py-8">
                <CardContent className="flex flex-col items-center justify-center">
                  <ClipboardList className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500">
                    {searchQuery || selectedCategory !== "All"
                      ? "No polls found matching your criteria"
                      : "No trending polls available"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Recent Polls Tab */}
          <TabsContent value="recent">
            {recentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredRecent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecent.map((poll: PollWithVotes) => (
                  <PollCard key={poll.id} poll={poll} onVoteSuccess={handlePollVoted} />
                ))}
              </div>
            ) : (
              <Card className="w-full py-8">
                <CardContent className="flex flex-col items-center justify-center">
                  <ClipboardList className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500">
                    {searchQuery || selectedCategory !== "All"
                      ? "No polls found matching your criteria"
                      : "No recent polls available"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
