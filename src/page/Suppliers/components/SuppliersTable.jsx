import { DataTable } from '@/components/common/data-table';
import { Badge } from '@/components/ui/badge';
import { Building2, Phone, Mail } from 'lucide-react';
import { SUPPLIER_STATUS } from '@/constants';

/**
 * Suppliers data table
 */
export function SuppliersTable({ suppliers, loading, onView, onEdit, onToggleStatus }) {
  const columns = [
    {
      key: 'name',
      label: 'Tên Nhà cung cấp',
      width: 'w-48',
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Building2 size={20} />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground">{item.address || 'Chưa có địa chỉ'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contactPerson',
      label: 'Người liên hệ',
      width: 'w-32',
      render: (value) => value || '-',
    },
    {
      key: 'phone',
      label: 'Số điện thoại',
      width: 'w-28',
      render: (value) => (
        <div className="flex items-center gap-2 text-sm">
          <Phone size={14} className="text-muted-foreground" />
          {value || '-'}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      width: 'w-40',
      render: (value) => (
        <div className="flex items-center gap-2 text-sm">
          <Mail size={14} className="text-muted-foreground" />
          {value || '-'}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      width: 'w-24',
      render: (value) => (
        <Badge variant={value === SUPPLIER_STATUS.ACTIVE ? 'default' : 'secondary'}>
          {value === SUPPLIER_STATUS.ACTIVE ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </Badge>
      ),
    },
  ];

  const getRowActions = (item) => [
    { label: 'Xem chi tiết', onClick: () => onView(item) },
    { label: 'Chỉnh sửa', onClick: () => onEdit(item) },
    { label: 'Đổi trạng thái', onClick: () => onToggleStatus(item) },
  ];

  return (
    <DataTable
      columns={columns}
      data={suppliers}
      getRowActions={getRowActions}
      keyField="supplierId"
      loading={loading}
      emptyMessage="Không tìm thấy nhà cung cấp nào"
    />
  );
}
