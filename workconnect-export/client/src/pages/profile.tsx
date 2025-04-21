import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployerProfileForm, WorkerProfileForm } from "@/components/profile-form";
import { WorkerProfile, EmployerProfile } from "@/lib/types";
import { UserIcon } from "lucide-react";

export default function Profile() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  // Get worker profile
  const { data: workerProfile, isLoading: workerLoading } = useQuery<WorkerProfile>({
    queryKey: ['/api/profiles/worker'],
    enabled: isAuthenticated && user?.userType === "worker",
    onError: () => {
      navigate("/profile-setup");
    }
  });
  
  // Get employer profile
  const { data: employerProfile, isLoading: employerLoading } = useQuery<EmployerProfile>({
    queryKey: ['/api/profiles/employer'],
    enabled: isAuthenticated && user?.userType === "employer",
    onError: () => {
      navigate("/profile-setup");
    }
  });
  
  if (!user) return null;
  
  const isLoading = (user.userType === "worker" && workerLoading) || 
                    (user.userType === "employer" && employerLoading);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-600 mt-1">Manage your profile information</p>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="mt-1 text-sm text-gray-900">{user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Username</p>
                <p className="mt-1 text-sm text-gray-900">{user.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Account Type</p>
                <p className="mt-1 text-sm text-gray-900">{user.userType === "worker" ? "Worker" : "Employer"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{user.userType === "worker" ? "Worker Profile" : "Employer Profile"}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : user.userType === "worker" && workerProfile ? (
              <WorkerProfileForm existingProfile={workerProfile} />
            ) : user.userType === "employer" && employerProfile ? (
              <EmployerProfileForm existingProfile={employerProfile} />
            ) : (
              <div className="text-center py-12">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No profile found</h3>
                <p className="mt-1 text-sm text-gray-500">Let's create your profile now.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
