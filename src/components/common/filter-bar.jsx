import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';


export function FilterBar({
  onSearch,
  onFilterChange,
  filters = [],
  onReset,
}) {
  const [searchValue, setSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  const executeSearch = () => {
    onSearch?.(searchValue);
  };

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
    onFilterChange?.(key, value);
  };

  const handleReset = () => {
    setSearchValue('');
    setActiveFilters({});
    onReset?.();
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0 || searchValue;

  return (
    <div className="flex flex-col gap-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Tìm kiếm..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={executeSearch} className="shrink-0 gap-2">
          <Search size={16} />
          Tìm kiếm
        </Button>
      </div>

      {/* Filter Selects */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={(activeFilters[filter.key] ?? filter.defaultValue ?? '') === '' ? '__all__' : (activeFilters[filter.key] ?? filter.defaultValue)}
              onValueChange={(value) => handleFilterChange(filter.key, value === '__all__' ? '' : value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem
                    key={option.value ?? option.label}
                    value={option.value === '' || option.value == null ? '__all__' : String(option.value)}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {/* Reset Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2"
            >
              <X size={14} />
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
