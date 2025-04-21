import React from "react";
import { useMutation } from "@tanstack/react-query";
import { WorkerProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { getInitials } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SkillBadge } from "@/components/skill-badge";
import { RatingDisplay } from "@/components/rating-display";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { X } from "lucide-react";

interface WorkerDetailDialogProps {
  worker: WorkerProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkerDetailDialog({ worker, isOpen, onClose }: WorkerDetailDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const inviteMutation = useMutation({
    mutationFn: async (workerId: number) => {
      // This would be replaced with an actual invitation API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Invitation sent",
        description: "Your invitation has been sent to the worker.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Invitation failed",
        description: error instanceof Error ? error.message : "Failed to send invitation. Try again later.",
        variant: "destructive",
      });
    },
  });
  
  if (!worker) return null;
  
  const canInvite = user?.userType === "employer";
  
  const handleInvite = () => {
    if (!worker.userId) return;
    inviteMutation.mutate(worker.userId);
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
        </DialogHeader>
        
        <div className="flex items-start mb-4">
          <Avatar className="h-16 w-16 mr-4">
            {worker.image ? (
              <AvatarImage src={worker.image} alt={`Profile of worker ${worker.userId}`} />
            ) : (
              <AvatarFallback>{getInitials(`Worker ${worker.userId}`)}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Worker {worker.userId}
            </DialogTitle>
            <p className="text-sm text-gray-600">{worker.title}</p>
            
            <div className="flex items-center mt-2">
              <RatingDisplay rating={worker.rating} reviewCount={worker.reviewCount} />
            </div>
          </div>
        </div>
        
        <div className="py-3 border-t border-b border-gray-200">
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Hourly Rate</p>
              <p className="mt-1 text-sm text-gray-900">${worker.hourlyRate}/hr</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="mt-1 text-sm text-gray-900">{worker.location || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Availability</p>
              <p className="mt-1 text-sm text-gray-900">{worker.availability}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Experience Level</p>
              <p className="mt-1 text-sm text-gray-900">Intermediate</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900">Skills</h4>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {worker.skills.map((skill, index) => (
              <SkillBadge key={index} skill={skill} />
            ))}
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900">About</h4>
          <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">
            {worker.experience || 
              "Experienced professional with a proven track record of delivering high-quality work. Committed to meeting deadlines and exceeding client expectations."}
          </p>
        </div>
        
        <DialogFooter className="mt-8 sm:flex sm:flex-row-reverse gap-2">
          {canInvite ? (
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleInvite}
              disabled={inviteMutation.isPending}
            >
              {inviteMutation.isPending ? "Sending..." : "Invite to Job"}
            </Button>
          ) : (
            <Button disabled>Contact</Button>
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
