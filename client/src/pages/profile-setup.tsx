import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { WorkerProfileForm, EmployerProfileForm } from "@/components/profile-form";
import { WorkerProfile, EmployerProfile } from "@/lib/types";

export default function ProfileSetup() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [profileExists, setProfileExists] = useState(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  // Check if worker profile exists
  const { data: workerProfile, isLoading: workerLoading } = useQuery<WorkerProfile>({
    queryKey: ['/api/profiles/worker'],
    enabled: isAuthenticated && user?.userType === "worker",
    onSuccess: (data) => {
      if (data) {
        setProfileExists(true);
        navigate("/dashboard");
      }
    },
  });
  
  // Check if employer profile exists
  const { data: employerProfile, isLoading: employerLoading } = useQuery<EmployerProfile>({
    queryKey: ['/api/profiles/employer'],
    enabled: isAuthenticated && user?.userType === "employer",
    onSuccess: (data) => {
      if (data) {
        setProfileExists(true);
        navigate("/dashboard");
      }
    },
  });
  
  const handleSetupComplete = () => {
    navigate("/dashboard");
  };
  
  if (!user) return null;
  
  const isLoading = (user.userType === "worker" && workerLoading) || 
                    (user.userType === "employer" && employerLoading);
  
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center bg-gray-50 py-12">
      <Card className="w-full max-w-2xl mx-4">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {user.userType === "worker" && (
                <WorkerProfileForm 
                  existingProfile={workerProfile}
                  onSetupComplete={handleSetupComplete}
                />
              )}
              
              {user.userType === "employer" && (
                <EmployerProfileForm 
                  existingProfile={employerProfile}
                  onSetupComplete={handleSetupComplete}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
