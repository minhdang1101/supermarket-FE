import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

/**
 * Suppliers page header with title and add button
 */
export function SuppliersHeader({ onAdd }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản lý Nhà cung cấp</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý danh sách và thông tin các nhà cung cấp của bạn
        </p>
      </div>
      <Button className="gap-2" onClick={onAdd}>
        <Plus size={16} />
        Thêm Nhà cung cấp
      </Button>
    </div>
  );
}
