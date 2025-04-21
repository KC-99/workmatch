import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { BriefcaseIcon, Dock, LayersIcon } from "lucide-react";

export default function Landing() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const handleGetStarted = (type: string) => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      localStorage.setItem("userType", type);
      navigate("/register");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-center max-w-4xl mx-auto my-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Connect with Jobs or Find Workers on WorkConnect</h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-10">The easiest way to find work or hire skilled professionals for your projects.</p>
        
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 flex flex-col items-center text-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <BriefcaseIcon className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">I need work</h2>
            <p className="text-gray-600 mb-6">Create a profile, showcase your skills, and find jobs that match your expertise.</p>
            <Button 
              onClick={() => handleGetStarted("worker")} 
              className="w-full"
            >
              Find Work
            </Button>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 flex flex-col items-center text-center">
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <Dock className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">I need a worker</h2>
            <p className="text-gray-600 mb-6">Post jobs, review applicants, and hire the perfect professional for your needs.</p>
            <Button 
              onClick={() => handleGetStarted("employer")} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Hire Talent
            </Button>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 w-full py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-center mb-4">
                <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary text-xl font-semibold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">Create Your Profile</h3>
              <p className="text-gray-600 text-center">Sign up and create a detailed profile highlighting your skills or company needs.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-center mb-4">
                <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary text-xl font-semibold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">Connect</h3>
              <p className="text-gray-600 text-center">Browse job listings or available workers and find the perfect match.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-center mb-4">
                <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary text-xl font-semibold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">Work Together</h3>
              <p className="text-gray-600 text-center">Collaborate securely through our platform and build your reputation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
