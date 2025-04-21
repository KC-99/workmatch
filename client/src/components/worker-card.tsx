import React from "react";
import { WorkerProfile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SkillBadge } from "@/components/skill-badge";
import { RatingDisplay } from "@/components/rating-display";
import { getInitials } from "@/lib/utils";
import { MapPin, Clock } from "lucide-react";

interface WorkerCardProps {
  worker: WorkerProfile;
  onViewProfile: (worker: WorkerProfile) => void;
}

export function WorkerCard({ worker, onViewProfile }: WorkerCardProps) {
  return (
    <Card className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start mb-4">
          <Avatar className="h-12 w-12 mr-4">
            {worker.image ? (
              <AvatarImage src={worker.image} alt={`Profile of worker ${worker.userId}`} />
            ) : (
              <AvatarFallback>{getInitials(`Worker ${worker.userId}`)}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Worker {worker.userId}</h3>
            <p className="text-sm text-gray-600">{worker.title}</p>
          </div>
        </div>
        
        <div className="flex items-center mb-4">
          <RatingDisplay rating={worker.rating} reviewCount={worker.reviewCount} />
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-sm text-gray-600">${worker.hourlyRate}/hr</span>
        </div>
        
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {worker.skills.slice(0, 3).map((skill, index) => (
              <SkillBadge key={index} skill={skill} />
            ))}
            {worker.skills.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{worker.skills.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        {worker.location && (
          <div className="flex items-center mt-4 text-sm">
            <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{worker.location}</span>
          </div>
        )}
        
        <div className="flex items-center mt-2 text-sm">
          <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
          <span className="text-gray-600">Available: {worker.availability}</span>
        </div>
        
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full text-primary border-primary hover:bg-primary/10"
            onClick={() => onViewProfile(worker)}
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
