import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import PollCard from "@/components/polls/PollCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";

const Home = () => {
  const [sortBy, setSortBy] = useState("newest");

  // Fetch featured (random) polls
  const featuredPollsQuery = useQuery({
    queryKey: ["/api/polls/random"],
    queryFn: async () => {
      const res = await fetch("/api/polls/random?limit=3");
      if (!res.ok) throw new Error("Failed to fetch featured polls");
      return res.json();
    },
  });

  // Fetch recent polls
  const recentPollsQuery = useQuery({
    queryKey: ["/api/polls", sortBy],
    queryFn: async () => {
      const res = await fetch(`/api/polls?sortBy=${sortBy}&limit=6`);
      if (!res.ok) throw new Error("Failed to fetch recent polls");
      return res.json();
    },
  });

  const featuredPolls = featuredPollsQuery.data?.polls || [];
  const recentPolls = recentPollsQuery.data?.polls || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary rounded-2xl p-8 md:p-12 mb-12 text-white">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Create, Share, and Discover Polls</h1>
          <p className="text-lg md:text-xl opacity-90 mb-8">
            Get instant feedback on your questions or participate in community polls. Easy to create, easy to share.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out"
              asChild
            >
              <Link href="/my-polls">Create a Poll</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-transparent hover:bg-primary-600 border border-white text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out"
              asChild
            >
              <Link href="/discover">See Trending Polls</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured polls section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Polls</h2>
          <Link href="/discover" className="text-primary hover:text-primary-600 font-medium flex items-center">
            View all <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPollsQuery.isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 h-[360px] animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded mb-8 w-1/2"></div>
                <div className="space-y-3">
                  {Array(4).fill(0).map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
                  ))}
                </div>
              </div>
            ))
          ) : featuredPolls.length > 0 ? (
            featuredPolls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <p className="text-gray-500">No featured polls available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent polls section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Polls</h2>
          <div className="flex items-center space-x-2">
            <Label htmlFor="sortBy" className="text-gray-600 text-sm">
              Sort by:
            </Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[120px] text-sm h-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentPollsQuery.isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 h-[360px] animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded mb-8 w-1/2"></div>
                <div className="space-y-3">
                  {Array(4).fill(0).map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
                  ))}
                </div>
              </div>
            ))
          ) : recentPolls.length > 0 ? (
            recentPolls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <p className="text-gray-500">No polls available.</p>
            </div>
          )}
        </div>
        {recentPolls.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Button 
              variant="outline" 
              className="flex items-center px-6 py-3 bg-white border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50 transition duration-150 ease-in-out"
            >
              Load More <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
