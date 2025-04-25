import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PollCard from "@/components/polls/PollCard";
import CreatePollForm from "@/components/polls/CreatePollForm";
import { useAuth } from "@/hooks/use-auth";
import { Plus } from "lucide-react";

const MyPolls = () => {
  const { user } = useAuth();
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  
  // Fetch polls created by the user
  const myPollsQuery = useQuery({
    queryKey: ["/api/polls/my"],
    queryFn: async () => {
      const res = await fetch("/api/polls/my");
      if (!res.ok) throw new Error("Failed to fetch your polls");
      return res.json();
    },
    enabled: !!user,
  });

  const myPolls = myPollsQuery.data?.polls || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Polls</h1>
        <Button 
          onClick={() => setShowCreatePollModal(true)}
          className="bg-primary hover:bg-primary-600 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Create New Poll
        </Button>
      </div>
      
      {myPollsQuery.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 h-[360px] animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded mb-8 w-1/2"></div>
              <div className="space-y-3">
                {Array(4).fill(0).map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : myPolls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myPolls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold mb-2">You haven't created any polls yet</h3>
          <p className="text-gray-500 mb-6">Create your first poll to start collecting responses</p>
          <Button 
            onClick={() => setShowCreatePollModal(true)}
            className="bg-primary hover:bg-primary-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Your First Poll
          </Button>
        </div>
      )}
      
      {/* Create Poll Modal */}
      <Dialog open={showCreatePollModal} onOpenChange={setShowCreatePollModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a New Poll</DialogTitle>
          </DialogHeader>
          <CreatePollForm onSuccess={() => setShowCreatePollModal(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyPolls;
