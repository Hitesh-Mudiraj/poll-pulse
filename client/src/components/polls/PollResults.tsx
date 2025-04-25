import { PollWithResults } from "@shared/schema";
import { DoughnutChart } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";

interface PollResultsProps {
  poll: PollWithResults;
}

const PollResults = ({ poll }: PollResultsProps) => {
  // Prepare data for chart
  const labels = poll.results.map(option => option.text);
  const data = poll.results.map(option => option.percentage);
  
  // Check if user has voted
  const userVote = poll.userVote;
  
  return (
    <div className="mb-5 space-y-5">
      <div className="space-y-3">
        {poll.results.map((option) => (
          <div key={option.id}>
            <div className="flex justify-between mb-1">
              <span className="text-gray-700 flex items-center">
                {option.text}
                {userVote === option.id && (
                  <span className="ml-2 text-xs bg-primary-100 text-primary px-1.5 py-0.5 rounded-full">
                    Your vote
                  </span>
                )}
              </span>
              <span className="text-gray-500 text-sm">{option.percentage}%</span>
            </div>
            <Progress value={option.percentage} className="h-2.5" />
          </div>
        ))}
      </div>
      
      {poll.totalVotes > 0 && (
        <div className="mt-4 border-t pt-4">
          <div className="flex justify-center">
            <DoughnutChart 
              labels={labels}
              data={data}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PollResults;
