import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Download, 
  Eye, 
  Search, 
  Calendar, 
  Filter,
  Loader2,
  Receipt,
  Printer,
  ShoppingBag,
  CreditCard,
  Banknote,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { salesService } from '@/services/salesService';
import { toast } from 'sonner';

/**
 * Sales History Page - View completed transactions
 * 
 * Features:
 * - Filter by date range, cashier, payment method
 * - Pagination
 * - View order details
 * - Export to Excel/PDF
 * 
 * @author SMS Development Team
 * @version 2.0
 */

// Format currency
const formatCurrency = (value) => {
  if (!value && value !== 0) return '₫0';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

// Format date - Backend returns "dd/MM/yyyy HH:mm"
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    // If already formatted string from backend (dd/MM/yyyy HH:mm)
    if (typeof dateString === 'string' && dateString.includes('/')) {
      const [datePart] = dateString.split(' ');
      return datePart; // Return "dd/MM/yyyy"
    }
    // If ISO string or Date object
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('vi-VN');
  } catch (e) {
    return '-';
  }
};

// Format time - Backend returns "dd/MM/yyyy HH:mm"
const formatTime = (dateString) => {
  if (!dateString) return '';
  try {
    // If already formatted string from backend (dd/MM/yyyy HH:mm)
    if (typeof dateString === 'string' && dateString.includes(' ')) {
      const [, timePart] = dateString.split(' ');
      return timePart || ''; // Return "HH:mm"
    }
    // If ISO string or Date object
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return '';
  }
};

// Payment method labels
const PAYMENT_METHODS = {
  CASH: { label: 'Tiền mặt', icon: Banknote, color: 'bg-green-100 text-green-700' },
  CARD: { label: 'Thẻ', icon: CreditCard, color: 'bg-blue-100 text-blue-700' },
};

export default function SalesHistoryPage() {
  // Data state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    cashierId: '',
    paymentMethod: '__all__',
  });
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  
  // Dialog state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Load orders
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build params
      const params = {
        page,
        size: pageSize,
        sortBy: 'orderDate',
        sortDir: 'desc',
      };
      
      // Add date filters (default to today if not set)
      if (filters.startDate) {
        params.startDate = filters.startDate;
      } else {
        // Default to first day of current month
        const today = new Date();
        params.startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
      }
      
      if (filters.endDate) {
        params.endDate = filters.endDate;
      } else {
        params.endDate = new Date().toISOString().split('T')[0];
      }
      
      if (filters.cashierId) {
        params.cashierId = filters.cashierId;
      }
      
      if (filters.paymentMethod && filters.paymentMethod !== '__all__') {
        params.paymentMethod = filters.paymentMethod;
      }

      const response = await salesService.getSalesHistory(params);
      const data = response.data;
      
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      
    } catch (err) {
      console.error('Failed to load orders:', err);
      toast.error('Không thể tải lịch sử bán hàng');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // View order details
  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
    setLoadingDetails(true);
    
    try {
      const response = await salesService.getSalesOrderById(order.salesOrderId);
      setOrderDetails(response.data);
    } catch (err) {
      console.error('Failed to load order details:', err);
      toast.error('Không thể tải chi tiết đơn hàng');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0); // Reset to first page
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      cashierId: '',
      paymentMethod: '__all__',
    });
    setPage(0);
  };

  // Export (placeholder)
  const handleExport = () => {
    toast.info('Tính năng xuất file đang phát triển');
  };

  // Calculate summary
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Lịch sử bán hàng</h1>
          <p className="text-slate-500 mt-1">
            Xem và theo dõi tất cả các giao dịch đã hoàn thành
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadOrders} className="gap-2">
            <RefreshCw size={16} />
            Làm mới
          </Button>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download size={16} />
            Xuất file
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Receipt className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-slate-800">{totalElements}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-xl">
                <ShoppingBag className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Trang hiện tại</p>
                <p className="text-2xl font-bold text-slate-800">{orders.length} đơn</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <CreditCard className="text-emerald-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Doanh thu (trang này)</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm text-slate-600">Từ ngày</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm text-slate-600">Đến ngày</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm text-slate-600">Phương thức thanh toán</Label>
              <Select 
                value={filters.paymentMethod} 
                onValueChange={(v) => handleFilterChange('paymentMethod', v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tất cả</SelectItem>
                  <SelectItem value="CASH">Tiền mặt</SelectItem>
                  <SelectItem value="CARD">Thẻ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={handleResetFilters}>
              <Filter size={16} className="mr-2" />
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-slate-600">Đang tải...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Receipt size={48} className="mb-3 opacity-50" />
              <p>Không tìm thấy giao dịch nào</p>
              <p className="text-sm">Thử thay đổi bộ lọc</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-slate-600">Mã hóa đơn</th>
                    <th className="text-left p-4 font-medium text-slate-600">Khách hàng</th>
                    <th className="text-left p-4 font-medium text-slate-600">Thu ngân</th>
                    <th className="text-left p-4 font-medium text-slate-600">Thanh toán</th>
                    <th className="text-left p-4 font-medium text-slate-600">Thời gian</th>
                    <th className="text-right p-4 font-medium text-slate-600">Tổng tiền</th>
                    <th className="text-center p-4 font-medium text-slate-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => {
                    const paymentConfig = PAYMENT_METHODS[order.paymentMethod] || PAYMENT_METHODS.CASH;
                    const PaymentIcon = paymentConfig.icon;
                    
                    return (
                      <tr key={order.salesOrderId} className="hover:bg-slate-50">
                        <td className="p-4">
                          <span className="font-mono text-sm font-semibold text-slate-800">
                            {order.invoiceNumber}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">
                          {order.customerName || 'Khách lẻ'}
                        </td>
                        <td className="p-4 text-slate-600">
                          {order.cashierName || '-'}
                        </td>
                        <td className="p-4">
                          <Badge className={`gap-1 ${paymentConfig.color}`}>
                            <PaymentIcon size={12} />
                            {paymentConfig.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-sm text-slate-800">{formatDate(order.orderDate)}</p>
                            <p className="text-xs text-slate-500">{formatTime(order.orderDate)}</p>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-semibold text-blue-600">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(order)}
                            className="gap-1"
                          >
                            <Eye size={14} />
                            Chi tiết
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {(totalPages > 1 || totalElements > 0) && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="flex items-center gap-4">
                <p className="text-sm text-slate-500">
                  Hiển thị {page * pageSize + 1} - {Math.min((page + 1) * pageSize, totalElements)} trên {totalElements}
                </p>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-slate-500">Số dòng/trang:</Label>
                  <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(0); }}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="200">200</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft size={16} />
                  Trước
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + Math.max(0, Math.min(page - 2, totalPages - 5));
                    if (pageNum >= totalPages) return null;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Sau
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="text-blue-600" size={20} />
              Chi tiết đơn hàng
            </DialogTitle>
            <DialogDescription>
              {selectedOrder?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          
          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : orderDetails ? (
            <div className="space-y-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Ngày & Giờ</p>
                  <p className="font-medium">
                    {formatDate(orderDetails.orderDate)} {formatTime(orderDetails.orderDate)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Thu ngân</p>
                  <p className="font-medium">{orderDetails.cashierName || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Khách hàng</p>
                  <p className="font-medium">{orderDetails.customerName || 'Khách lẻ'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Thanh toán</p>
                  <p className="font-medium">
                    {PAYMENT_METHODS[orderDetails.paymentMethod]?.label || orderDetails.paymentMethod}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Sản phẩm</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {orderDetails.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm bg-slate-50 p-2 rounded">
                      <div>
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-slate-500 ml-2">× {item.quantity}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tạm tính</span>
                  <span>{formatCurrency(orderDetails.subtotal)}</span>
                </div>
                {orderDetails.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatCurrency(orderDetails.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">VAT</span>
                  <span>{formatCurrency(orderDetails.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-blue-600 border-t pt-2">
                  <span>Tổng cộng</span>
                  <span>{formatCurrency(orderDetails.totalAmount)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDetailDialogOpen(false)}
                >
                  Đóng
                </Button>
                <Button className="flex-1 gap-2" onClick={() => window.print()}>
                  <Printer size={16} />
                  In hóa đơn
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-500 py-4">
              Không thể tải chi tiết đơn hàng
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
