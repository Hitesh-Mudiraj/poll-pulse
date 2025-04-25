import { 
  User, InsertUser, Poll, InsertPoll, Vote, InsertVote, Comment, InsertComment,
  PollWithVotes, UserStats
} from "@shared/schema";

// Storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Poll methods
  createPoll(poll: InsertPoll): Promise<Poll>;
  getPoll(id: number): Promise<Poll | undefined>;
  getPollWithVotes(id: number, userId?: number): Promise<PollWithVotes | undefined>;
  getAllPolls(): Promise<Poll[]>;
  getUserPolls(userId: number): Promise<Poll[]>;
  getTrendingPolls(limit?: number): Promise<PollWithVotes[]>;
  getRecentPolls(limit?: number): Promise<Poll[]>;
  getRandomPoll(): Promise<Poll | undefined>;
  
  // Vote methods
  createVote(vote: InsertVote): Promise<Vote>;
  getVotesForPoll(pollId: number): Promise<Vote[]>;
  getUserVoteForPoll(userId: number, pollId: number): Promise<Vote | undefined>;
  
  // Comment methods
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsForPoll(pollId: number): Promise<Comment[]>;
  
  // Stats methods
  getUserStats(userId: number): Promise<UserStats>;
  getOverallStats(): Promise<{
    activePolls: number;
    totalViews: number;
    totalVotes: number;
    totalParticipants: number;
  }>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private polls: Map<number, Poll>;
  private votes: Map<number, Vote>;
  private comments: Map<number, Comment>;
  
  private userIdCounter: number;
  private pollIdCounter: number;
  private voteIdCounter: number;
  private commentIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.polls = new Map();
    this.votes = new Map();
    this.comments = new Map();
    
    this.userIdCounter = 1;
    this.pollIdCounter = 1;
    this.voteIdCounter = 1;
    this.commentIdCounter = 1;
    
    // Add some sample data for testing
    this.initializeData();
  }

  private initializeData() {
    // Create a test user
    const testUser: InsertUser = {
      username: "testuser",
      password: "password123",
      email: "test@example.com",
      name: "Test User",
    };
    const user = this.createUser(testUser);

    // Create some sample polls
    const categories = ["Technology", "Food", "Entertainment", "Sports", "Education"];
    const pollTitles = [
      "Which smartphone OS do you prefer?",
      "What's your favorite pizza topping?",
      "Best streaming service?",
      "Favorite programming language?",
      "Most essential travel item?",
      "Do you prefer working from home or office?",
      "How often do you exercise?",
      "Favorite social media platform?"
    ];
    
    // Sample options for each poll
    const pollOptions = [
      ["iOS", "Android", "Other"],
      ["Pepperoni", "Mushrooms", "Extra Cheese", "Other"],
      ["Netflix", "Hulu", "Disney+", "Amazon Prime", "Other"],
      ["JavaScript", "Python", "Java", "C#", "Go", "Other"],
      ["Passport", "Phone", "Toiletries", "First Aid Kit", "Travel Pillow"],
      ["Home", "Office", "Hybrid"],
      ["Daily", "2-3 times a week", "Once a week", "Rarely", "Never"],
      ["Facebook", "Twitter", "Instagram", "LinkedIn", "TikTok", "Other"]
    ];
    
    // Create polls with random categories
    for (let i = 0; i < pollTitles.length; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 10) + 1);
      
      const poll: InsertPoll = {
        title: pollTitles[i],
        user_id: user.id,
        category,
        options: pollOptions[i],
        allow_multiple: Math.random() > 0.7,
        allow_comments: Math.random() > 0.3,
        end_date: endDate,
      };
      
      this.createPoll(poll);
    }
    
    // Add some votes
    const polls = Array.from(this.polls.values());
    for (const poll of polls) {
      const numVotes = Math.floor(Math.random() * 1000) + 100;
      for (let i = 0; i < numVotes; i++) {
        const randomOptionIndex = Math.floor(Math.random() * (poll.options as string[]).length);
        this.createVote({
          poll_id: poll.id,
          user_id: Math.random() > 0.8 ? user.id : undefined,
          option_index: randomOptionIndex,
        });
      }
    }
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = {
      ...user,
      id,
      created_at: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Poll methods
  async createPoll(poll: InsertPoll): Promise<Poll> {
    const id = this.pollIdCounter++;
    const newPoll: Poll = {
      ...poll,
      id,
      created_at: new Date(),
    };
    this.polls.set(id, newPoll);
    return newPoll;
  }
  
  async getPoll(id: number): Promise<Poll | undefined> {
    return this.polls.get(id);
  }
  
  async getPollWithVotes(id: number, userId?: number): Promise<PollWithVotes | undefined> {
    const poll = this.polls.get(id);
    if (!poll) return undefined;
    
    const pollVotes = Array.from(this.votes.values()).filter(vote => vote.poll_id === id);
    
    // Calculate vote counts per option
    const voteResults: { [key: number]: number } = {};
    for (const vote of pollVotes) {
      if (!voteResults[vote.option_index]) {
        voteResults[vote.option_index] = 0;
      }
      voteResults[vote.option_index]++;
    }
    
    // Find user's vote if userId is provided
    let userVote = undefined;
    if (userId) {
      const userVoteObj = pollVotes.find(vote => vote.user_id === userId);
      if (userVoteObj) {
        userVote = userVoteObj.option_index;
      }
    }
    
    return {
      ...poll,
      totalVotes: pollVotes.length,
      voteResults,
      userVote,
    };
  }
  
  async getAllPolls(): Promise<Poll[]> {
    return Array.from(this.polls.values());
  }
  
  async getUserPolls(userId: number): Promise<Poll[]> {
    return Array.from(this.polls.values()).filter(poll => poll.user_id === userId);
  }
  
  async getTrendingPolls(limit: number = 3): Promise<PollWithVotes[]> {
    // Get all polls with their vote counts
    const polls = Array.from(this.polls.values());
    const pollsWithVotes: PollWithVotes[] = [];
    
    for (const poll of polls) {
      const pollVotes = Array.from(this.votes.values()).filter(vote => vote.poll_id === poll.id);
      
      // Calculate vote counts per option
      const voteResults: { [key: number]: number } = {};
      for (const vote of pollVotes) {
        if (!voteResults[vote.option_index]) {
          voteResults[vote.option_index] = 0;
        }
        voteResults[vote.option_index]++;
      }
      
      pollsWithVotes.push({
        ...poll,
        totalVotes: pollVotes.length,
        voteResults,
      });
    }
    
    // Sort by total votes (trending)
    pollsWithVotes.sort((a, b) => b.totalVotes - a.totalVotes);
    
    return pollsWithVotes.slice(0, limit);
  }
  
  async getRecentPolls(limit: number = 5): Promise<Poll[]> {
    const polls = Array.from(this.polls.values());
    polls.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    return polls.slice(0, limit);
  }
  
  async getRandomPoll(): Promise<Poll | undefined> {
    const polls = Array.from(this.polls.values());
    if (polls.length === 0) return undefined;
    return polls[Math.floor(Math.random() * polls.length)];
  }
  
  // Vote methods
  async createVote(vote: InsertVote): Promise<Vote> {
    const id = this.voteIdCounter++;
    const newVote: Vote = {
      ...vote,
      id,
      created_at: new Date(),
    };
    this.votes.set(id, newVote);
    return newVote;
  }
  
  async getVotesForPoll(pollId: number): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(vote => vote.poll_id === pollId);
  }
  
  async getUserVoteForPoll(userId: number, pollId: number): Promise<Vote | undefined> {
    return Array.from(this.votes.values()).find(
      vote => vote.user_id === userId && vote.poll_id === pollId
    );
  }
  
  // Comment methods
  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const newComment: Comment = {
      ...comment,
      id,
      created_at: new Date(),
    };
    this.comments.set(id, newComment);
    return newComment;
  }
  
  async getCommentsForPoll(pollId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.poll_id === pollId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }
  
  // Stats methods
  async getUserStats(userId: number): Promise<UserStats> {
    const userPolls = Array.from(this.polls.values()).filter(poll => poll.user_id === userId);
    const userVotes = Array.from(this.votes.values()).filter(vote => vote.user_id === userId);
    
    // Calculate votes by category
    const categoriesVoted: { [key: string]: number } = {};
    for (const vote of userVotes) {
      const poll = this.polls.get(vote.poll_id);
      if (poll) {
        if (!categoriesVoted[poll.category]) {
          categoriesVoted[poll.category] = 0;
        }
        categoriesVoted[poll.category]++;
      }
    }
    
    // Get recent activity
    const activity: UserStats['recentActivity'] = [];
    
    // Created polls
    for (const poll of userPolls) {
      activity.push({
        type: 'created',
        pollId: poll.id,
        pollTitle: poll.title,
        timestamp: poll.created_at,
      });
    }
    
    // Votes
    for (const vote of userVotes) {
      const poll = this.polls.get(vote.poll_id);
      if (poll) {
        activity.push({
          type: 'voted',
          pollId: poll.id,
          pollTitle: poll.title,
          timestamp: vote.created_at,
        });
      }
    }
    
    // Sort by recency
    activity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return {
      totalPolls: userPolls.length,
      totalVotes: userVotes.length,
      categoriesVoted,
      recentActivity: activity.slice(0, 10),
    };
  }
  
  async getOverallStats(): Promise<{
    activePolls: number;
    totalViews: number;
    totalVotes: number;
    totalParticipants: number;
  }> {
    const now = new Date();
    
    // Active polls are those whose end date is in the future
    const activePolls = Array.from(this.polls.values()).filter(
      poll => !poll.end_date || poll.end_date > now
    ).length;
    
    // Total votes is just the count of all votes
    const totalVotes = this.votes.size;
    
    // For simplicity, we'll assume each vote = 1 view, plus some extra
    const totalViews = totalVotes + Math.floor(totalVotes * 0.6);
    
    // Unique participants are users who have voted
    const uniqueVoters = new Set(Array.from(this.votes.values())
      .filter(vote => vote.user_id !== undefined)
      .map(vote => vote.user_id));
    
    // Add anonymous voters (estimated)
    const anonymousVoters = Array.from(this.votes.values())
      .filter(vote => vote.user_id === undefined).length;
    
    // Each anonymous voter is counted as a unique participant
    const totalParticipants = uniqueVoters.size + anonymousVoters;
    
    return {
      activePolls,
      totalViews,
      totalVotes,
      totalParticipants,
    };
  }
}

export const storage = new MemStorage();
