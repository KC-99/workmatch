import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { UserAuthForm } from "@/components/user-auth-form";

export default function Login() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [userType, setUserType] = useState<string>("");
  
  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);
  
  const handleSuccess = (userData: any) => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center bg-gray-50 py-12">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Log In to Your Account</h2>
          <UserAuthForm 
            type="login" 
            onSuccess={handleSuccess} 
            userType={userType}
            setUserType={setUserType}
          />
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account? 
              <button 
                type="button" 
                onClick={() => navigate("/register")} 
                className="text-primary hover:text-primary/90 font-medium ml-1"
              >
                Sign up
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
