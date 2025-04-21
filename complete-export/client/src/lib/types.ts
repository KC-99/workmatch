export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  userType: string;
}

export interface WorkerProfile {
  id: number;
  userId: number;
  title: string;
  skills: string[];
  experience?: string;
  hourlyRate: number;
  availability: string;
  location?: string;
  image?: string;
  rating: number;
  reviewCount: number;
}

export interface EmployerProfile {
  id: number;
  userId: number;
  companyName: string;
  companySize?: string;
  industry: string;
  companyDescription?: string;
  location?: string;
}

export interface JobPosting {
  id: number;
  employerId: number;
  title: string;
  company: string;
  location: string;
  rate: string;
  type: string;
  duration?: string;
  skills: string[];
  description: string;
  createdAt: string;
}

export interface JobApplication {
  id: number;
  jobId: number;
  workerId: number;
  status: string;
  coverLetter?: string;
  createdAt: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  userType: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface WorkerProfileFormData {
  title: string;
  skills: string[];
  experience?: string;
  hourlyRate: number;
  availability: string;
  location?: string;
  image?: string;
}

export interface EmployerProfileFormData {
  companyName: string;
  companySize?: string;
  industry: string;
  companyDescription?: string;
  location?: string;
}

export interface JobPostingFormData {
  title: string;
  company: string;
  location: string;
  rate: string;
  type: string;
  duration?: string;
  skills: string[];
  description: string;
}

export interface JobApplicationFormData {
  jobId: number;
  coverLetter?: string;
}
