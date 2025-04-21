import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { Navbar } from "@/components/navbar";
import Landing from "@/pages/landing";
import Register from "@/pages/register";
import Login from "@/pages/login";
import ProfileSetup from "@/pages/profile-setup";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/profile-setup" component={ProfileSetup} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Router />
            </main>
            <footer className="bg-white">
              <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
                <div className="md:flex md:items-center md:justify-between">
                  <div className="flex items-center">
                    <span className="text-primary font-bold text-xl">WorkConnect</span>
                  </div>
                  <div className="mt-8 md:mt-0">
                    <p className="text-center text-sm text-gray-500">&copy; {new Date().getFullYear()} WorkConnect. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
