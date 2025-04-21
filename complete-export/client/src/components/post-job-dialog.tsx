import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { jobTypes } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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

interface PostJobDialogProps {
  isOpen: boolean;
  onClose: () => void;
  companyName?: string;
}

const jobPostingSchema = z.object({
  title: z.string().min(5, "Job title must be at least 5 characters"),
  company: z.string().min(2, "Company name is required"),
  location: z.string().min(2, "Location is required"),
  rate: z.string().min(1, "Rate is required"),
  type: z.string().min(1, "Job type is required"),
  duration: z.string().optional(),
  skillsInput: z.string().optional(),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

type JobPostingFormData = z.infer<typeof jobPostingSchema>;

export function PostJobDialog({ isOpen, onClose, companyName = "" }: PostJobDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: "",
      company: companyName,
      location: "",
      rate: "",
      type: "",
      duration: "",
      skillsInput: "",
      skills: [],
      description: "",
    },
  });
  
  const postJobMutation = useMutation({
    mutationFn: async (data: Omit<JobPostingFormData, "skillsInput">) => {
      const response = await apiRequest("POST", "/api/jobs", {
        title: data.title,
        company: data.company,
        location: data.location,
        rate: data.rate,
        type: data.type,
        duration: data.duration || undefined,
        skills: data.skills,
        description: data.description,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job posting created",
        description: "Your job posting has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Job posting failed",
        description: error instanceof Error ? error.message : "Failed to create job posting. Try again later.",
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
  
  const onSubmit = (data: JobPostingFormData) => {
    const { skillsInput, ...jobData } = data;
    postJobMutation.mutate(jobData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6 rounded-full"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Post a New Job
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Fill out the details below to post a new job opportunity.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Senior Web Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="company"
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Remote, New York, NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pay Rate</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., $40-50/hr, $70K-90K/year" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
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
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 3 months, Ongoing" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="skillsInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Skills</FormLabel>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the job, responsibilities, requirements, etc." 
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={postJobMutation.isPending}
              >
                {postJobMutation.isPending ? "Posting..." : "Post Job"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
