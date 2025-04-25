import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertPollSchema, insertVoteSchema, insertCommentSchema
} from "@shared/schema";
import express from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { z } from "zod";
import { ZodError } from "zod-validation-error";

declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Configure session middleware
  const MemoryStoreSession = MemoryStore(session);
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // 24 hours
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "pollpulse-secret-key",
    })
  );
  
  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };
  
  // API routes
  // Authentication
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.json(null);
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.json(null);
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  // Polls
  app.post("/api/polls", requireAuth, async (req, res) => {
    try {
      const pollData = {
        ...req.body,
        user_id: req.session.userId,
      };
      
      const validatedData = insertPollSchema.parse(pollData);
      const poll = await storage.createPoll(validatedData);
      
      res.status(201).json(poll);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/polls/trending", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const polls = await storage.getTrendingPolls(limit);
      res.json(polls);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/polls/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const polls = await storage.getRecentPolls(limit);
      res.json(polls);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/polls/random", async (req, res) => {
    try {
      const poll = await storage.getRandomPoll();
      if (!poll) {
        return res.status(404).json({ message: "No polls available" });
      }
      res.json(poll);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/polls/user", requireAuth, async (req, res) => {
    try {
      const polls = await storage.getUserPolls(req.session.userId!);
      res.json(polls);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/polls/:id", async (req, res) => {
    try {
      const pollId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      const poll = await storage.getPollWithVotes(pollId, userId);
      if (!poll) {
        return res.status(404).json({ message: "Poll not found" });
      }
      
      res.json(poll);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Votes
  app.post("/api/votes", async (req, res) => {
    try {
      const voteData = {
        ...req.body,
        user_id: req.session.userId,
      };
      
      const { poll_id, option_index } = insertVoteSchema.parse(voteData);
      
      // Check if the poll exists
      const poll = await storage.getPoll(poll_id);
      if (!poll) {
        return res.status(404).json({ message: "Poll not found" });
      }
      
      // Check if the option exists
      if (option_index < 0 || option_index >= (poll.options as string[]).length) {
        return res.status(400).json({ message: "Invalid option index" });
      }
      
      // If the user is logged in, check if they already voted
      if (req.session.userId) {
        const existingVote = await storage.getUserVoteForPoll(req.session.userId, poll_id);
        if (existingVote && !poll.allow_multiple) {
          return res.status(400).json({ message: "You have already voted on this poll" });
        }
      }
      
      // Create vote
      const vote = await storage.createVote({ poll_id, user_id: req.session.userId, option_index });
      
      // Return updated poll with votes
      const updatedPoll = await storage.getPollWithVotes(poll_id, req.session.userId);
      res.status(201).json(updatedPoll);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Comments
  app.post("/api/comments", requireAuth, async (req, res) => {
    try {
      const commentData = {
        ...req.body,
        user_id: req.session.userId,
      };
      
      const validatedData = insertCommentSchema.parse(commentData);
      
      // Check if the poll exists and allows comments
      const poll = await storage.getPoll(validatedData.poll_id);
      if (!poll) {
        return res.status(404).json({ message: "Poll not found" });
      }
      
      if (!poll.allow_comments) {
        return res.status(400).json({ message: "This poll does not allow comments" });
      }
      
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/comments/:pollId", async (req, res) => {
    try {
      const pollId = parseInt(req.params.pollId);
      const comments = await storage.getCommentsForPoll(pollId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Stats
  app.get("/api/stats/user", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.session.userId!);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/stats/overall", async (req, res) => {
    try {
      const stats = await storage.getOverallStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  return httpServer;
}
