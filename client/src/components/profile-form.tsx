import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { industries, companySize, availabilityOptions } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

// Worker profile schema
const workerProfileSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  skillsInput: z.string().optional(),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  experience: z.string().optional(),
  hourlyRate: z.coerce.number().min(1, "Hourly rate must be at least 1"),
  availability: z.string().min(1, "Availability is required"),
  location: z.string().optional(),
  image: z.string().optional(),
});

type WorkerProfileFormValues = z.infer<typeof workerProfileSchema>;

// Employer profile schema
const employerProfileSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companySize: z.string().optional(),
  industry: z.string().min(1, "Industry is required"),
  companyDescription: z.string().optional(),
  location: z.string().optional(),
});

type EmployerProfileFormValues = z.infer<typeof employerProfileSchema>;

interface WorkerProfileFormProps {
  existingProfile?: any;
  onSetupComplete?: () => void;
}

export function WorkerProfileForm({ existingProfile, onSetupComplete }: WorkerProfileFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<WorkerProfileFormValues>({
    resolver: zodResolver(workerProfileSchema),
    defaultValues: {
      title: existingProfile?.title || "",
      skillsInput: "",
      skills: existingProfile?.skills || [],
      experience: existingProfile?.experience || "",
      hourlyRate: existingProfile?.hourlyRate || 0,
      availability: existingProfile?.availability || "",
      location: existingProfile?.location || "",
      image: existingProfile?.image || "",
    },
  });
  
  const profileMutation = useMutation({
    mutationFn: async (data: Omit<WorkerProfileFormValues, "skillsInput">) => {
      const endpoint = existingProfile ? "/api/profiles/worker" : "/api/profiles/worker";
      const method = existingProfile ? "PATCH" : "POST";
      const response = await apiRequest(method, endpoint, {
        title: data.title,
        skills: data.skills,
        experience: data.experience || undefined,
        hourlyRate: data.hourlyRate,
        availability: data.availability,
        location: data.location || undefined,
        image: data.image || undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: existingProfile ? "Profile updated" : "Profile created",
        description: existingProfile 
          ? "Your worker profile has been updated successfully." 
          : "Your worker profile has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/worker"] });
      if (onSetupComplete) onSetupComplete();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      const skillsInput = form.getValues("skillsInput")?.trim();
      if (skillsInput) {
        const currentSkills = form.getValues("skills");
        if (!currentSkills.includes(skillsInput)) {
          form.setValue("skills", [...currentSkills, skillsInput]);
          form.setValue("skillsInput", "");
        }
      }
    }
  };
  
  const removeSkill = (skill: string) => {
    const currentSkills = form.getValues("skills");
    form.setValue("skills", currentSkills.filter(s => s !== skill));
  };
  
  const onSubmit = (data: WorkerProfileFormValues) => {
    const { skillsInput, ...profileData } = data;
    profileMutation.mutate(profileData);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Graphic Designer, Web Developer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="skillsInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Add skills and press Enter" 
                  {...field}
                  onKeyDown={handleSkillAdd}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="skills"
          render={() => (
            <FormItem>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.watch("skills").map((skill, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                  >
                    <span>{skill}</span>
                    <button 
                      type="button" 
                      className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-primary-600 hover:bg-primary-200"
                      onClick={() => removeSkill(skill)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief summary of your relevant experience" 
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="hourlyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hourly Rate ($)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="availability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Availability</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availabilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="City, State/Province, Country" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormDescription>
                Enter a URL for your profile image (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button
          type="submit"
          className="w-full"
          disabled={profileMutation.isPending}
        >
          {profileMutation.isPending
            ? "Saving..."
            : existingProfile
              ? "Update Profile"
              : "Complete Profile"}
        </Button>
      </form>
    </Form>
  );
}

interface EmployerProfileFormProps {
  existingProfile?: any;
  onSetupComplete?: () => void;
}

export function EmployerProfileForm({ existingProfile, onSetupComplete }: EmployerProfileFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<EmployerProfileFormValues>({
    resolver: zodResolver(employerProfileSchema),
    defaultValues: {
      companyName: existingProfile?.companyName || "",
      companySize: existingProfile?.companySize || "",
      industry: existingProfile?.industry || "",
      companyDescription: existingProfile?.companyDescription || "",
      location: existingProfile?.location || "",
    },
  });
  
  const profileMutation = useMutation({
    mutationFn: async (data: EmployerProfileFormValues) => {
      const endpoint = existingProfile ? "/api/profiles/employer" : "/api/profiles/employer";
      const method = existingProfile ? "PATCH" : "POST";
      const response = await apiRequest(method, endpoint, {
        companyName: data.companyName,
        companySize: data.companySize || undefined,
        industry: data.industry,
        companyDescription: data.companyDescription || undefined,
        location: data.location || undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: existingProfile ? "Profile updated" : "Profile created",
        description: existingProfile 
          ? "Your employer profile has been updated successfully." 
          : "Your employer profile has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/employer"] });
      if (onSetupComplete) onSetupComplete();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: EmployerProfileFormValues) => {
    profileMutation.mutate(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Acme Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="companySize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Size</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companySize.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="companyDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description of your company" 
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Location</FormLabel>
              <FormControl>
                <Input placeholder="City, State/Province, Country" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button
          type="submit"
          className="w-full"
          disabled={profileMutation.isPending}
        >
          {profileMutation.isPending
            ? "Saving..."
            : existingProfile
              ? "Update Profile"
              : "Complete Profile"}
        </Button>
      </form>
    </Form>
  );
}
