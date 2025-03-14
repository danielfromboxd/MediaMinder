
import React from 'react';
import { CheckSquare } from 'lucide-react';

const Logo = () => {
  return (
    <div className="mediaminder-logo">
      <CheckSquare className="h-6 w-6 text-blue-500" />
      <span className="uppercase">Media Minder</span>
    </div>
  );
};

export default Logo;
