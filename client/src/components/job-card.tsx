import React from "react";
import { JobPosting } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillBadge } from "@/components/skill-badge";
import { formatRelativeTime, truncateText } from "@/lib/utils";

interface JobCardProps {
  job: JobPosting;
  onViewDetails: (job: JobPosting) => void;
}

export function JobCard({ job, onViewDetails }: JobCardProps) {
  const postedDate = job.createdAt ? formatRelativeTime(job.createdAt) : "Recently";

  return (
    <Card className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
          <Badge variant="secondary">{job.type}</Badge>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{job.company} • {job.location}</p>
        
        <div className="flex items-center mb-4">
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
        
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {job.skills.slice(0, 3).map((skill, index) => (
              <SkillBadge key={index} skill={skill} />
            ))}
            {job.skills.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{job.skills.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {truncateText(job.description, 120)}
        </p>
        
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full text-primary border-primary hover:bg-primary/10"
            onClick={() => onViewDetails(job)}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
