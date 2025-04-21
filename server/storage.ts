import { 
  users, type User, type InsertUser,
  workerProfiles, type WorkerProfile, type InsertWorkerProfile,
  employerProfiles, type EmployerProfile, type InsertEmployerProfile,
  jobPostings, type JobPosting, type InsertJobPosting,
  jobApplications, type JobApplication, type InsertJobApplication
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Worker Profile operations
  getWorkerProfile(userId: number): Promise<WorkerProfile | undefined>;
  getAllWorkerProfiles(): Promise<WorkerProfile[]>;
  createWorkerProfile(profile: InsertWorkerProfile): Promise<WorkerProfile>;
  updateWorkerProfile(userId: number, profile: Partial<InsertWorkerProfile>): Promise<WorkerProfile | undefined>;
  
  // Employer Profile operations
  getEmployerProfile(userId: number): Promise<EmployerProfile | undefined>;
  createEmployerProfile(profile: InsertEmployerProfile): Promise<EmployerProfile>;
  updateEmployerProfile(userId: number, profile: Partial<InsertEmployerProfile>): Promise<EmployerProfile | undefined>;
  
  // Job Posting operations
  getJobPosting(id: number): Promise<JobPosting | undefined>;
  getAllJobPostings(): Promise<JobPosting[]>;
  getJobPostingsByEmployer(employerId: number): Promise<JobPosting[]>;
  createJobPosting(posting: InsertJobPosting): Promise<JobPosting>;
  updateJobPosting(id: number, posting: Partial<InsertJobPosting>): Promise<JobPosting | undefined>;
  deleteJobPosting(id: number): Promise<boolean>;
  
  // Job Application operations
  getJobApplication(id: number): Promise<JobApplication | undefined>;
  getJobApplicationsByWorker(workerId: number): Promise<JobApplication[]>;
  getJobApplicationsByJob(jobId: number): Promise<JobApplication[]>;
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  updateJobApplicationStatus(id: number, status: string): Promise<JobApplication | undefined>;
}

// In-memory implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workerProfiles: Map<number, WorkerProfile>;
  private employerProfiles: Map<number, EmployerProfile>;
  private jobPostings: Map<number, JobPosting>;
  private jobApplications: Map<number, JobApplication>;
  
  private userIdCounter: number = 1;
  private workerProfileIdCounter: number = 1;
  private employerProfileIdCounter: number = 1;
  private jobPostingIdCounter: number = 1;
  private jobApplicationIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.workerProfiles = new Map();
    this.employerProfiles = new Map();
    this.jobPostings = new Map();
    this.jobApplications = new Map();
    
    // Add some initial data
    this.initializeSampleData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  // Worker Profile operations
  async getWorkerProfile(userId: number): Promise<WorkerProfile | undefined> {
    return Array.from(this.workerProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async getAllWorkerProfiles(): Promise<WorkerProfile[]> {
    return Array.from(this.workerProfiles.values());
  }

  async createWorkerProfile(profile: InsertWorkerProfile): Promise<WorkerProfile> {
    const id = this.workerProfileIdCounter++;
    const workerProfile: WorkerProfile = { 
      ...profile, 
      id, 
      rating: 0, 
      reviewCount: 0 
    };
    this.workerProfiles.set(id, workerProfile);
    return workerProfile;
  }

  async updateWorkerProfile(userId: number, updates: Partial<InsertWorkerProfile>): Promise<WorkerProfile | undefined> {
    const profile = await this.getWorkerProfile(userId);
    if (!profile) return undefined;

    const updatedProfile: WorkerProfile = { ...profile, ...updates };
    this.workerProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  // Employer Profile operations
  async getEmployerProfile(userId: number): Promise<EmployerProfile | undefined> {
    return Array.from(this.employerProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createEmployerProfile(profile: InsertEmployerProfile): Promise<EmployerProfile> {
    const id = this.employerProfileIdCounter++;
    const employerProfile: EmployerProfile = { ...profile, id };
    this.employerProfiles.set(id, employerProfile);
    return employerProfile;
  }

  async updateEmployerProfile(userId: number, updates: Partial<InsertEmployerProfile>): Promise<EmployerProfile | undefined> {
    const profile = await this.getEmployerProfile(userId);
    if (!profile) return undefined;

    const updatedProfile: EmployerProfile = { ...profile, ...updates };
    this.employerProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  // Job Posting operations
  async getJobPosting(id: number): Promise<JobPosting | undefined> {
    return this.jobPostings.get(id);
  }

  async getAllJobPostings(): Promise<JobPosting[]> {
    return Array.from(this.jobPostings.values());
  }

  async getJobPostingsByEmployer(employerId: number): Promise<JobPosting[]> {
    return Array.from(this.jobPostings.values()).filter(
      (posting) => posting.employerId === employerId
    );
  }

  async createJobPosting(posting: InsertJobPosting): Promise<JobPosting> {
    const id = this.jobPostingIdCounter++;
    const now = new Date();
    const jobPosting: JobPosting = { ...posting, id, createdAt: now };
    this.jobPostings.set(id, jobPosting);
    return jobPosting;
  }

  async updateJobPosting(id: number, updates: Partial<InsertJobPosting>): Promise<JobPosting | undefined> {
    const posting = await this.getJobPosting(id);
    if (!posting) return undefined;

    const updatedPosting: JobPosting = { ...posting, ...updates };
    this.jobPostings.set(id, updatedPosting);
    return updatedPosting;
  }

  async deleteJobPosting(id: number): Promise<boolean> {
    return this.jobPostings.delete(id);
  }

  // Job Application operations
  async getJobApplication(id: number): Promise<JobApplication | undefined> {
    return this.jobApplications.get(id);
  }

  async getJobApplicationsByWorker(workerId: number): Promise<JobApplication[]> {
    return Array.from(this.jobApplications.values()).filter(
      (application) => application.workerId === workerId
    );
  }

  async getJobApplicationsByJob(jobId: number): Promise<JobApplication[]> {
    return Array.from(this.jobApplications.values()).filter(
      (application) => application.jobId === jobId
    );
  }

  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const id = this.jobApplicationIdCounter++;
    const now = new Date();
    const jobApplication: JobApplication = { 
      ...application, 
      id, 
      status: "pending", 
      createdAt: now 
    };
    this.jobApplications.set(id, jobApplication);
    return jobApplication;
  }

  async updateJobApplicationStatus(id: number, status: string): Promise<JobApplication | undefined> {
    const application = await this.getJobApplication(id);
    if (!application) return undefined;

    const updatedApplication: JobApplication = { ...application, status };
    this.jobApplications.set(id, updatedApplication);
    return updatedApplication;
  }

  // Initialize with sample data for demonstration
  private initializeSampleData() {
    // Sample users
    const user1 = this.createUser({
      username: "worker1",
      password: "password",
      email: "worker1@example.com",
      name: "Sarah Johnson",
      userType: "worker"
    });

    const user2 = this.createUser({
      username: "worker2",
      password: "password",
      email: "worker2@example.com",
      name: "Michael Chen",
      userType: "worker"
    });

    const user3 = this.createUser({
      username: "worker3",
      password: "password",
      email: "worker3@example.com",
      name: "Emily Rodriguez",
      userType: "worker"
    });

    const user4 = this.createUser({
      username: "worker4",
      password: "password",
      email: "worker4@example.com",
      name: "James Wilson",
      userType: "worker"
    });

    const employer1 = this.createUser({
      username: "employer1",
      password: "password",
      email: "employer1@example.com",
      name: "TechSolutions Inc.",
      userType: "employer"
    });

    const employer2 = this.createUser({
      username: "employer2",
      password: "password",
      email: "employer2@example.com",
      name: "Creative Studios",
      userType: "employer"
    });

    const employer3 = this.createUser({
      username: "employer3",
      password: "password",
      email: "employer3@example.com",
      name: "Future Technologies",
      userType: "employer"
    });

    const employer4 = this.createUser({
      username: "employer4",
      password: "password",
      email: "employer4@example.com",
      name: "Global Brands",
      userType: "employer"
    });

    // Sample worker profiles
    this.createWorkerProfile({
      userId: 1,
      title: "Graphic Designer",
      skills: ["Adobe Photoshop", "Illustrator", "UI/UX"],
      experience: "7 years of experience in graphic design and UI/UX",
      hourlyRate: 35,
      availability: "Immediate",
      location: "New York, NY",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80"
    }).then(profile => {
      this.workerProfiles.set(profile.id, { ...profile, rating: 4.8, reviewCount: 24 });
    });

    this.createWorkerProfile({
      userId: 2,
      title: "Web Developer",
      skills: ["React", "Node.js", "MongoDB"],
      experience: "5 years of full-stack development experience",
      hourlyRate: 45,
      availability: "2 weeks",
      location: "San Francisco, CA",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80"
    }).then(profile => {
      this.workerProfiles.set(profile.id, { ...profile, rating: 4.9, reviewCount: 31 });
    });

    this.createWorkerProfile({
      userId: 3,
      title: "Content Writer",
      skills: ["SEO", "Blogging", "Copywriting"],
      experience: "4 years of content creation for tech companies",
      hourlyRate: 28,
      availability: "Immediate",
      location: "Chicago, IL",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80"
    }).then(profile => {
      this.workerProfiles.set(profile.id, { ...profile, rating: 4.6, reviewCount: 17 });
    });

    this.createWorkerProfile({
      userId: 4,
      title: "Data Analyst",
      skills: ["Python", "SQL", "Tableau"],
      experience: "6 years in data analysis and visualization",
      hourlyRate: 40,
      availability: "1 week",
      location: "Austin, TX",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80"
    }).then(profile => {
      this.workerProfiles.set(profile.id, { ...profile, rating: 4.7, reviewCount: 22 });
    });

    // Sample employer profiles
    this.createEmployerProfile({
      userId: 5,
      companyName: "TechSolutions Inc.",
      companySize: "51-200",
      industry: "Technology",
      companyDescription: "Leading provider of innovative software solutions",
      location: "Remote"
    });

    this.createEmployerProfile({
      userId: 6,
      companyName: "Creative Studios",
      companySize: "11-50",
      industry: "Design",
      companyDescription: "Award-winning design agency",
      location: "New York, NY"
    });

    this.createEmployerProfile({
      userId: 7,
      companyName: "Future Technologies",
      companySize: "11-50",
      industry: "Technology",
      companyDescription: "Emerging tech company focused on innovation",
      location: "Remote"
    });

    this.createEmployerProfile({
      userId: 8,
      companyName: "Global Brands",
      companySize: "201-500",
      industry: "Marketing",
      companyDescription: "International marketing and branding company",
      location: "Chicago, IL"
    });

    // Sample job postings
    this.createJobPosting({
      employerId: 5,
      title: "Front-end Developer Needed",
      company: "TechSolutions Inc.",
      location: "Remote",
      rate: "$40-50/hr",
      type: "Contract",
      duration: "3 months",
      skills: ["JavaScript", "React", "CSS"],
      description: "Looking for an experienced front-end developer to help build a new web application. The ideal candidate should have strong expertise in React and modern CSS frameworks."
    });

    this.createJobPosting({
      employerId: 6,
      title: "Graphic Designer for Brand Refresh",
      company: "Creative Studios",
      location: "New York, NY",
      rate: "$35-45/hr",
      type: "Part-time",
      duration: "2 months",
      skills: ["Adobe Creative Suite", "Branding", "Typography"],
      description: "Our agency is seeking a talented graphic designer to assist with a complete brand refresh for one of our major clients. Must have strong typography skills and branding experience."
    });

    this.createJobPosting({
      employerId: 7,
      title: "Content Writer for Tech Blog",
      company: "Future Technologies",
      location: "Remote",
      rate: "$25-35/hr",
      type: "Freelance",
      duration: "Ongoing",
      skills: ["SEO Writing", "Technical Knowledge", "Research"],
      description: "We need a skilled content writer who can produce engaging articles about emerging technologies. The ideal candidate should have SEO knowledge and be able to explain complex technical concepts in an accessible way."
    });

    this.createJobPosting({
      employerId: 8,
      title: "Social Media Manager",
      company: "Global Brands",
      location: "Chicago, IL",
      rate: "$30-40/hr",
      type: "Full-time",
      duration: "Permanent",
      skills: ["Social Media Strategy", "Content Creation", "Analytics"],
      description: "Seeking an experienced social media manager to oversee our brand presence across multiple platforms. Responsibilities include content creation, community management, and performance analysis."
    });
  }
}

export const storage = new MemStorage();
