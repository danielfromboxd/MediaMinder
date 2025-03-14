
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (rating: number) => void;
}

const StarRating = ({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  onChange
}: StarRatingProps) => {
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1);
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const handleClick = (value: number) => {
    if (onChange) {
      // Toggle between rating and 0 if clicking the same star
      const newRating = value === rating ? 0 : value;
      onChange(newRating);
    }
  };
  
  return (
    <div className="flex items-center">
      {stars.map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} ${onChange ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onClick={() => onChange && handleClick(star)}
        />
      ))}
    </div>
  );
};

export default StarRating;
