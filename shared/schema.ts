import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define user schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

// Define poll schema
export const pollVisibilityEnum = pgEnum("poll_visibility", ["public", "private"]);

export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  endsAt: timestamp("ends_at"),
  visibility: text("visibility").notNull().default("public"),
  isMultipleChoice: boolean("is_multiple_choice").default(false).notNull(),
  isRandom: boolean("is_random").default(false).notNull(),
});

export const insertPollSchema = createInsertSchema(polls).pick({
  question: true,
  createdBy: true,
  endsAt: true,
  visibility: true,
  isMultipleChoice: true,
  isRandom: true,
});

// Define poll options schema
export const pollOptions = pgTable("poll_options", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").references(() => polls.id).notNull(),
  text: text("text").notNull(),
});

export const insertPollOptionSchema = createInsertSchema(pollOptions).pick({
  pollId: true,
  text: true,
});

// Define votes schema
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").references(() => polls.id).notNull(),
  optionId: integer("option_id").references(() => pollOptions.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  pollId: true,
  optionId: true,
  userId: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Poll = typeof polls.$inferSelect;
export type InsertPoll = z.infer<typeof insertPollSchema>;

export type PollOption = typeof pollOptions.$inferSelect;
export type InsertPollOption = z.infer<typeof insertPollOptionSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

// Extended types for frontend use
export type PollWithOptions = Poll & {
  options: PollOption[];
  creator?: {
    id: number;
    username: string;
  };
  totalVotes: number;
  userVote?: number;
};

export type PollOptionWithVotes = PollOption & {
  voteCount: number;
  percentage: number;
};

export type PollWithResults = PollWithOptions & {
  results: PollOptionWithVotes[];
};

// Duration type for poll creation
export const durationMap = {
  "1d": 1,
  "3d": 3,
  "1w": 7,
  "2w": 14,
  "1m": 30
};

export const pollDurationSchema = z.enum(["1d", "3d", "1w", "2w", "1m"]);
export type PollDuration = z.infer<typeof pollDurationSchema>;
