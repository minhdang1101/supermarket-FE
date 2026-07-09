import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/data-table';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  Building2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { purchaseOrderService } from '@/services/purchaseOrderService';
import { supplierService } from '@/services/supplierService';

export default function GoodsReceivingPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState('');

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    fetchPendingOrders();
  }, [pagination.page, selectedSupplier]);

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.search('', 'ACTIVE', 0, 100);
      setSuppliers(response.data.content || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderService.search(
        selectedSupplier || null,
        'SENT',
        pagination.page,
        pagination.size
      );
      const data = response.data;
      setOrders(data.content || []);
      setPagination(prev => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Không thể tải các đơn hàng đang chờ');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (value) => {
    setSelectedSupplier(value);
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns = [
    {
      key: 'poId',
      label: 'Mã đơn',
      width: 'w-20',
      render: (value) => (
        <span className="font-mono font-medium">#{value}</span>
      ),
    },
    {
      key: 'supplierName',
      label: 'Nhà cung cấp',
      width: 'w-40',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'orderDate',
      label: 'Ngày đặt',
      width: 'w-28',
      render: (value) => formatDate(value),
    },
    {
      key: 'expectedDeliveryDate',
      label: 'Ngày nhận dự kiến',
      width: 'w-32',
      render: (value) => {
        const isOverdue = value && new Date(value) < new Date();
        return (
          <span className={isOverdue ? 'text-destructive font-medium' : ''}>
            {formatDate(value)}
            {isOverdue && ' (Quá hạn)'}
          </span>
        );
      },
    },
    {
      key: 'totalAmount',
      label: 'Giá trị đơn',
      width: 'w-32',
      render: (value) => (
        <span className="font-semibold">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      width: 'w-28',
      render: () => (
        <Badge variant="default" className="gap-1">
          <Clock size={12} />
          Chờ nhập hàng
        </Badge>
      ),
    },
  ];

  const actions = [
    {
      label: 'Xem đơn hàng',
      onClick: (item) => navigate(`/purchase-orders/${item.poId}`),
    },
    {
      label: 'Nhập hàng',
      onClick: (item) => navigate(`/goods-receiving/${item.poId}`),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Nhập kho</h1>
        <p className="text-muted-foreground mt-2">
          Nhận hàng từ các đơn mua và cập nhật kho hàng
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Orders</p>
              <p className="text-2xl font-bold text-foreground">{pagination.totalElements}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Truck size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sẵn sàng nhận</p>
              <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quá hạn</p>
              <p className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.expectedDeliveryDate && new Date(o.expectedDeliveryDate) < new Date()).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-3">
        <Select
          value={selectedSupplier || '__all__'}
          onValueChange={(v) => handleFilterChange(v === '__all__' ? '' : v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tất cả nhà cung cấp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tất cả nhà cung cấp</SelectItem>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.supplierId} value={String(supplier.supplierId)}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedSupplier && (
          <Button variant="outline" onClick={() => handleFilterChange('')}>
            Xóa bộ lọc
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={orders}
        actions={actions}
        keyField="poId"
        loading={loading}
        emptyMessage="Không có đơn hàng nào đang chờ nhập"
      />
    </div>
  );
}
