import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertWorkerProfileSchema,
  insertEmployerProfileSchema,
  insertJobPostingSchema,
  insertJobApplicationSchema
} from "@shared/schema";
import { z } from "zod";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Extend Express Request type to include session
declare module "express-session" {
  interface SessionData {
    userId: number;
    userType: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // AUTH ROUTES
  
  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Set session
      if (req.session) {
        req.session.userId = user.id;
        req.session.userType = user.userType;
      }
      
      res.status(201).json({ 
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        userType: user.userType 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      if (req.session) {
        req.session.userId = user.id;
        req.session.userType = user.userType;
      }
      
      res.json({ 
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        userType: user.userType 
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        userType: user.userType 
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // PROFILE ROUTES
  
  // Create worker profile
  app.post("/api/profiles/worker", isAuthenticated, async (req, res) => {
    try {
      if (req.session?.userType !== "worker") {
        return res.status(403).json({ message: "Only workers can create worker profiles" });
      }
      
      // Check if profile already exists
      const existingProfile = await storage.getWorkerProfile(req.session.userId);
      if (existingProfile) {
        return res.status(400).json({ message: "Worker profile already exists" });
      }
      
      const profileData = insertWorkerProfileSchema
        .omit({ userId: true })
        .parse(req.body);
        
      const profile = await storage.createWorkerProfile({
        ...profileData,
        userId: req.session.userId
      });
      
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  // Get worker profile
  app.get("/api/profiles/worker/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const profile = await storage.getWorkerProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Worker profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get current worker profile
  app.get("/api/profiles/worker", isAuthenticated, async (req, res) => {
    try {
      const profile = await storage.getWorkerProfile(req.session!.userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Worker profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Update worker profile
  app.patch("/api/profiles/worker", isAuthenticated, async (req, res) => {
    try {
      if (req.session?.userType !== "worker") {
        return res.status(403).json({ message: "Only workers can update worker profiles" });
      }
      
      const profileData = insertWorkerProfileSchema
        .omit({ userId: true })
        .partial()
        .parse(req.body);
        
      const updatedProfile = await storage.updateWorkerProfile(req.session.userId, profileData);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "Worker profile not found" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  // Get all worker profiles
  app.get("/api/profiles/workers", async (req, res) => {
    try {
      const profiles = await storage.getAllWorkerProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Create employer profile
  app.post("/api/profiles/employer", isAuthenticated, async (req, res) => {
    try {
      if (req.session?.userType !== "employer") {
        return res.status(403).json({ message: "Only employers can create employer profiles" });
      }
      
      // Check if profile already exists
      const existingProfile = await storage.getEmployerProfile(req.session.userId);
      if (existingProfile) {
        return res.status(400).json({ message: "Employer profile already exists" });
      }
      
      const profileData = insertEmployerProfileSchema
        .omit({ userId: true })
        .parse(req.body);
        
      const profile = await storage.createEmployerProfile({
        ...profileData,
        userId: req.session.userId
      });
      
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  // Get employer profile
  app.get("/api/profiles/employer/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const profile = await storage.getEmployerProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Employer profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get current employer profile
  app.get("/api/profiles/employer", isAuthenticated, async (req, res) => {
    try {
      const profile = await storage.getEmployerProfile(req.session!.userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Employer profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Update employer profile
  app.patch("/api/profiles/employer", isAuthenticated, async (req, res) => {
    try {
      if (req.session?.userType !== "employer") {
        return res.status(403).json({ message: "Only employers can update employer profiles" });
      }
      
      const profileData = insertEmployerProfileSchema
        .omit({ userId: true })
        .partial()
        .parse(req.body);
        
      const updatedProfile = await storage.updateEmployerProfile(req.session.userId, profileData);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "Employer profile not found" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  // JOB POSTING ROUTES
  
  // Create job posting
  app.post("/api/jobs", isAuthenticated, async (req, res) => {
    try {
      if (req.session?.userType !== "employer") {
        return res.status(403).json({ message: "Only employers can create job postings" });
      }
      
      const jobData = insertJobPostingSchema
        .omit({ employerId: true })
        .parse(req.body);
        
      const job = await storage.createJobPosting({
        ...jobData,
        employerId: req.session.userId
      });
      
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  // Get all job postings
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllJobPostings();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get job posting by ID
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const job = await storage.getJobPosting(id);
      
      if (!job) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get job postings by employer
  app.get("/api/jobs/employer/:employerId", async (req, res) => {
    try {
      const employerId = parseInt(req.params.employerId);
      
      if (isNaN(employerId)) {
        return res.status(400).json({ message: "Invalid employer ID" });
      }
      
      const jobs = await storage.getJobPostingsByEmployer(employerId);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get current employer's job postings
  app.get("/api/jobs/my-postings", isAuthenticated, async (req, res) => {
    try {
      if (req.session?.userType !== "employer") {
        return res.status(403).json({ message: "Only employers can access their job postings" });
      }
      
      const jobs = await storage.getJobPostingsByEmployer(req.session.userId);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Update job posting
  app.patch("/api/jobs/:id", isAuthenticated, async (req, res) => {
    try {
      if (req.session?.userType !== "employer") {
        return res.status(403).json({ message: "Only employers can update job postings" });
      }
      
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      // Check if job posting exists and belongs to this employer
      const existingJob = await storage.getJobPosting(id);
      
      if (!existingJob) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      if (existingJob.employerId !== req.session.userId) {
        return res.status(403).json({ message: "You do not have permission to update this job posting" });
      }
      
      const jobData = insertJobPostingSchema
        .omit({ employerId: true })
        .partial()
        .parse(req.body);
        
      const updatedJob = await storage.updateJobPosting(id, jobData);
      
      if (!updatedJob) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      res.json(updatedJob);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  // Delete job posting
  app.delete("/api/jobs/:id", isAuthenticated, async (req, res) => {
    try {
      if (req.session?.userType !== "employer") {
        return res.status(403).json({ message: "Only employers can delete job postings" });
      }
      
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      // Check if job posting exists and belongs to this employer
      const existingJob = await storage.getJobPosting(id);
      
      if (!existingJob) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      if (existingJob.employerId !== req.session.userId) {
        return res.status(403).json({ message: "You do not have permission to delete this job posting" });
      }
      
      const success = await storage.deleteJobPosting(id);
      
      if (!success) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      res.json({ message: "Job posting deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // JOB APPLICATION ROUTES
  
  // Create job application
  app.post("/api/applications", isAuthenticated, async (req, res) => {
    try {
      if (req.session?.userType !== "worker") {
        return res.status(403).json({ message: "Only workers can apply to jobs" });
      }
      
      const applicationData = insertJobApplicationSchema
        .omit({ workerId: true })
        .parse(req.body);
        
      // Check if job exists
      const job = await storage.getJobPosting(applicationData.jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      // Check if already applied
      const existingApplications = await storage.getJobApplicationsByWorker(req.session.userId);
      const alreadyApplied = existingApplications.some(app => app.jobId === applicationData.jobId);
      
      if (alreadyApplied) {
        return res.status(400).json({ message: "You have already applied to this job" });
      }
      
      const application = await storage.createJobApplication({
        ...applicationData,
        workerId: req.session.userId
      });
      
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  // Get applications for a job
  app.get("/api/applications/job/:jobId", isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      // Check if job exists and belongs to this employer
      const job = await storage.getJobPosting(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      if (req.session?.userType === "employer" && job.employerId !== req.session.userId) {
        return res.status(403).json({ message: "You do not have permission to view these applications" });
      }
      
      const applications = await storage.getJobApplicationsByJob(jobId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get applications by worker
  app.get("/api/applications/worker", isAuthenticated, async (req, res) => {
    try {
      if (req.session?.userType !== "worker") {
        return res.status(403).json({ message: "Only workers can view their applications" });
      }
      
      const applications = await storage.getJobApplicationsByWorker(req.session.userId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Update application status
  app.patch("/api/applications/:id/status", isAuthenticated, async (req, res) => {
    try {
      if (req.session?.userType !== "employer") {
        return res.status(403).json({ message: "Only employers can update application status" });
      }
      
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid application ID" });
      }
      
      const { status } = req.body;
      
      if (!status || !["pending", "accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Check if application exists and the job belongs to this employer
      const application = await storage.getJobApplication(id);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      const job = await storage.getJobPosting(application.jobId);
      
      if (!job || job.employerId !== req.session.userId) {
        return res.status(403).json({ message: "You do not have permission to update this application" });
      }
      
      const updatedApplication = await storage.updateJobApplicationStatus(id, status);
      
      if (!updatedApplication) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json(updatedApplication);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
