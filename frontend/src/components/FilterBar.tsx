
import React from 'react';
import { MediaStatus } from '@/contexts/MediaTrackingContext';
import MediaStatusBadge from './MediaStatusBadge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { FilterIcon, X } from 'lucide-react';

export type MediaFilter = {
  status?: MediaStatus | 'all';
  sortBy?: 'title' | 'addedAt' | 'updatedAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

interface FilterBarProps {
  filter: MediaFilter;
  onFilterChange: (filter: MediaFilter) => void;
}

const FilterBar = ({ filter, onFilterChange }: FilterBarProps) => {
  const handleStatusClick = (status: MediaStatus | 'all') => {
    onFilterChange({ ...filter, status });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [MediaFilter['sortBy'], MediaFilter['sortOrder']];
    onFilterChange({ ...filter, sortBy, sortOrder });
  };

  const clearFilters = () => {
    onFilterChange({ status: 'all', sortBy: 'updatedAt', sortOrder: 'desc' });
  };

  const hasActiveFilters = filter.status !== 'all' || filter.sortBy !== 'updatedAt' || filter.sortOrder !== 'desc';

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium flex items-center gap-2">
          <FilterIcon className="w-4 h-4" />
          Filter & Sort
        </h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters} 
            className="text-xs h-8"
          >
            <X className="h-3 w-3 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <p className="text-sm text-gray-500 mb-2">Status</p>
          <div className="flex flex-wrap gap-2">
            <MediaStatusBadge 
              status="want_to_view" 
              onClick={() => handleStatusClick('want_to_view')} 
              isSelected={filter.status === 'want_to_view'}
            />
            <MediaStatusBadge 
              status="in_progress" 
              onClick={() => handleStatusClick('in_progress')} 
              isSelected={filter.status === 'in_progress'}
            />
            <MediaStatusBadge 
              status="finished" 
              onClick={() => handleStatusClick('finished')} 
              isSelected={filter.status === 'finished'}
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleStatusClick('all')}
              className={`text-xs h-6 ${filter.status === 'all' ? 'bg-gray-200' : ''}`}
            >
              All
            </Button>
          </div>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <p className="text-sm text-gray-500 mb-2">Sort By</p>
          <Select 
            value={`${filter.sortBy}-${filter.sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              <SelectItem value="addedAt-desc">Recently Added</SelectItem>
              <SelectItem value="addedAt-asc">Oldest Added</SelectItem>
              <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
              <SelectItem value="rating-desc">Highest Rated</SelectItem>
              <SelectItem value="rating-asc">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
