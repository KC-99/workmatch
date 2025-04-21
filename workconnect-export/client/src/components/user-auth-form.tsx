import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RegisterFormData, LoginFormData } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  name: z.string().min(2, "Full name must be at least 2 characters"),
  userType: z.string().refine(val => ["worker", "employer"].includes(val), "Please select a user type"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

interface UserAuthFormProps {
  type: "register" | "login";
  onSuccess: (data: any) => void;
  userType?: string;
  setUserType?: (type: string) => void;
}

export function UserAuthForm({ type, onSuccess, userType, setUserType }: UserAuthFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      userType: userType || "",
    },
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  React.useEffect(() => {
    if (userType && type === "register") {
      registerForm.setValue("userType", userType);
    }
  }, [userType, registerForm, type]);

  async function onRegister(data: RegisterFormData) {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/register", data);
      const userData = await response.json();
      toast({
        title: "Account created successfully",
        description: "Your account has been created successfully.",
      });
      onSuccess(userData);
    } catch (error) {
      toast({
        title: "Error creating account",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onLogin(data: LoginFormData) {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", data);
      const userData = await response.json();
      toast({
        title: "Logged in successfully",
        description: "Welcome back!",
      });
      onSuccess(userData);
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (type === "register") {
    return (
      <Form {...registerForm}>
        <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <span className="text-sm font-medium text-gray-700">I am a:</span>
              <Button 
                type="button"
                variant={userType === "worker" ? "default" : "outline"}
                onClick={() => setUserType && setUserType("worker")}
                className="px-4 py-2 rounded-md"
              >
                Worker
              </Button>
              <Button 
                type="button"
                variant={userType === "employer" ? "default" : "outline"}
                onClick={() => setUserType && setUserType("employer")}
                className="px-4 py-2 rounded-md"
              >
                Employer
              </Button>
            </div>
          </div>
          
          <FormField
            control={registerForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={registerForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={registerForm.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={registerForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={registerForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading || !userType}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <Form {...loginForm}>
      <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
        <FormField
          control={loginForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={loginForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Button variant="link" className="p-0 h-auto text-sm font-normal">
                  Forgot password?
                </Button>
              </div>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox id="remember" />
          <label
            htmlFor="remember"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Remember me
          </label>
        </div>
        
        {userType && (
          <div className="flex items-center justify-between text-sm mt-4">
            <span>Log in as:</span>
            <div className="space-x-2">
              <Button 
                type="button"
                size="sm"
                variant={userType === "worker" ? "default" : "outline"}
                onClick={() => setUserType && setUserType("worker")}
              >
                Worker
              </Button>
              <Button 
                type="button"
                size="sm"
                variant={userType === "employer" ? "default" : "outline"}
                onClick={() => setUserType && setUserType("employer")}
              >
                Employer
              </Button>
            </div>
          </div>
        )}
        
        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log In"}
        </Button>
      </form>
    </Form>
  );
}

import { Checkbox } from "@/components/ui/checkbox";
