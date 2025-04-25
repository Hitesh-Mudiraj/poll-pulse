import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import PollCard from "@/components/polls/PollCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Discover = () => {
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pollsPerPage = 9;
  
  // Fetch all polls
  const pollsQuery = useQuery({
    queryKey: ["/api/polls", sortBy],
    queryFn: async () => {
      const res = await fetch(`/api/polls?sortBy=${sortBy}&limit=30`);
      if (!res.ok) throw new Error("Failed to fetch polls");
      return res.json();
    },
  });

  const allPolls = pollsQuery.data?.polls || [];
  
  // Filter polls by search query
  const filteredPolls = searchQuery 
    ? allPolls.filter(poll => 
        poll.question.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allPolls;
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredPolls.length / pollsPerPage);
  const startIndex = (currentPage - 1) * pollsPerPage;
  const paginatedPolls = filteredPolls.slice(startIndex, startIndex + pollsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Discover Polls</h1>
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search polls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Label htmlFor="discoverySort" className="text-gray-600 whitespace-nowrap">
            Sort by:
          </Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger id="discoverySort" className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="mostVotes">Most Votes</SelectItem>
              <SelectItem value="endingSoon">Ending Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {pollsQuery.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(9).fill(0).map((_, i) => (
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
      ) : paginatedPolls.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPolls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold mb-2">No polls found</h3>
          <p className="text-gray-500">
            {searchQuery 
              ? `No polls match your search "${searchQuery}"`
              : "There are no polls available at the moment"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Discover;
