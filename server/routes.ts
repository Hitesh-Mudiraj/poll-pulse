import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPollSchema, insertVoteSchema, durationMap } from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

// Create session store
const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "pollwave-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 86400000 }, // 1 day
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Incorrect email." });
          }
          if (user.password !== password) { // In production, use proper password hashing
            return done(null, false, { message: "Incorrect password." });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Create user
      const user = await storage.createUser(userData);
      
      // Auto login
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        return res.status(201).json({ user: { id: user.id, username: user.username, email: user.email } });
      });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid request" });
    }
  });

  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    const user = req.user as any;
    res.json({ user: { id: user.id, username: user.username, email: user.email } });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = req.user as any;
    res.json({ user: { id: user.id, username: user.username, email: user.email } });
  });

  // Poll routes
  app.post("/api/polls", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { question, options, duration, visibility, isMultipleChoice } = req.body;
      
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ message: "A poll must have at least 2 options" });
      }

      // Calculate end date based on duration
      const now = new Date();
      const durationDays = durationMap[duration as keyof typeof durationMap] || 7;
      const endsAt = new Date(now);
      endsAt.setDate(endsAt.getDate() + durationDays);

      const pollData = insertPollSchema.parse({
        question,
        createdBy: user.id,
        endsAt,
        visibility,
        isMultipleChoice: Boolean(isMultipleChoice),
        isRandom: false
      });

      const poll = await storage.createPoll(pollData, options);
      const pollWithOptions = await storage.getPoll(poll.id);

      res.status(201).json(pollWithOptions);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid request" });
    }
  });

  app.get("/api/polls", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      const offset = parseInt(req.query.offset as string) || 0;
      const sortBy = req.query.sortBy as string || "newest";

      const polls = await storage.listPolls(limit, offset, sortBy);
      res.json({ polls });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Server error" });
    }
  });

  app.get("/api/polls/random", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const polls = await storage.getRandomPolls(limit);
      res.json({ polls });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Server error" });
    }
  });

  app.get("/api/polls/my", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const limit = parseInt(req.query.limit as string) || 6;
      const offset = parseInt(req.query.offset as string) || 0;

      const polls = await storage.listMyPolls(user.id, limit, offset);
      res.json({ polls });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Server error" });
    }
  });

  app.get("/api/polls/:id", async (req, res) => {
    try {
      const pollId = parseInt(req.params.id);
      const userId = req.user ? (req.user as any).id : undefined;
      
      const poll = await storage.getPollResults(pollId, userId);
      if (!poll) {
        return res.status(404).json({ message: "Poll not found" });
      }

      res.json({ poll });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Server error" });
    }
  });

  app.post("/api/polls/:id/vote", async (req, res) => {
    try {
      const pollId = parseInt(req.params.id);
      const { optionId } = req.body;
      const userId = req.user ? (req.user as any).id : undefined;

      // Validate that the poll and option exist
      const poll = await storage.getPoll(pollId);
      if (!poll) {
        return res.status(404).json({ message: "Poll not found" });
      }

      const optionExists = poll.options.some(option => option.id === parseInt(optionId));
      if (!optionExists) {
        return res.status(400).json({ message: "Option not found" });
      }

      // Check if poll has ended
      if (poll.endsAt && new Date(poll.endsAt) < new Date()) {
        return res.status(400).json({ message: "This poll has ended" });
      }

      // Check if user has already voted on this poll
      if (userId && !poll.isMultipleChoice) {
        const existingVote = await storage.getUserVote(pollId, userId);
        if (existingVote) {
          return res.status(400).json({ message: "You have already voted on this poll" });
        }
      }

      const voteData = insertVoteSchema.parse({
        pollId,
        optionId: parseInt(optionId),
        userId
      });

      await storage.vote(voteData);
      const updatedPoll = await storage.getPollResults(pollId, userId);

      res.json({ poll: updatedPoll });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid request" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
