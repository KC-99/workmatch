import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table and types
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  userType: text("user_type").notNull(), // "worker" or "employer"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  userType: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Worker Profile table and types
export const workerProfiles = pgTable("worker_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  skills: text("skills").array().notNull(),
  experience: text("experience"),
  hourlyRate: integer("hourly_rate").notNull(),
  availability: text("availability").notNull(),
  location: text("location"),
  image: text("image"),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
});

export const insertWorkerProfileSchema = createInsertSchema(workerProfiles).pick({
  userId: true,
  title: true,
  skills: true,
  experience: true,
  hourlyRate: true,
  availability: true,
  location: true,
  image: true,
});

export type InsertWorkerProfile = z.infer<typeof insertWorkerProfileSchema>;
export type WorkerProfile = typeof workerProfiles.$inferSelect;

// Employer Profile table and types
export const employerProfiles = pgTable("employer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  companyName: text("company_name").notNull(),
  companySize: text("company_size"),
  industry: text("industry").notNull(),
  companyDescription: text("company_description"),
  location: text("location"),
});

export const insertEmployerProfileSchema = createInsertSchema(employerProfiles).pick({
  userId: true,
  companyName: true,
  companySize: true,
  industry: true,
  companyDescription: true,
  location: true,
});

export type InsertEmployerProfile = z.infer<typeof insertEmployerProfileSchema>;
export type EmployerProfile = typeof employerProfiles.$inferSelect;

// Job Posting table and types
export const jobPostings = pgTable("job_postings", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  rate: text("rate").notNull(),
  type: text("type").notNull(), // "Full-time", "Part-time", "Contract", etc.
  duration: text("duration"),
  skills: text("skills").array().notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJobPostingSchema = createInsertSchema(jobPostings).pick({
  employerId: true,
  title: true,
  company: true,
  location: true,
  rate: true,
  type: true,
  duration: true,
  skills: true,
  description: true,
});

export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;
export type JobPosting = typeof jobPostings.$inferSelect;

// Job Application table and types
export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobPostings.id),
  workerId: integer("worker_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"), // "pending", "accepted", "rejected"
  coverLetter: text("cover_letter"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).pick({
  jobId: true,
  workerId: true,
  coverLetter: true,
});

export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
