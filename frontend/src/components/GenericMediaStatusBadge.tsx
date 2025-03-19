import React from 'react';
import { Badge } from "@/components/ui/badge";
import { MediaStatus } from '@/contexts/MediaTrackingContext';
import { EyeIcon, BookOpenIcon, CheckIcon } from 'lucide-react';
import { getGenericStatusDisplayText } from '@/utils/statusUtils';

interface GenericMediaStatusBadgeProps {
  status: MediaStatus;
  onClick?: () => void;
  isSelected?: boolean;
}

const getBaseClasses = (status: MediaStatus, hasClick: boolean, isSelected: boolean) => {
  // Use the same color scheme as MediaStatusBadge
  if (status === 'want_to_view') {
    return `bg-blue-500 hover:bg-blue-600 flex gap-1 items-center ${
      hasClick ? 'cursor-pointer' : ''
    } ${isSelected ? 'ring-2 ring-blue-300 ring-offset-1' : ''}`;
  }
  
  if (status === 'in_progress') {
    return `bg-purple-500 hover:bg-purple-600 flex gap-1 items-center ${
      hasClick ? 'cursor-pointer' : ''
    } ${isSelected ? 'ring-2 ring-purple-300 ring-offset-1' : ''}`;
  }
  
  // finished
  return `bg-green-500 hover:bg-green-600 flex gap-1 items-center ${
    hasClick ? 'cursor-pointer' : ''
  } ${isSelected ? 'ring-2 ring-green-300 ring-offset-1' : ''}`;
};

const GenericMediaStatusBadge = ({ status, onClick, isSelected = false }: GenericMediaStatusBadgeProps) => {
  const hasClick = !!onClick;
  const displayText = getGenericStatusDisplayText(status); // Use generic text
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

export default GenericMediaStatusBadge;