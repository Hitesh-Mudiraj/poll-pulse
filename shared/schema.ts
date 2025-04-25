import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name"),
  created_at: timestamp("created_at").defaultNow(),
});

export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  user_id: integer("user_id").references(() => users.id),
  category: text("category").notNull(),
  options: jsonb("options").notNull(),
  allow_multiple: boolean("allow_multiple").default(false),
  allow_comments: boolean("allow_comments").default(false),
  end_date: timestamp("end_date"),
  created_at: timestamp("created_at").defaultNow(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  poll_id: integer("poll_id").references(() => polls.id).notNull(),
  user_id: integer("user_id").references(() => users.id),
  option_index: integer("option_index").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  poll_id: integer("poll_id").references(() => polls.id).notNull(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
});

export const insertPollSchema = createInsertSchema(polls).pick({
  title: true,
  user_id: true,
  category: true,
  options: true,
  allow_multiple: true,
  allow_comments: true,
  end_date: true,
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  poll_id: true,
  user_id: true,
  option_index: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  poll_id: true,
  user_id: true,
  content: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Poll = typeof polls.$inferSelect;
export type InsertPoll = z.infer<typeof insertPollSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

// Custom types
export type PollWithVotes = Poll & {
  totalVotes: number;
  voteResults: { [key: number]: number };
  userVote?: number | null;
};

export type UserStats = {
  totalPolls: number;
  totalVotes: number;
  categoriesVoted: { [key: string]: number };
  recentActivity: {
    type: 'created' | 'voted' | 'shared';
    pollId: number;
    pollTitle: string;
    timestamp: Date;
  }[];
};
