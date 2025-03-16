import React from 'react';
import { Badge } from "@/components/ui/badge";
import { MediaStatus, MediaType } from '@/contexts/MediaTrackingContext';
import { EyeIcon, BookOpenIcon, CheckIcon } from 'lucide-react';
import { getStatusDisplayText } from '@/utils/statusUtils';

interface MediaStatusBadgeProps {
  status: MediaStatus;
  mediaType?: MediaType;
  onClick?: () => void;
  isSelected?: boolean;
}

const getBaseClasses = (status: MediaStatus, hasClick: boolean, isSelected: boolean) => {
  // Use hardcoded classes instead of string interpolation
  if (status === 'want_to_view') {
    return `bg-blue-500 hover:bg-blue-600 flex gap-1 items-center ${
      hasClick ? 'cursor-pointer' : ''
    } ${isSelected ? 'ring-2 ring-blue-300 ring-offset-1' : ''}`;
  }
  
  if (status === 'in_progress') {
    return `bg-amber-500 hover:bg-amber-600 flex gap-1 items-center ${
      hasClick ? 'cursor-pointer' : ''
    } ${isSelected ? 'ring-2 ring-amber-300 ring-offset-1' : ''}`;
  }
  
  // finished
  return `bg-green-500 hover:bg-green-600 flex gap-1 items-center ${
    hasClick ? 'cursor-pointer' : ''
  } ${isSelected ? 'ring-2 ring-green-300 ring-offset-1' : ''}`;
};

const MediaStatusBadge = ({ status, mediaType, onClick, isSelected = false }: MediaStatusBadgeProps) => {
  const hasClick = !!onClick;
  const displayText = getStatusDisplayText(status, mediaType);
  const classes = getBaseClasses(status, hasClick, isSelected);

  switch (status) {
    case 'want_to_view':
      return (
        <Badge 
          className={classes}
          onClick={onClick}
        >
          <EyeIcon className="h-3 w-3" />
          <span>{displayText}</span>
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge 
          className={classes}
          onClick={onClick}
        >
          <BookOpenIcon className="h-3 w-3" />
          <span>{displayText}</span>
        </Badge>
      );
    case 'finished':
      return (
        <Badge 
          className={classes}
          onClick={onClick}
        >
          <CheckIcon className="h-3 w-3" />
          <span>{displayText}</span>
        </Badge>
      );
    default:
      return null;
  }
};

export default MediaStatusBadge;
