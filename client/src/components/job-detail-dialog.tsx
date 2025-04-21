import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { JobPosting } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { formatRelativeTime } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SkillBadge } from "@/components/skill-badge";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

interface JobDetailDialogProps {
  job: JobPosting | null;
  isOpen: boolean;
  onClose: () => void;
}

export function JobDetailDialog({ job, isOpen, onClose }: JobDetailDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = React.useState("");
  
  const applyMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await apiRequest("POST", "/api/applications", {
        jobId,
        coverLetter: coverLetter.trim() || undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application submitted",
        description: "Your job application has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications/worker"] });
      onClose();
      setCoverLetter("");
    },
    onError: (error) => {
      toast({
        title: "Application failed",
        description: error instanceof Error ? error.message : "Failed to submit application. Try again later.",
        variant: "destructive",
      });
    },
  });
  
  if (!job) return null;
  
  const postedDate = job.createdAt ? formatRelativeTime(job.createdAt) : "Recently";
  const canApply = user?.userType === "worker";
  
  const handleApply = () => {
    if (!job.id) return;
    applyMutation.mutate(job.id);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
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
          <DialogTitle className="text-lg leading-6 font-medium text-gray-900">
            {job.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-1">
            {job.company} • {job.location}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center mt-4">
          <span className="text-sm font-medium text-gray-900">{job.rate}</span>
          {job.duration && (
            <>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-sm text-gray-600">{job.duration}</span>
            </>
          )}
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-sm text-gray-500">{postedDate}</span>
        </div>
        
        <div className="mt-4">
          <Badge variant="secondary">{job.type}</Badge>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900">Required Skills</h4>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {job.skills.map((skill, index) => (
              <SkillBadge key={index} skill={skill} />
            ))}
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900">Job Description</h4>
          <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{job.description}</p>
        </div>
        
        {canApply && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Cover Letter (optional)</h4>
            <Textarea
              placeholder="Introduce yourself and explain why you're a great fit for this position..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={4}
            />
          </div>
        )}
        
        <DialogFooter className="mt-8 sm:flex sm:flex-row-reverse gap-2">
          {canApply ? (
            <Button
              onClick={handleApply}
              disabled={applyMutation.isPending}
            >
              {applyMutation.isPending ? "Applying..." : "Apply Now"}
            </Button>
          ) : (
            <Button disabled>
              {user ? "Employers cannot apply" : "Please log in to apply"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
