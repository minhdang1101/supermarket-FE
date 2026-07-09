import { FilterBar } from '@/components/common/filter-bar';

/**
 * Suppliers filter bar
 */
export function SuppliersFilters({ onSearch, onFilterChange, onReset, statusOptions }) {
  return (
    <div className="flex-1">
      <FilterBar
        onSearch={onSearch}
        onFilterChange={(key, value) => {
          if (key === 'status') {
            onFilterChange(value);
          }
        }}
        filters={[
          {
            key: 'status',
            label: 'Trạng thái',
            options: statusOptions,
          },
        ]}
        onReset={onReset}
      />
    </div>
  );
}
