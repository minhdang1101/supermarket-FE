import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Package,
  Calendar,
  Truck,
  CheckCircle,
  AlertTriangle,
  ClipboardCheck,
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
import { goodsReceiptService } from '@/services/goodsReceiptService';

export default function GoodsReceivingForm() {
  const { poId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [note, setNote] = useState('');

  const [receiptItems, setReceiptItems] = useState([]);

  useEffect(() => {
    if (poId) {
      fetchOrderDetails();
    }
  }, [poId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderService.getById(poId);
      const orderData = response.data;

      if (orderData.status !== 'SENT' && orderData.status !== 'COMPLETED') {
        toast.error('Đơn hàng này chưa sẵn sàng để nhập kho');
        navigate('/goods-receiving');
        return;
      }

      setOrder(orderData);
      setReceiptItems(
        orderData.details.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          barcode: item.barcode,
          orderedQuantity: item.quantity,
          receivedQuantity: item.quantity,
          expiryDate: '',
          batchNumber: '',
        }))
      );
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Không thể tải chi tiết đơn hàng');
      navigate('/goods-receiving');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, value) => {
    const qty = Math.max(0, parseInt(value) || 0);
    setReceiptItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, receivedQuantity: qty } : item
      )
    );
  };

  const handleExpiryDateChange = (productId, value) => {
    setReceiptItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, expiryDate: value } : item
      )
    );
  };

  const handleBatchNumberChange = (productId, value) => {
    setReceiptItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, batchNumber: value } : item
      )
    );
  };

  const getQuantityStatus = (ordered, received) => {
    if (received === ordered) return { status: 'complete', color: 'text-green-600' };
    if (received < ordered) return { status: 'partial', color: 'text-orange-600' };
    return { status: 'over', color: 'text-blue-600' };
  };

  const hasDiscrepancies = () => {
    return receiptItems.some((item) => item.receivedQuantity !== item.orderedQuantity);
  };

  const validateReceipt = () => {
    const itemsToReceive = receiptItems.filter((item) => item.receivedQuantity > 0);

    if (itemsToReceive.length === 0) {
      toast.error('Phải có ít nhất một mặt hàng có số lượng nhận');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateReceipt()) return;

    try {
      setSubmitting(true);
      const payload = {
        poId: parseInt(poId),
        note: note || '',
        items: receiptItems
          .filter((item) => item.receivedQuantity > 0)
          .map((item) => ({
            productId: item.productId,
            receivedQuantity: item.receivedQuantity,
            expiryDate: item.expiryDate || null,
            batchNumber: item.batchNumber || null,
          })),
      };

      await goodsReceiptService.create(payload);
      toast.success('Nhập hàng thành công! Đã cập nhật kho hàng.');
      navigate('/goods-receiving');
    } catch (error) {
      console.error('Error receiving goods:', error);
      toast.error(error.response?.data?.message || 'Nhập hàng thất bại');
    } finally {
      setSubmitting(false);
      setConfirmDialog(false);
    }
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

  const totalOrdered = receiptItems.reduce((sum, item) => sum + item.orderedQuantity, 0);
  const totalReceived = receiptItems.reduce((sum, item) => sum + item.receivedQuantity, 0);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/goods-receiving')}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Nhập hàng - Đơn # {order?.poId}
          </h1>
          <p className="text-muted-foreground mt-1">
            Xác nhận số lượng thực nhận và cập nhật kho hàng
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
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
              <p className="text-sm text-muted-foreground">Ngày nhận dự kiến</p>
              <p className="font-medium">{formatDate(order?.expectedDeliveryDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Giá trị đơn hàng</p>
              <p className="font-semibold text-primary">{formatCurrency(order?.totalAmount)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck size={20} />
              Tổng hợp nhập hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{totalOrdered}</p>
                <p className="text-xs text-muted-foreground">SL đặt hàng</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-2xl font-bold text-green-600">{totalReceived}</p>
                <p className="text-xs text-muted-foreground">SL thực nhận</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <p className="text-2xl font-bold text-orange-600">
                  {Math.abs(totalOrdered - totalReceived)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalReceived >= totalOrdered ? 'Dư' : 'Thiếu'}
                </p>
              </div>
            </div>

            {hasDiscrepancies() && (
              <div className="mt-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-start gap-2">
                <AlertTriangle size={18} className="text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800 dark:text-orange-400">
                    Phát hiện sai lệch số lượng
                  </p>
                  <p className="text-orange-700 dark:text-orange-500">
                    Số lượng thực nhận khác với số lượng đặt hàng. Vui lòng xác nhận kỹ trước khi hoàn tất.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package size={20} />
            Receiving Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead className="w-24 text-center">Đặt hàng</TableHead>
                <TableHead className="w-32 text-center">Thực nhận</TableHead>
                <TableHead className="w-36">Ngày hết hạn</TableHead>
                <TableHead className="w-32">Số lô</TableHead>
                <TableHead className="w-24 text-center">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receiptItems.map((item) => {
                const qtyStatus = getQuantityStatus(
                  item.orderedQuantity,
                  item.receivedQuantity
                );
                return (
                  <TableRow key={item.productId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {item.barcode}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {item.orderedQuantity}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max={item.orderedQuantity * 2}
                        value={item.receivedQuantity}
                        onChange={(e) =>
                          handleQuantityChange(item.productId, e.target.value)
                        }
                        className="w-24 text-center"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={item.expiryDate}
                        onChange={(e) =>
                          handleExpiryDateChange(item.productId, e.target.value)
                        }
                        min={new Date().toISOString().split('T')[0]}
                        className="w-36"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        placeholder="Số lô"
                        value={item.batchNumber}
                        onChange={(e) =>
                          handleBatchNumberChange(item.productId, e.target.value)
                        }
                        className="w-28"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {qtyStatus.status === 'complete' && (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle size={12} />
                          Full
                        </Badge>
                      )}
                      {qtyStatus.status === 'partial' && (
                        <Badge
                          variant="warning"
                          className="gap-1 bg-orange-100 text-orange-700"
                        >
                          <AlertTriangle size={12} />
                          Giao thiếu
                        </Badge>
                      )}
                      {qtyStatus.status === 'over' && (
                        <Badge variant="default" className="gap-1">
                          Over
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div>
            <Label htmlFor="note">Ghi chú nhập hàng</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Thêm ghi chú về lô hàng này (ví dụ: tình trạng hàng, lý do thiếu hàng...)"
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/goods-receiving')}>
          Hủy bỏ
        </Button>
        <Button
          onClick={() => setConfirmDialog(true)}
          disabled={submitting || totalReceived === 0}
        >
          <Truck size={16} className="mr-2" />
          Xác nhận nhập kho
        </Button>
      </div>

      <AlertDialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận nhập kho hàng</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>Bạn chuẩn bị nhập kho:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>
                    <strong>{totalReceived}</strong> sản phẩm tổng cộng
                  </li>
                  <li>
                    <strong>
                      {receiptItems.filter((i) => i.receivedQuantity > 0).length}
                    </strong>{' '}
                    loại mặt hàng
                  </li>
                </ul>
                {hasDiscrepancies() && (
                  <p className="mt-3 text-orange-600">
                    Lưu ý: Có sự sai lệch số lượng so với đơn đặt hàng ban đầu.
                  </p>
                )}
                <p className="mt-3">
                  Hành động này sẽ cập nhật số lượng tồn kho. Không thể hoàn tác.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Đang xử lý...' : 'Xác nhận nhập hàng'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
