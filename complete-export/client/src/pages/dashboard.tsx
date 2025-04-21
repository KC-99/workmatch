import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobCard } from "@/components/job-card";
import { WorkerCard } from "@/components/worker-card";
import { JobDetailDialog } from "@/components/job-detail-dialog";
import { WorkerDetailDialog } from "@/components/worker-detail-dialog";
import { PostJobDialog } from "@/components/post-job-dialog";
import { JobPosting, WorkerProfile, EmployerProfile } from "@/lib/types";
import { SearchIcon, Briefcase, PlusIcon } from "lucide-react";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  // Check if profile exists
  const { data: workerProfile } = useQuery<WorkerProfile>({
    queryKey: ['/api/profiles/worker'],
    enabled: isAuthenticated && user?.userType === "worker",
    onError: () => {
      navigate("/profile-setup");
    }
  });
  
  const { data: employerProfile } = useQuery<EmployerProfile>({
    queryKey: ['/api/profiles/employer'],
    enabled: isAuthenticated && user?.userType === "employer",
    onError: () => {
      navigate("/profile-setup");
    }
  });
  
  // Get all jobs
  const { data: jobs = [], isLoading: jobsLoading } = useQuery<JobPosting[]>({
    queryKey: ['/api/jobs'],
    enabled: isAuthenticated && user?.userType === "worker",
  });
  
  // Get all workers
  const { data: workers = [], isLoading: workersLoading } = useQuery<WorkerProfile[]>({
    queryKey: ['/api/profiles/workers'],
    enabled: isAuthenticated && user?.userType === "employer",
  });
  
  const handleViewJobDetails = (job: JobPosting) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };
  
  const handleViewWorkerProfile = (worker: WorkerProfile) => {
    setSelectedWorker(worker);
    setShowWorkerModal(true);
  };
  
  const filteredJobs = jobs.filter(job => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      job.title.toLowerCase().includes(term) ||
      job.company.toLowerCase().includes(term) ||
      job.skills.some(skill => skill.toLowerCase().includes(term))
    );
  });
  
  const filteredWorkers = workers.filter(worker => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      worker.title.toLowerCase().includes(term) ||
      worker.skills.some(skill => skill.toLowerCase().includes(term))
    );
  });
  
  if (!user) return null;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Worker Dashboard */}
      {user.userType === "worker" && (
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Available Jobs</h1>
            
            <div className="mt-4 md:mt-0">
              <div className="relative rounded-md shadow-sm max-w-xs">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search jobs..."
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          
          {jobsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Job Listings */}
              {filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredJobs.map((job) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      onViewDetails={handleViewJobDetails}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-8 text-center py-12 bg-white rounded-lg border border-gray-200">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No jobs found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? "Try adjusting your search or check back later for new opportunities." : "Check back later for new job opportunities."}
                  </p>
                </div>
              )}
              
              {/* Job Detail Modal */}
              <JobDetailDialog
                job={selectedJob}
                isOpen={showJobModal}
                onClose={() => setShowJobModal(false)}
              />
            </>
          )}
        </div>
      )}
      
      {/* Employer Dashboard */}
      {user.userType === "employer" && (
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Available Workers</h1>
            
            <div className="mt-4 md:mt-0 flex space-x-4">
              <div className="relative rounded-md shadow-sm">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search workers..."
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowPostJobModal(true)}
              >
                <PlusIcon className="mr-2 h-5 w-5" />
                Post a Job
              </Button>
            </div>
          </div>
          
          {workersLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Worker Listings */}
              {filteredWorkers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredWorkers.map((worker) => (
                    <WorkerCard
                      key={worker.id}
                      worker={worker}
                      onViewProfile={handleViewWorkerProfile}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-8 text-center py-12 bg-white rounded-lg border border-gray-200">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No workers found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? "Try adjusting your search criteria to find available workers." : "Currently no workers are available. Check back soon."}
                  </p>
                </div>
              )}
              
              {/* Worker Detail Modal */}
              <WorkerDetailDialog
                worker={selectedWorker}
                isOpen={showWorkerModal}
                onClose={() => setShowWorkerModal(false)}
              />
              
              {/* Post Job Modal */}
              <PostJobDialog
                isOpen={showPostJobModal}
                onClose={() => setShowPostJobModal(false)}
                companyName={employerProfile?.companyName}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
