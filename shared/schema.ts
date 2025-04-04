import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  ageGroup: text("ageGroup").notNull(),
  difficultyLevel: text("difficultyLevel").notNull(),
  contentFormat: text("contentFormat").notNull(),
  duration: text("duration").notNull(),
  userId: integer("userId"),
  status: text("status").default("draft"),
  scriptContent: text("scriptContent"),
  learningObjectives: json("learningObjectives").$type(),
  materials: json("materials").$type(),
  visualReferences: json("visualReferences").$type(),
  specificInstructions: text("specificInstructions"),
  videoUrl: text("videoUrl"),
  errorMessage: text("errorMessage"),
  aiModel: text("aiModel"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const insertContentSchema = createInsertSchema(contents).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof contents.$inferSelect;
