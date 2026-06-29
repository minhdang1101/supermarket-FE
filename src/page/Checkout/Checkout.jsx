import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  Plus, 
  Minus, 
  Printer, 
  Search,
  ScanLine,
  User,
  CreditCard,
  Banknote,
  QrCode,
  Tag,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Package,
} from 'lucide-react';
import { checkoutService } from '@/services/checkoutService';
import { categoryService } from '@/services/categoryService';
import vnpayService from '@/services/vnpayService';
import { toast } from 'sonner';

/**
 * POS Checkout Page - Point of Sale Interface
 * 
 * Features:
 * - Barcode scanning support
 * - Product search with category filter
 * - Cart management with quantity controls
 * - Promotion code application
 * - Member card integration
 * - Multiple payment methods (Cash/Card)
 * - Receipt generation
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

// Payment method config
const PAYMENT_METHODS = {
  CASH: { label: 'Tiền mặt', icon: Banknote, color: 'bg-green-500' },
  CARD: { label: 'Thẻ', icon: CreditCard, color: 'bg-blue-500' },
  VNPAY: { label: 'VNPay', icon: QrCode, color: 'bg-purple-500' },
};

export default function CheckoutPage() {
  // Product search state
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
  // Cart state
  const [cart, setCart] = useState([]);
  
  // Checkout state
  const [promoCode, setPromoCode] = useState('');
  const [memberCardId, setMemberCardId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [receivedAmount, setReceivedAmount] = useState('');
  
  // Calculated totals
  const [totals, setTotals] = useState({
    subtotal: 0,
    discountAmount: 0,
    discountDescription: '',
    taxRate: 10,
    taxAmount: 0,
    totalAmount: 0,
    changeAmount: 0,
  });
  
  // Dialog states
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  
  // Barcode input ref
  const barcodeInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.getAll();
        setCategories(response.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Search products with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const params = {
        query: searchQuery || undefined,
        categoryId: selectedCategory || undefined,
        page: 0,
        size: 50,
      };
      const response = await checkoutService.searchProducts(params);
      setProducts(response.data?.content || []);
    } catch (err) {
      console.error('Failed to load products:', err);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setProductsLoading(false);
    }
  };

  // Handle barcode scan
  const handleBarcodeScan = async (barcode) => {
    if (!barcode.trim()) return;
    
    try {
      const response = await checkoutService.getProductByBarcode(barcode.trim());
      const product = response.data;
      
      if (product) {
        addToCart(product);
        toast.success(`Đã thêm: ${product.name}`);
      }
    } catch (err) {
      console.error('Barcode scan error:', err);
      toast.error('Không tìm thấy sản phẩm với mã vạch này');
    }
  };

  // Add product to cart
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.productId === product.productId);
      
      // Check stock
      const currentQty = existing ? existing.quantity : 0;
      if (currentQty >= product.stockLevel) {
        toast.error(`Chỉ còn ${product.stockLevel} sản phẩm trong kho`);
        return prevCart;
      }
      
      if (existing) {
        return prevCart.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Update cart quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => {
          if (item.productId === productId) {
            // Check stock
            if (quantity > item.stockLevel) {
              toast.error(`Chỉ còn ${item.stockLevel} sản phẩm trong kho`);
              return item;
            }
            return { ...item, quantity };
          }
          return item;
        })
      );
    }
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  // Calculate totals when cart or promo changes
  const calculateTotals = useCallback(async () => {
    if (cart.length === 0) {
      setTotals({
        subtotal: 0,
        discountAmount: 0,
        discountDescription: '',
        taxRate: 10,
        taxAmount: 0,
        totalAmount: 0,
        changeAmount: 0,
      });
      return;
    }

    try {
      const request = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        promoCode: promoCode || undefined,
        memberCardId: memberCardId || undefined,
        paymentMethod,
        receivedAmount: receivedAmount ? parseFloat(receivedAmount) : undefined,
      };

      const response = await checkoutService.calculateTotal(request);
      const data = response.data;
      
      setTotals({
        subtotal: data.subtotal || 0,
        discountAmount: data.discountAmount || 0,
        discountDescription: data.discountDescription || '',
        taxRate: data.taxRate || 10,
        taxAmount: data.taxAmount || 0,
        totalAmount: data.totalAmount || 0,
        changeAmount: data.changeAmount || 0,
        customerName: data.customerName,
        loyaltyPoints: data.loyaltyPoints,
        promotionName: data.promotionName,
      });
    } catch (err) {
      console.error('Calculate error:', err);
      // Fallback to local calculation
      const subtotal = cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
      const taxAmount = subtotal * 0.1;
      setTotals({
        subtotal,
        discountAmount: 0,
        discountDescription: '',
        taxRate: 10,
        taxAmount,
        totalAmount: subtotal + taxAmount,
        changeAmount: 0,
      });
    }
  }, [cart, promoCode, memberCardId, paymentMethod, receivedAmount]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  // Complete checkout
  const handleCompleteCheckout = async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);
    try {
      const request = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        promoCode: promoCode || undefined,
        memberCardId: memberCardId || undefined,
        paymentMethod: paymentMethod === 'VNPAY' ? 'CARD' : paymentMethod, // Temporary payment method for order creation
        receivedAmount: paymentMethod === 'CASH' && receivedAmount 
          ? parseFloat(receivedAmount) 
          : undefined,
      };

      const response = await checkoutService.completeCheckout(request);
      const order = response.data;
      
      // If VNPay selected, redirect to VNPay payment gateway
      if (paymentMethod === 'VNPAY') {
        const vnpayRequest = {
          orderId: order.orderId,
          amount: order.totalAmount,
          orderInfo: `Thanh toan don hang #${order.invoiceNumber}`,
          language: 'vn',
        };
        
        const vnpayResponse = await vnpayService.createPayment(vnpayRequest);
        
        if (vnpayResponse.code === '00' && vnpayResponse.paymentUrl) {
          // Store order info in localStorage for return page
          localStorage.setItem('pendingVnpayOrder', JSON.stringify({
            orderId: order.orderId,
            invoiceNumber: order.invoiceNumber,
          }));
          
          // Redirect to VNPay
          window.location.href = vnpayResponse.paymentUrl;
          return;
        } else {
          toast.error(vnpayResponse.message || 'Không thể tạo thanh toán VNPay');
          return;
        }
      }
      
      // For Cash/Card payments
      setCompletedOrder(order);
      setIsPaymentDialogOpen(false);
      setIsReceiptDialogOpen(true);
      
      toast.success('Thanh toán thành công!');
      
      // Reset cart
      setCart([]);
      setPromoCode('');
      setMemberCardId('');
      setReceivedAmount('');
      
    } catch (err) {
      console.error('Checkout error:', err);
      const errorMsg = err.response?.data?.message || 'Không thể hoàn tất thanh toán';
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Print receipt
  const handlePrintReceipt = () => {
    window.print();
  };

  // Clear cart
  const handleClearCart = () => {
    setCart([]);
    setPromoCode('');
    setMemberCardId('');
    setReceivedAmount('');
    toast.info('Đã xóa giỏ hàng');
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <ShoppingCart size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Thu Ngân POS</h1>
              <p className="text-sm text-blue-100">Point of Sale System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Barcode Scanner Input */}
            <div className="relative">
              <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" size={18} />
              <Input
                ref={barcodeInputRef}
                placeholder="Quét mã vạch..."
                className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleBarcodeScan(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left Side: Product Grid */}
        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Search & Category Filter */}
          <div className="p-4 border-b space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                ref={searchInputRef}
                placeholder="Tìm sản phẩm theo tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="flex-shrink-0"
              >
                Tất cả
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.categoryId}
                  variant={selectedCategory === cat.categoryId ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.categoryId)}
                  className="flex-shrink-0"
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <ScrollArea className="flex-1 p-4">
            {productsLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <Package size={48} className="mb-2" />
                <p>Không tìm thấy sản phẩm</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {products.map((product) => (
                  <button
                    key={product.productId}
                    onClick={() => addToCart(product)}
                    disabled={product.stockLevel <= 0}
                    className={`relative p-3 bg-white border rounded-xl transition-all text-left group ${
                      product.stockLevel <= 0 
                        ? 'opacity-50 cursor-not-allowed border-red-200' 
                        : 'hover:border-blue-500 hover:shadow-md'
                    }`}
                  >
                    {/* Promotion Badge */}
                    {product.hasPromotion && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow">
                        {product.promotionBadge}
                      </div>
                    )}
                    
                    {/* Product Image */}
                    <div className="aspect-square bg-slate-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="text-slate-300" size={32} />
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <h3 className="font-medium text-sm text-slate-800 truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-2">{product.categoryName}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-bold">
                        {formatCurrency(product.sellingPrice)}
                      </span>
                      <span className={`text-xs ${
                        product.stockLevel <= 5 ? 'text-red-500' : 'text-slate-400'
                      }`}>
                        SL: {product.stockLevel}
                      </span>
                    </div>

                    {/* Out of stock overlay */}
                    {product.stockLevel <= 0 && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                        <span className="text-red-500 font-medium">Hết hàng</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Side: Cart & Checkout */}
        <div className="w-full lg:w-[420px] flex flex-col bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Cart Header */}
          <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-800">Giỏ hàng</h2>
              {cart.length > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} SP
                </Badge>
              )}
            </div>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearCart}>
                <X size={16} className="mr-1" />
                Xóa
              </Button>
            )}
          </div>

          {/* Cart Items */}
          <ScrollArea className="flex-1">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <ShoppingCart size={48} className="mb-2 opacity-50" />
                <p>Giỏ hàng trống</p>
                <p className="text-sm">Quét mã vạch hoặc chọn sản phẩm</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border"
                  >
                    {/* Product Image */}
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="text-slate-300" size={20} />
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-800 truncate">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        {formatCurrency(item.sellingPrice)} × {item.quantity}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        <Minus size={12} />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        <Plus size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Promo & Member Card */}
          <div className="p-3 border-t space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  placeholder="Mã khuyến mãi"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="pl-9 text-sm"
                />
              </div>
              <div className="flex-1 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  placeholder="Mã thẻ thành viên"
                  value={memberCardId}
                  onChange={(e) => setMemberCardId(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
            </div>
            {totals.customerName && totals.customerName !== 'Khách lẻ' && (
              <div className="bg-blue-50 text-blue-700 text-sm p-2 rounded-lg flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{totals.customerName}</span>
                {totals.loyaltyPoints && (
                  <Badge variant="secondary" className="ml-auto">
                    {totals.loyaltyPoints} điểm
                  </Badge>
                )}
              </div>
            )}
            {totals.promotionName && (
              <div className="bg-green-50 text-green-700 text-sm p-2 rounded-lg flex items-center gap-2">
                <Tag size={16} />
                <span>{totals.promotionName}</span>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="p-4 border-t bg-slate-50 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Tạm tính:</span>
              <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá:</span>
                <span className="font-medium">-{formatCurrency(totals.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">VAT ({totals.taxRate}%):</span>
              <span className="font-medium">{formatCurrency(totals.taxAmount)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-lg font-bold text-blue-600">
              <span>Tổng cộng:</span>
              <span>{formatCurrency(totals.totalAmount)}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="p-4 border-t">
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Phương thức thanh toán
            </Label>
            <div className="flex gap-2">
              {Object.entries(PAYMENT_METHODS).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <Button
                    key={key}
                    variant={paymentMethod === key ? 'default' : 'outline'}
                    className={`flex-1 gap-2 ${
                      paymentMethod === key ? config.color : ''
                    }`}
                    onClick={() => setPaymentMethod(key)}
                  >
                    <Icon size={18} />
                    {config.label}
                  </Button>
                );
              })}
            </div>

            {/* Cash received input */}
            {paymentMethod === 'CASH' && (
              <div className="mt-3">
                <Label className="text-sm text-slate-600">Tiền nhận:</Label>
                <Input
                  type="number"
                  placeholder="Nhập số tiền nhận..."
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  className="mt-1"
                />
                {receivedAmount && parseFloat(receivedAmount) >= totals.totalAmount && (
                  <div className="mt-2 bg-green-50 text-green-700 p-2 rounded-lg text-sm flex justify-between">
                    <span>Tiền thừa:</span>
                    <span className="font-bold">
                      {formatCurrency(parseFloat(receivedAmount) - totals.totalAmount)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Checkout Button */}
          <div className="p-4 border-t">
            <Button
              className="w-full h-12 text-lg font-semibold gap-2 bg-gradient-to-r from-blue-600 to-blue-700"
              onClick={() => setIsPaymentDialogOpen(true)}
              disabled={cart.length === 0}
            >
              <CheckCircle2 size={22} />
              Thanh Toán
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="text-blue-600" size={24} />
              Xác Nhận Thanh Toán
            </DialogTitle>
            <DialogDescription>
              Kiểm tra thông tin đơn hàng trước khi hoàn tất
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Số sản phẩm:</span>
                <span className="font-medium">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} SP
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tạm tính:</span>
                <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span className="font-medium">-{formatCurrency(totals.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600">VAT ({totals.taxRate}%):</span>
                <span className="font-medium">{formatCurrency(totals.taxAmount)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold text-blue-600">
                <span>Tổng cộng:</span>
                <span>{formatCurrency(totals.totalAmount)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-600">Phương thức:</span>
                <span className="font-medium capitalize">
                  {PAYMENT_METHODS[paymentMethod]?.label}
                </span>
              </div>
              {paymentMethod === 'CASH' && receivedAmount && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tiền nhận:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(receivedAmount))}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Tiền thừa:</span>
                    <span className="font-bold">
                      {formatCurrency(Math.max(0, parseFloat(receivedAmount) - totals.totalAmount))}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsPaymentDialogOpen(false)}
                disabled={isProcessing}
              >
                Quay lại
              </Button>
              <Button
                className={`flex-1 gap-2 ${
                  paymentMethod === 'VNPAY' 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700'
                }`}
                onClick={handleCompleteCheckout}
                disabled={isProcessing || (paymentMethod === 'CASH' && (!receivedAmount || parseFloat(receivedAmount) < totals.totalAmount))}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Đang xử lý...
                  </>
                ) : paymentMethod === 'VNPAY' ? (
                  <>
                    <QrCode size={16} />
                    Thanh toán VNPay
                  </>
                ) : (
                  <>
                    <Printer size={16} />
                    Hoàn tất & In
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="max-w-md print:max-w-full print:shadow-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 size={24} />
              Thanh Toán Thành Công
            </DialogTitle>
          </DialogHeader>

          {completedOrder && (
            <div className="space-y-4 print:text-black">
              {/* Receipt Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-bold">HÓA ĐƠN BÁN HÀNG</h2>
                <p className="text-sm text-slate-500">
                  Số: {completedOrder.invoiceNumber}
                </p>
                <p className="text-sm text-slate-500">
                  Ngày: {new Date(completedOrder.orderDate).toLocaleString('vi-VN')}
                </p>
              </div>

              {/* Order Info */}
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Thu ngân:</span>
                  <span>{completedOrder.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Khách hàng:</span>
                  <span>{completedOrder.customerName}</span>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-b py-2 space-y-2">
                {completedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div>
                      <span>{item.productName}</span>
                      <span className="text-slate-500 ml-2">
                        × {item.quantity}
                      </span>
                    </div>
                    <span>{formatCurrency(item.lineTotal)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tạm tính:</span>
                  <span>{formatCurrency(completedOrder.subtotal)}</span>
                </div>
                {completedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{formatCurrency(completedOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">VAT:</span>
                  <span>{formatCurrency(completedOrder.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Tổng cộng:</span>
                  <span>{formatCurrency(completedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Thanh toán:</span>
                  <span>{PAYMENT_METHODS[completedOrder.paymentMethod]?.label}</span>
                </div>
                {completedOrder.paymentMethod === 'CASH' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tiền nhận:</span>
                      <span>{formatCurrency(completedOrder.receivedAmount)}</span>
                    </div>
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Tiền thừa:</span>
                      <span>{formatCurrency(completedOrder.changeAmount)}</span>
                    </div>
                  </>
                )}
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
                  className="flex-1 gap-2"
                  onClick={handlePrintReceipt}
                >
                  <Printer size={16} />
                  In hóa đơn
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
