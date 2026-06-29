import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Home, 
  ShoppingCart,
  Receipt,
  AlertTriangle,
  Printer,
} from 'lucide-react';
import vnpayService from '@/services/vnpayService';
import { salesService } from '@/services/salesService';

/**
 * VNPay Return Page
 * Handles the redirect from VNPay after payment
 */

const formatCurrency = (value) => {
  if (!value && value !== 0) return '₫0';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function VNPayReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        // Convert searchParams to object
        const params = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });
        
        // Process the return
        const response = await vnpayService.processReturn(params);
        setResult(response);
        
        // If payment successful, load order details
        if (response.code === '00' && response.txnRef) {
          try {
            setLoadingOrder(true);
            const orderResponse = await salesService.getSalesOrderById(response.txnRef);
            setOrderDetails(orderResponse.data);
          } catch (err) {
            console.error('Error loading order details:', err);
            // Don't show error, just continue without order details
          } finally {
            setLoadingOrder(false);
          }
        }
        
        // Clear pending order from localStorage
        localStorage.removeItem('pendingVnpayOrder');
        
      } catch (err) {
        console.error('Error processing VNPay return:', err);
        setError('Không thể xử lý kết quả thanh toán');
      } finally {
        setLoading(false);
      }
    };

    processPaymentReturn();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-16 h-16 animate-spin text-purple-600 mb-4" />
            <h2 className="text-xl font-semibold text-slate-800">Đang xử lý thanh toán...</h2>
            <p className="text-slate-500 mt-2">Vui lòng không đóng trang này</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Lỗi xử lý thanh toán</h2>
            <p className="text-slate-500 text-center mb-6">{error}</p>
            <Button onClick={() => navigate('/checkout')} className="gap-2">
              <ShoppingCart size={18} />
              Quay lại thanh toán
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSuccess = result?.code === '00';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isSuccess 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50' 
        : 'bg-gradient-to-br from-red-50 to-orange-50'
    }`}>
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="py-8">
          {/* Status Icon */}
          <div className="flex flex-col items-center mb-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
              isSuccess ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isSuccess ? (
                <CheckCircle2 className="w-14 h-14 text-green-600" />
              ) : (
                <XCircle className="w-14 h-14 text-red-600" />
              )}
            </div>
            <h2 className={`text-2xl font-bold ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
              {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
            </h2>
            <p className="text-slate-500 mt-1">
              {result?.message || vnpayService.getResponseMessage(result?.responseCode)}
            </p>
          </div>

          {/* Transaction Details */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Mã đơn hàng:</span>
              <span className="font-medium">#{result?.txnRef}</span>
            </div>
            {result?.transactionNo && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Mã giao dịch VNPay:</span>
                <span className="font-medium">{result.transactionNo}</span>
              </div>
            )}
            {result?.amount && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Số tiền:</span>
                <span className="font-bold text-lg text-purple-600">
                  {formatCurrency(result.amount)}
                </span>
              </div>
            )}
            {result?.bankCode && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Ngân hàng:</span>
                <span className="font-medium">{result.bankCode}</span>
              </div>
            )}
            {result?.payDate && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Thời gian:</span>
                <span className="font-medium">
                  {result.payDate.replace(
                    /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
                    '$3/$2/$1 $4:$5:$6'
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-slate-500">Trạng thái:</span>
              <span className={`font-medium px-2 py-0.5 rounded text-xs ${
                isSuccess 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {isSuccess ? 'Thành công' : 'Thất bại'}
              </span>
            </div>
          </div>

          {/* VNPay Logo */}
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-6">
            <span className="text-sm">Thanh toán qua</span>
            <span className="font-bold text-purple-600">VNPAY</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {isSuccess && orderDetails && (
              <Button
                className="w-full gap-2 bg-gradient-to-r from-blue-600 to-blue-700"
                onClick={() => setIsReceiptDialogOpen(true)}
                disabled={loadingOrder}
              >
                {loadingOrder ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <Receipt size={18} />
                    Xem hóa đơn
                  </>
                )}
              </Button>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => navigate('/')}
              >
                <Home size={18} />
                Trang chủ
              </Button>
              <Button
                className={`flex-1 gap-2 ${
                  isSuccess 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                    : 'bg-gradient-to-r from-purple-600 to-blue-600'
                }`}
                onClick={() => navigate('/checkout')}
              >
                {isSuccess ? (
                  <>
                    <ShoppingCart size={18} />
                    Đơn hàng mới
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    Thử lại
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Dialog */}
      {isSuccess && orderDetails && (
        <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
          <DialogContent className="max-w-md print:max-w-full print:shadow-none">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 size={24} />
                Hóa Đơn Thanh Toán
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 print:text-black">
              {/* Receipt Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-bold">HÓA ĐƠN BÁN HÀNG</h2>
                <p className="text-sm text-slate-500">
                  Số: {orderDetails.invoiceNumber}
                </p>
                <p className="text-sm text-slate-500">
                  Ngày: {new Date(orderDetails.orderDate).toLocaleString('vi-VN')}
                </p>
              </div>

              {/* Order Info */}
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Thu ngân:</span>
                  <span>{orderDetails.cashierName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Khách hàng:</span>
                  <span>{orderDetails.customerName || 'Khách lẻ'}</span>
                </div>
                {result?.transactionNo && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Mã GD VNPay:</span>
                    <span className="font-mono text-xs">{result.transactionNo}</span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="border-t border-b py-2 space-y-2">
                {orderDetails.details?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <span>{item.productName}</span>
                      <span className="text-slate-500 ml-2">
                        × {item.quantity}
                      </span>
                    </div>
                    <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tạm tính:</span>
                  <span>{formatCurrency(orderDetails.subtotal)}</span>
                </div>
                {orderDetails.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{formatCurrency(orderDetails.discountAmount)}</span>
                  </div>
                )}
                {orderDetails.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">VAT:</span>
                    <span>{formatCurrency(orderDetails.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Tổng cộng:</span>
                  <span>{formatCurrency(orderDetails.totalAmount)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-600">Thanh toán:</span>
                  <span className="font-medium">VNPay</span>
                </div>
                {result?.bankCode && (
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Ngân hàng:</span>
                    <span>{result.bankCode}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-slate-400 pt-4 border-t">
                <p>Cảm ơn quý khách đã mua hàng!</p>
                <p className="mt-1">Thanh toán qua VNPay</p>
              </div>

              {/* Print Button */}
              <div className="flex gap-2 print:hidden">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsReceiptDialogOpen(false)}
                >
                  Đóng
                </Button>
                <Button
                  className="flex-1 gap-2 bg-gradient-to-r from-blue-600 to-blue-700"
                  onClick={() => window.print()}
                >
                  <Printer size={16} />
                  In hóa đơn
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
