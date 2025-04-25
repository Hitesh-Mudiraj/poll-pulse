import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { PlusCircle, ClipboardList, Eye, Vote, Users, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import StatCard from "@/components/StatCard";
import PollCard from "@/components/PollCard";
import CreatePollModal from "@/components/CreatePollModal";
import { DoughnutChart, chartColors } from "@/components/ui/chart";
import { PollWithVotes, UserStats } from "@shared/schema";
import { formatNumber, getTimeAgo, getRandomColor } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useAnimation } from "@/contexts/AnimationContext";
import { 
  AnimatedPage, 
  FadeIn, 
  SlideUp, 
  StaggeredContainer, 
  StaggeredItem, 
  Pulse
} from "@/components/ui/animated";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { chartAnimations, cardAnimations } = useAnimation();
  
  const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredPollId, setHoveredPollId] = useState<number | null>(null);

  // Query for overall stats
  const { data: overallStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/stats/overall'],
    enabled: true,
  });

  // Query for trending polls
  const { 
    data: trendingPolls, 
    isLoading: isLoadingTrending,
    refetch: refetchTrendingPolls
  } = useQuery({
    queryKey: ['/api/polls/trending'],
    enabled: true,
  });

  // Query for recent polls
  const { 
    data: recentPolls, 
    isLoading: isLoadingRecent,
    refetch: refetchRecentPolls
  } = useQuery({
    queryKey: ['/api/polls/recent'],
    enabled: true,
  });

  // Query for user stats (only if user is logged in)
  const { 
    data: userStats,
    isLoading: isLoadingUserStats
  } = useQuery({
    queryKey: ['/api/stats/user'],
    enabled: !!user,
  });

  // Prepare chart data for voting categories
  const prepareChartData = (stats?: UserStats) => {
    if (!stats || !stats.categoriesVoted) {
      return {
        labels: ["No data"],
        datasets: [{
          data: [1],
          backgroundColor: ['#e2e8f0'],
          borderWidth: 0
        }]
      };
    }

    const categories = Object.keys(stats.categoriesVoted);
    const voteCounts = Object.values(stats.categoriesVoted);

    return {
      labels: categories.length ? categories : ["No votes yet"],
      datasets: [{
        data: voteCounts.length ? voteCounts : [1],
        backgroundColor: voteCounts.length ? chartColors.slice(0, voteCounts.length) : ['#e2e8f0'],
        borderWidth: 0
      }]
    };
  };

  const handleCreatePoll = () => {
    setIsCreatePollModalOpen(true);
  };

  const handlePollCreated = () => {
    refetchTrendingPolls();
    refetchRecentPolls();
    toast({
      title: "Poll Created",
      description: "Your poll has been created successfully!",
    });
  };

  const handlePollVoted = () => {
    refetchTrendingPolls();
    refetchRecentPolls();
  };

  return (
    <AnimatedPage>
      {/* Content Header with Actions */}
      <header className="bg-white shadow-sm lg:pl-0 lg:pr-6 pt-4 pb-4 flex items-center justify-between lg:border-b hidden lg:flex">
        <motion.div 
          className="px-4 md:px-6 lg:px-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </motion.div>
        <motion.div 
          className="flex space-x-4 mr-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Pulse>
            <Button onClick={handleCreatePoll} className="flex items-center">
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Poll
            </Button>
          </Pulse>
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <Input
              type="text"
              placeholder="Search polls..."
              className="bg-gray-100 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="h-5 w-5 text-gray-400 absolute right-3 top-2.5" />
          </motion.div>
        </motion.div>
      </header>

      {/* Mobile Action Button */}
      <motion.div 
        className="fixed bottom-6 right-6 z-10 lg:hidden"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          onClick={handleCreatePoll}
          className="rounded-full h-14 w-14 flex items-center justify-center shadow-lg p-0"
        >
          <PlusCircle className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 lg:py-8 md:px-6 lg:px-8 bg-gray-50 mt-16 lg:mt-0">
        {/* Page Header (mobile only) */}
        <motion.div 
          className="lg:hidden mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </motion.div>
        
        {/* Stats Overview */}
        <motion.div 
          className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={cardAnimations ? { opacity: 0, y: 20 } : { opacity: 1 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isLoadingStats ? (
            // Skeleton loaders for stats
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="ml-5 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Actual stat cards with staggered animation
            <StaggeredContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StaggeredItem>
                <StatCard
                  title="Active Polls"
                  value={formatNumber(overallStats?.activePolls || 0)}
                  icon={<ClipboardList className="h-6 w-6" />}
                />
              </StaggeredItem>
              <StaggeredItem>
                <StatCard
                  title="Total Views"
                  value={formatNumber(overallStats?.totalViews || 0)}
                  icon={<Eye className="h-6 w-6" />}
                  iconBgColor="bg-green-100"
                  iconColor="text-green-600"
                />
              </StaggeredItem>
              <StaggeredItem>
                <StatCard
                  title="Total Votes"
                  value={formatNumber(overallStats?.totalVotes || 0)}
                  icon={<Vote className="h-6 w-6" />}
                  iconBgColor="bg-orange-100"
                  iconColor="text-orange-600"
                />
              </StaggeredItem>
              <StaggeredItem>
                <StatCard
                  title="Participants"
                  value={formatNumber(overallStats?.totalParticipants || 0)}
                  icon={<Users className="h-6 w-6" />}
                  iconBgColor="bg-blue-100"
                  iconColor="text-blue-600"
                />
              </StaggeredItem>
            </StaggeredContainer>
          )}
        </motion.div>
        
        {/* Trending Polls */}
        <SlideUp className="mb-8">
          <motion.h2 
            className="text-xl font-semibold text-gray-900 mb-4"
            whileInView={{ x: [10, 0] }}
            transition={{ duration: 0.5 }}
          >
            Trending Polls
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingTrending ? (
              // Skeleton loaders for polls
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-24 rounded-full" />
                      <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-3/4" />
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-8 w-20 rounded-md" />
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              ))
            ) : trendingPolls && trendingPolls.length > 0 ? (
              <StaggeredContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingPolls.map((poll: PollWithVotes, index: number) => (
                  <StaggeredItem key={poll.id}>
                    <PollCard poll={poll} onVoteSuccess={handlePollVoted} />
                  </StaggeredItem>
                ))}
              </StaggeredContainer>
            ) : (
              <motion.div 
                className="col-span-3 text-center py-8 bg-white rounded-lg shadow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-gray-500">No trending polls available</p>
                <Pulse>
                  <Button onClick={handleCreatePoll} variant="outline" className="mt-4">
                    Create Your First Poll
                  </Button>
                </Pulse>
              </motion.div>
            )}
          </div>
        </SlideUp>
        
        {/* Recent Polls */}
        <SlideUp className="mb-8">
          <motion.h2 
            className="text-xl font-semibold text-gray-900 mb-4"
            whileInView={{ x: [10, 0] }}
            transition={{ duration: 0.5 }}
          >
            Recent Polls
          </motion.h2>
          <motion.div 
            className="bg-white rounded-lg shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {isLoadingRecent ? (
              // Skeleton for recent polls
              <ul className="divide-y divide-gray-200">
                {Array(5).fill(0).map((_, i) => (
                  <li key={i} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <div className="ml-4 space-y-1">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : recentPolls && recentPolls.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                <AnimatePresence>
                  {recentPolls.map((poll: any, index: number) => (
                    <motion.li 
                      key={poll.id} 
                      className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.1 
                      }}
                      whileHover={{ 
                        backgroundColor: "rgb(243 244 246)",
                        x: 5 
                      }}
                      onHoverStart={() => setHoveredPollId(poll.id)}
                      onHoverEnd={() => setHoveredPollId(null)}
                      onClick={() => navigate(`/poll/${poll.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <motion.div 
                            className="flex-shrink-0"
                            whileHover={{ rotate: 5 }}
                            animate={hoveredPollId === poll.id ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 0.5 }}
                          >
                            <span className={`inline-flex items-center justify-center h-10 w-10 rounded-md ${getRandomColor(poll.id)}`}>
                              <ClipboardList className="h-6 w-6" />
                            </span>
                          </motion.div>
                          <div className="ml-4">
                            <h3 className="text-base font-medium text-gray-900">{poll.title}</h3>
                            <div className="flex items-center mt-1">
                              <span className="text-xs font-medium text-gray-500">Created by</span>
                              <span className="text-xs font-medium text-gray-900 ml-1">{poll.user_id ? "User" : "Anonymous"}</span>
                              <span className="text-xs text-gray-500 mx-1">•</span>
                              <span className="text-xs text-gray-500">{getTimeAgo(poll.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <motion.div 
                          className="flex items-center space-x-4"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary-600 hover:text-primary-700"
                          >
                            Vote Now
                          </Button>
                        </motion.div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent polls available</p>
              </div>
            )}
          </motion.div>
        </SlideUp>
        
        {/* Your Activity (only shown if logged in) */}
        {user && (
          <FadeIn>
            <motion.h2 
              className="text-xl font-semibold text-gray-900 mb-4"
              whileInView={{ x: [10, 0] }}
              transition={{ duration: 0.5 }}
            >
              Your Activity
            </motion.h2>
            <motion.div 
              className="bg-white rounded-lg shadow-sm overflow-hidden p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Votes by Category */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Votes by Category</h3>
                  <div className="relative h-64">
                    {isLoadingUserStats ? (
                      <div className="flex items-center justify-center h-full">
                        <Skeleton className="h-40 w-40 rounded-full" />
                      </div>
                    ) : (
                      <motion.div
                        initial={chartAnimations ? { scale: 0.8, opacity: 0 } : { opacity: 1 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <DoughnutChart data={prepareChartData(userStats)} />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
                
                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {isLoadingUserStats ? (
                      // Skeleton for activity
                      Array(4).fill(0).map((_, i) => (
                        <div key={i} className="border-l-4 border-gray-300 pl-4 py-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-60 mt-1" />
                          <Skeleton className="h-3 w-20 mt-1" />
                        </div>
                      ))
                    ) : userStats && userStats.recentActivity.length > 0 ? (
                      <StaggeredContainer>
                        {userStats.recentActivity.slice(0, 4).map((activity, index) => {
                          const borderColors = {
                            created: 'border-primary-500',
                            voted: 'border-green-500',
                            shared: 'border-orange-500'
                          };
                          return (
                            <StaggeredItem key={index}>
                              <motion.div 
                                className={`border-l-4 ${borderColors[activity.type]} pl-4 py-2`}
                                whileHover={{ x: 5, backgroundColor: "rgba(243, 244, 246, 0.5)" }}
                                transition={{ duration: 0.2 }}
                              >
                                <p className="text-sm font-medium text-gray-900">
                                  You {activity.type === 'created' ? 'created a new poll' : 
                                    activity.type === 'voted' ? 'voted on a poll' : 'shared a poll'}
                                </p>
                                <p className="text-sm text-gray-500">"{activity.pollTitle}"</p>
                                <p className="text-xs text-gray-500 mt-1">{getTimeAgo(activity.timestamp)}</p>
                              </motion.div>
                            </StaggeredItem>
                          );
                        })}
                      </StaggeredContainer>
                    ) : (
                      <p className="text-center text-gray-500 py-4">No recent activity</p>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </FadeIn>
        )}
      </main>

      {/* Create Poll Modal */}
      <CreatePollModal 
        isOpen={isCreatePollModalOpen} 
        onClose={() => setIsCreatePollModalOpen(false)}
        onPollCreated={handlePollCreated}
      />
    </AnimatedPage>
  );
}
