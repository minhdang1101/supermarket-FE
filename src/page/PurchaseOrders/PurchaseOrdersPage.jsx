import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/data-table';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Send,
  DollarSign,
  ShoppingCart,
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

export default function PurchaseOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
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
    fetchOrders();
  }, [pagination.page, selectedStatus, selectedSupplier]);

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.search('', 'ACTIVE', 0, 100);
      setSuppliers(response.data.content || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderService.search(
        selectedSupplier || null,
        selectedStatus || null,
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
      toast.error('Không thể tải danh sách đơn nhập hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    if (key === 'status') {
      setSelectedStatus(value);
    } else if (key === 'supplier') {
      setSelectedSupplier(value);
    }
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedSupplier('');
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleUpdateStatus = async (order, newStatus) => {
    try {
      await purchaseOrderService.updateStatus(order.poId, newStatus);
      toast.success(`Trạng thái đơn hàng đã được cập nhật thành ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      DRAFT: { variant: 'secondary', icon: FileText, color: 'text-gray-600' },
      SENT: { variant: 'default', icon: Send, color: 'text-blue-600' },
      COMPLETED: { variant: 'success', icon: CheckCircle, color: 'text-green-600' },
      CANCELLED: { variant: 'destructive', icon: XCircle, color: 'text-red-600' },
    };
    return configs[status] || configs.DRAFT;
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
      render: (value, item) => (
        <div>
          <p className="font-medium">{value}</p>
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
      key: 'status',
      label: 'Trạng thái',
      width: 'w-28',
      render: (value) => {
        const config = getStatusConfig(value);
        const Icon = config.icon;
        return (
          <Badge variant={config.variant} className="gap-1">
            <Icon size={12} />
            {value === 'DRAFT' ? 'Bản nháp' : value === 'SENT' ? 'Đã gửi' : value === 'COMPLETED' ? 'Hoàn thành' : 'Đã hủy'}
          </Badge>
        );
      },
    },
    {
      key: 'totalAmount',
      label: 'Tổng tiền',
      width: 'w-32',
      render: (value) => (
        <span className="font-semibold text-primary">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'expectedDeliveryDate',
      label: 'Ngày nhận hàng dự kiến',
      width: 'w-28',
      render: (value) => formatDate(value),
    },
    {
      key: 'createdByName',
      label: 'Người tạo',
      width: 'w-28',
    },
  ];

  const getRowActions = (item) => {
    const actions = [
      {
        label: 'Xem chi tiết',
        onClick: (row) => navigate(`/purchase-orders/${row.poId}`),
      },
    ];

    if (item.status === 'DRAFT') {
      actions.push(
        {
          label: 'Gửi nhà cung cấp',
          onClick: (row) => handleUpdateStatus(row, 'SENT'),
        },
        {
          label: 'Hủy đơn hàng',
          onClick: (row) => handleUpdateStatus(row, 'CANCELLED'),
        }
      );
    }

    if (item.status === 'SENT') {
      actions.push({
        label: 'Nhập hàng',
        onClick: (row) => navigate(`/goods-receiving/${row.poId}`),
      });
    }

    return actions;
  };

  const orderStats = {
    total: pagination.totalElements,
    draft: orders.filter(o => o.status === 'DRAFT').length,
    sent: orders.filter(o => o.status === 'SENT').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Đơn nhập hàng</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý đơn nhập hàng và theo dõi trạng thái giao hàng
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShoppingCart size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-foreground">{orderStats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bản nháp</p>
              <p className="text-2xl font-bold text-gray-600">{orderStats.draft}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đang chờ hàng</p>
              <p className="text-2xl font-bold text-orange-600">{orderStats.sent}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hoàn thành</p>
              <p className="text-2xl font-bold text-green-600">{orderStats.completed}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1 flex flex-wrap gap-3">
            <Select
              value={selectedSupplier || '__all__'}
              onValueChange={(value) => handleFilterChange('supplier', value === '__all__' ? '' : value)}
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

            <Select
              value={selectedStatus || '__all__'}
              onValueChange={(value) => handleFilterChange('status', value === '__all__' ? '' : value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tất cả trạng thái</SelectItem>
                <SelectItem value="DRAFT">Bản nháp</SelectItem>
                <SelectItem value="SENT">Đã gửi</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>

            {(selectedStatus || selectedSupplier) && (
              <Button variant="outline" onClick={handleReset}>
                Xóa bộ lọc
              </Button>
            )}
          </div>
          <Button className="gap-2" onClick={() => navigate('/purchase-orders/new')}>
            <Plus size={16} />
            Tạo đơn hàng
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        getRowActions={getRowActions}
        keyField="poId"
        loading={loading}
        emptyMessage="Không tìm thấy đơn nhập hàng nào"
      />
    </div>
  );
}
