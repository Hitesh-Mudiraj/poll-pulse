import { 
  User, InsertUser, 
  Poll, InsertPoll, 
  PollOption, InsertPollOption, 
  Vote, InsertVote,
  PollWithOptions, PollOptionWithVotes, PollWithResults
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Poll methods
  createPoll(poll: InsertPoll, options: string[]): Promise<Poll>;
  getPoll(id: number): Promise<PollWithOptions | undefined>;
  getPollResults(id: number, userId?: number): Promise<PollWithResults | undefined>;
  listPolls(limit: number, offset: number, sortBy?: string): Promise<PollWithOptions[]>;
  listMyPolls(userId: number, limit: number, offset: number): Promise<PollWithOptions[]>;
  getRandomPolls(limit: number): Promise<PollWithOptions[]>;
  
  // Voting methods
  vote(vote: InsertVote): Promise<Vote>;
  getUserVote(pollId: number, userId: number): Promise<Vote | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private polls: Map<number, Poll>;
  private pollOptions: Map<number, PollOption[]>;
  private votes: Map<number, Vote[]>;
  private userIdCounter: number;
  private pollIdCounter: number;
  private pollOptionIdCounter: number;
  private voteIdCounter: number;

  constructor() {
    this.users = new Map();
    this.polls = new Map();
    this.pollOptions = new Map();
    this.votes = new Map();
    this.userIdCounter = 1;
    this.pollIdCounter = 1;
    this.pollOptionIdCounter = 1;
    this.voteIdCounter = 1;
    
    this.initializeRandomPolls();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Poll methods
  async createPoll(insertPoll: InsertPoll, optionsText: string[]): Promise<Poll> {
    const id = this.pollIdCounter++;
    const poll: Poll = {
      ...insertPoll,
      id,
      createdAt: new Date()
    };
    
    this.polls.set(id, poll);
    
    // Create options
    const options: PollOption[] = [];
    for (const text of optionsText) {
      const optionId = this.pollOptionIdCounter++;
      const option: PollOption = {
        id: optionId,
        pollId: id,
        text
      };
      options.push(option);
    }
    
    this.pollOptions.set(id, options);
    this.votes.set(id, []);
    
    return poll;
  }

  async getPoll(id: number): Promise<PollWithOptions | undefined> {
    const poll = this.polls.get(id);
    if (!poll) return undefined;
    
    const options = this.pollOptions.get(id) || [];
    const votes = this.votes.get(id) || [];
    
    const creator = poll.createdBy ? this.users.get(poll.createdBy) : undefined;
    
    return {
      ...poll,
      options,
      creator: creator ? { id: creator.id, username: creator.username } : undefined,
      totalVotes: votes.length
    };
  }

  async getPollResults(id: number, userId?: number): Promise<PollWithResults | undefined> {
    const pollWithOptions = await this.getPoll(id);
    if (!pollWithOptions) return undefined;
    
    const votes = this.votes.get(id) || [];
    const userVote = userId ? votes.find(v => this.users.get(v.userId!)?.id === userId) : undefined;
    
    const results: PollOptionWithVotes[] = pollWithOptions.options.map(option => {
      const optionVotes = votes.filter(vote => vote.optionId === option.id);
      return {
        ...option,
        voteCount: optionVotes.length,
        percentage: pollWithOptions.totalVotes === 0 
          ? 0 
          : Math.round((optionVotes.length / pollWithOptions.totalVotes) * 100)
      };
    });
    
    return {
      ...pollWithOptions,
      results,
      userVote: userVote?.optionId
    };
  }

  async listPolls(limit: number, offset: number, sortBy?: string): Promise<PollWithOptions[]> {
    let polls = Array.from(this.polls.values())
      .filter(poll => poll.visibility === 'public');
    
    if (sortBy === 'newest') {
      polls = polls.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortBy === 'mostVotes') {
      polls = polls.sort((a, b) => {
        const aVotes = this.votes.get(a.id)?.length || 0;
        const bVotes = this.votes.get(b.id)?.length || 0;
        return bVotes - aVotes;
      });
    } else if (sortBy === 'endingSoon') {
      polls = polls
        .filter(poll => poll.endsAt && poll.endsAt > new Date())
        .sort((a, b) => a.endsAt!.getTime() - b.endsAt!.getTime());
    }
    
    return Promise.all(
      polls
        .slice(offset, offset + limit)
        .map(poll => this.getPoll(poll.id))
        .filter((poll): poll is PollWithOptions => poll !== undefined)
    );
  }

  async listMyPolls(userId: number, limit: number, offset: number): Promise<PollWithOptions[]> {
    const polls = Array.from(this.polls.values())
      .filter(poll => poll.createdBy === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return Promise.all(
      polls
        .slice(offset, offset + limit)
        .map(poll => this.getPoll(poll.id))
        .filter((poll): poll is PollWithOptions => poll !== undefined)
    );
  }

  async getRandomPolls(limit: number): Promise<PollWithOptions[]> {
    const randomPolls = Array.from(this.polls.values())
      .filter(poll => poll.isRandom && poll.visibility === 'public');
    
    // Shuffle array
    for (let i = randomPolls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [randomPolls[i], randomPolls[j]] = [randomPolls[j], randomPolls[i]];
    }
    
    return Promise.all(
      randomPolls
        .slice(0, limit)
        .map(poll => this.getPoll(poll.id))
        .filter((poll): poll is PollWithOptions => poll !== undefined)
    );
  }

  // Voting methods
  async vote(insertVote: InsertVote): Promise<Vote> {
    const id = this.voteIdCounter++;
    const vote: Vote = {
      ...insertVote,
      id,
      createdAt: new Date()
    };
    
    const pollVotes = this.votes.get(insertVote.pollId) || [];
    
    // If user has already voted and poll doesn't allow multiple choices, remove previous vote
    if (insertVote.userId) {
      const poll = this.polls.get(insertVote.pollId);
      if (poll && !poll.isMultipleChoice) {
        const existingVoteIndex = pollVotes.findIndex(v => v.userId === insertVote.userId);
        if (existingVoteIndex !== -1) {
          pollVotes.splice(existingVoteIndex, 1);
        }
      }
    }
    
    pollVotes.push(vote);
    this.votes.set(insertVote.pollId, pollVotes);
    
    return vote;
  }

  async getUserVote(pollId: number, userId: number): Promise<Vote | undefined> {
    const votes = this.votes.get(pollId) || [];
    return votes.find(vote => vote.userId === userId);
  }

  // Initialize with random polls
  private initializeRandomPolls() {
    const randomPolls = [
      {
        question: "What's your favorite programming language?",
        options: ["JavaScript", "Python", "Java", "TypeScript", "C#", "Go"],
        createdBy: "Sarah Johnson"
      },
      {
        question: "How often do you exercise?",
        options: ["Daily", "2-3 times per week", "Once a week", "Rarely or never"],
        createdBy: "Alex Chen"
      },
      {
        question: "Which movie genre do you prefer?",
        options: ["Action", "Comedy", "Drama", "Sci-Fi", "Horror"],
        createdBy: "Random Poll"
      },
      {
        question: "Do you prefer working from home or in an office?",
        options: ["Working from home", "Working in the office", "Hybrid approach"],
        createdBy: "Michelle Taylor"
      },
      {
        question: "What's your preferred mode of transportation?",
        options: ["Car", "Public transport", "Bicycle", "Walking", "Other"],
        createdBy: "Random Poll"
      },
      {
        question: "Which social media platform do you use most?",
        options: ["Instagram", "Twitter", "Facebook", "TikTok", "LinkedIn", "Other"],
        createdBy: "Jason Lee"
      }
    ];

    // Create random users
    const creators = ["Sarah Johnson", "Alex Chen", "Random Poll", "Michelle Taylor", "Jason Lee"];
    const creatorIds: Record<string, number> = {};
    
    creators.forEach(name => {
      const user: InsertUser = {
        username: name,
        password: "password123", // in a real app, would be hashed
        email: `${name.toLowerCase().replace(/\s/g, '.')}@example.com`
      };
      const createdUser = this.createUser(user);
      creatorIds[name] = this.userIdCounter - 1;
    });

    // Create polls
    randomPolls.forEach(pollData => {
      const creatorId = creatorIds[pollData.createdBy];
      const now = new Date();
      const daysToAdd = Math.floor(Math.random() * 14) + 1;
      const endsAt = new Date(now);
      endsAt.setDate(endsAt.getDate() + daysToAdd);
      
      const poll: InsertPoll = {
        question: pollData.question,
        createdBy: creatorId,
        visibility: "public",
        isMultipleChoice: false,
        isRandom: true,
        endsAt
      };
      
      const createdPoll = this.createPoll(poll, pollData.options);
      
      // Add some random votes
      const pollId = this.pollIdCounter - 1;
      const options = this.pollOptions.get(pollId) || [];
      
      if (options.length > 0) {
        const numVotes = Math.floor(Math.random() * 500) + 50;
        for (let i = 0; i < numVotes; i++) {
          const randomOptionIndex = Math.floor(Math.random() * options.length);
          const optionId = options[randomOptionIndex].id;
          
          this.vote({
            pollId,
            optionId,
            userId: undefined // anonymous vote
          });
        }
      }
    });
  }
}

export const storage = new MemStorage();
