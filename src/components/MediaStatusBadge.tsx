
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { MediaStatus } from '@/contexts/MediaTrackingContext';
import { EyeIcon, BookOpenIcon, CheckIcon } from 'lucide-react';

interface MediaStatusBadgeProps {
  status: MediaStatus;
  onClick?: () => void;
  isSelected?: boolean;
}

const MediaStatusBadge = ({ status, onClick, isSelected = false }: MediaStatusBadgeProps) => {
  const getBaseClasses = (baseColor: string) => {
    const baseClasses = `bg-${baseColor}-500 hover:bg-${baseColor}-600 flex gap-1 items-center`;
    
    if (onClick) {
      return `${baseClasses} cursor-pointer ${isSelected ? `ring-2 ring-${baseColor}-300 ring-offset-1` : ''}`;
    }
    
    return baseClasses;
  };

  switch (status) {
    case 'want_to_view':
      return (
        <Badge 
          className={getBaseClasses('blue')}
          onClick={onClick}
        >
          <EyeIcon className="h-3 w-3" />
          <span>Want to View</span>
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge 
          className={getBaseClasses('amber')}
          onClick={onClick}
        >
          <BookOpenIcon className="h-3 w-3" />
          <span>In Progress</span>
        </Badge>
      );
    case 'finished':
      return (
        <Badge 
          className={getBaseClasses('green')}
          onClick={onClick}
        >
          <CheckIcon className="h-3 w-3" />
          <span>Finished</span>
        </Badge>
      );
    default:
      return null;
  }
};

export default MediaStatusBadge;
