import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Building2,
  Calendar,
  User,
  Package,
  DollarSign,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { purchaseOrderService } from '@/services/purchaseOrderService';

export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderService.getById(id);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Không thể tải chi tiết đơn hàng');
      navigate('/purchase-orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setActionLoading(true);
      await purchaseOrderService.updateStatus(id, newStatus);
      toast.success(`Trạng thái đơn hàng đã được cập nhật thành ${newStatus}`);
      setConfirmDialog({ open: false, action: null });
      fetchOrder();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      DRAFT: { variant: 'secondary', icon: FileText },
      SENT: { variant: 'default', icon: Send },
      COMPLETED: { variant: 'success', icon: CheckCircle },
      CANCELLED: { variant: 'destructive', icon: XCircle },
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

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-1" />
          <Skeleton className="h-64 col-span-2" />
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order?.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/purchase-orders')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Đơn nhập hàng #{order?.poId}</h1>
            <p className="text-muted-foreground mt-1">
              {order?.supplierName} • {formatDate(order?.orderDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusConfig.variant} className="gap-1">
            <StatusIcon size={12} />
            {order?.status === 'DRAFT' ? 'Bản nháp' : order?.status === 'SENT' ? 'Đã gửi' : order?.status === 'COMPLETED' ? 'Hoàn thành' : 'Đã hủy'}
          </Badge>
          {order?.status === 'DRAFT' && (
            <>
              <Button
                variant="default"
                onClick={() => setConfirmDialog({ open: true, action: 'SENT' })}
                disabled={actionLoading}
              >
                <Send size={16} className="mr-2" />
                Gửi nhà cung cấp
              </Button>
              <Button
                variant="destructive"
                onClick={() => setConfirmDialog({ open: true, action: 'CANCELLED' })}
                disabled={actionLoading}
              >
                <XCircle size={16} className="mr-2" />
                Hủy đơn hàng
              </Button>
            </>
          )}
          {order?.status === 'SENT' && (
            <Button onClick={() => navigate(`/goods-receiving/${order.poId}`)}>
              <Truck size={16} className="mr-2" />
              Nhập hàng
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 size={20} />
              Thông tin đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nhà cung cấp</p>
              <p className="font-medium">{order?.supplierName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày đặt hàng</p>
              <p className="font-medium">{formatDate(order?.orderDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nhận hàng dự kiến</p>
              <p className="font-medium">{formatDate(order?.expectedDeliveryDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Người tạo</p>
              <p className="font-medium">{order?.createdByName || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng tiền</p>
              <p className="font-semibold text-primary">{formatCurrency(order?.totalAmount)}</p>
            </div>
            {order?.note && (
              <div>
                <p className="text-sm text-muted-foreground">Ghi chú</p>
                <p className="text-sm">{order.note}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package size={20} />
              Danh sách sản phẩm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="w-24 text-center">Số lượng</TableHead>
                  <TableHead className="w-32 text-right">Giá nhập</TableHead>
                  <TableHead className="w-32 text-right">Tổng tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(order?.details || []).map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{item.barcode}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.quantity * (item.unitPrice || 0))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => !open && setConfirmDialog({ open: false, action: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'SENT' && 'Gửi đơn hàng cho Nhà cung cấp?'}
              {confirmDialog.action === 'CANCELLED' && 'Hủy đơn hàng?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'SENT' &&
                'Hành động này sẽ đánh dấu đơn hàng là đã gửi. Nhà cung cấp sẽ được thông báo.'}
              {confirmDialog.action === 'CANCELLED' &&
                'Hành động này sẽ hủy đơn hàng. Không thể hoàn tác.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleUpdateStatus(confirmDialog.action)}
              disabled={actionLoading}
            >
              {actionLoading ? 'Đang xử lý...' : 'Xác nhận'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
