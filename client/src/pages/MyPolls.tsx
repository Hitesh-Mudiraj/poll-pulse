import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, ClipboardList, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import PollCard from "@/components/PollCard";
import CreatePollModal from "@/components/CreatePollModal";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow, parseISO } from "date-fns";
import { getRandomColor } from "@/lib/utils";
import { PollWithVotes } from "@shared/schema";

export default function MyPolls() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, openAuthModal } = useAuth();
  const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect if not logged in
  if (!user) {
    useEffect(() => {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view your polls",
      });
      openAuthModal();
      navigate("/");
    }, []);
    return null;
  }

  // Query for user's polls
  const { 
    data: userPolls, 
    isLoading,
    refetch: refetchPolls
  } = useQuery({
    queryKey: ['/api/polls/user'],
    enabled: !!user,
  });

  const handleCreatePoll = () => {
    setIsCreatePollModalOpen(true);
  };

  const handlePollCreated = () => {
    refetchPolls();
    toast({
      title: "Poll Created",
      description: "Your poll has been created successfully!",
    });
  };

  const handlePollVoted = () => {
    refetchPolls();
  };

  // Filter polls by search query
  const filteredPolls = userPolls && searchQuery
    ? userPolls.filter((poll: PollWithVotes) => 
        poll.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : userPolls;

  // Calculate active and ended polls
  const now = new Date();
  const activePolls = filteredPolls?.filter((poll: PollWithVotes) => 
    !poll.end_date || new Date(poll.end_date) > now
  );
  
  const endedPolls = filteredPolls?.filter((poll: PollWithVotes) => 
    poll.end_date && new Date(poll.end_date) <= now
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Content Header */}
      <header className="bg-white shadow-sm lg:pl-0 lg:pr-6 pt-4 pb-4 flex items-center justify-between lg:border-b hidden lg:flex">
        <div className="px-4 md:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">My Polls</h1>
        </div>
        <div className="flex space-x-4 mr-4">
          <Button onClick={handleCreatePoll} className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Create Poll
          </Button>
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

      {/* Mobile Action Button */}
      <div className="fixed bottom-6 right-6 z-10 lg:hidden">
        <Button
          onClick={handleCreatePoll}
          className="rounded-full h-14 w-14 flex items-center justify-center shadow-lg p-0"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 lg:py-8 md:px-6 lg:px-8 bg-gray-50 mt-16 lg:mt-0">
        {/* Page Header (mobile only) */}
        <div className="lg:hidden mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">My Polls</h1>
          <div className="mt-4">
            <Input
              type="text"
              placeholder="Search polls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        
        {isLoading ? (
          // Skeleton loading state
          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ) : !userPolls || userPolls.length === 0 ? (
          // Empty state
          <Card className="w-full py-10">
            <CardContent className="flex flex-col items-center justify-center">
              <ClipboardList className="h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-medium text-center">You haven't created any polls yet</h2>
              <p className="text-gray-500 text-center mt-2 mb-6">Create your first poll to start collecting responses</p>
              <Button onClick={handleCreatePoll}>
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Poll
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Polls content with tabs
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="active">Active Polls ({activePolls?.length || 0})</TabsTrigger>
              <TabsTrigger value="ended">Ended Polls ({endedPolls?.length || 0})</TabsTrigger>
              <TabsTrigger value="all">All Polls ({filteredPolls?.length || 0})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              {activePolls && activePolls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activePolls.map((poll: PollWithVotes) => (
                    <PollCard key={poll.id} poll={poll} onVoteSuccess={handlePollVoted} />
                  ))}
                </div>
              ) : (
                <Card className="w-full py-8">
                  <CardContent className="flex flex-col items-center justify-center">
                    <p className="text-gray-500">No active polls found</p>
                    {!searchQuery && (
                      <Button onClick={handleCreatePoll} variant="outline" className="mt-4">
                        Create New Poll
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="ended">
              {endedPolls && endedPolls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {endedPolls.map((poll: PollWithVotes) => (
                    <PollCard key={poll.id} poll={poll} onVoteSuccess={handlePollVoted} />
                  ))}
                </div>
              ) : (
                <Card className="w-full py-8">
                  <CardContent className="flex flex-col items-center justify-center">
                    <p className="text-gray-500">No ended polls found</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="all">
              {filteredPolls && filteredPolls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPolls.map((poll: PollWithVotes) => (
                    <PollCard key={poll.id} poll={poll} onVoteSuccess={handlePollVoted} />
                  ))}
                </div>
              ) : (
                <Card className="w-full py-8">
                  <CardContent className="flex flex-col items-center justify-center">
                    <p className="text-gray-500">No polls found matching your search</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Create Poll Modal */}
      <CreatePollModal 
        isOpen={isCreatePollModalOpen} 
        onClose={() => setIsCreatePollModalOpen(false)}
        onPollCreated={handlePollCreated}
      />
    </div>
  );
}

import { useEffect } from "react";
