import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Package,
  DollarSign,
  Calendar,
  Building2,
  Search,
  ShoppingCart,
  Save,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { supplierService } from '@/services/supplierService';
import { productService } from '@/services/productService';
import { purchaseOrderService } from '@/services/purchaseOrderService';

export default function CreatePurchaseOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedSupplierId = location.state?.supplierId;

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const [formData, setFormData] = useState({
    supplierId: preSelectedSupplierId || '',
    expectedDeliveryDate: '',
    note: '',
  });

  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.search('', 'ACTIVE', 0, 100);
      setSuppliers(response.data.content || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Không thể tải danh sách nhà cung cấp');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productService.getActiveProducts(0, 500);
      setProducts(response.data.content || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    }
  };

  const handleSupplierChange = (value) => {
    setFormData(prev => ({ ...prev, supplierId: value }));
    setOrderItems([]);
  };

  const handleAddProduct = (product) => {
    if (orderItems.find(item => item.productId === product.productId)) {
      toast.error('Sản phẩm đã được thêm');
      return;
    }

    setOrderItems(prev => [
      ...prev,
      {
        productId: product.productId,
        productName: product.name,
        barcode: product.barcode,
        costPrice: product.costPrice || 0,
        quantity: 1,
        totalPrice: product.costPrice || 0,
      },
    ]);
    setProductSearchOpen(false);
    setProductSearch('');
  };

  const handleQuantityChange = (productId, quantity) => {
    const qty = Math.max(1, parseInt(quantity) || 1);
    setOrderItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: qty, totalPrice: qty * item.costPrice }
          : item
      )
    );
  };

  const handleRemoveProduct = (productId) => {
    setOrderItems(prev => prev.filter(item => item.productId !== productId));
  };

  const calculateTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const validateForm = () => {
    if (!formData.supplierId) {
      toast.error('Vui lòng chọn nhà cung cấp');
      return false;
    }
    if (orderItems.length === 0) {
      toast.error('Vui lòng thêm ít nhất một sản phẩm');
      return false;
    }
    return true;
  };

  const handleSubmit = async (status = 'DRAFT') => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        supplierId: Number(formData.supplierId),
        expectedDeliveryDate: formData.expectedDeliveryDate || null,
        note: formData.note || '',
        items: orderItems.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity) || 1,
        })),
      };

      const response = await purchaseOrderService.create(payload);
      const poId = response.data.poId;

      if (status === 'SENT') {
        await purchaseOrderService.updateStatus(poId, 'SENT');
        toast.success('Đã tạo đơn nhập hàng và gửi đến nhà cung cấp');
      } else {
        toast.success('Đã lưu đơn nhập hàng thành bản nháp');
      }

      navigate('/purchase-orders');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.message || 'Tạo đơn nhập hàng thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const searchLower = productSearch.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchLower))
    );
  });

  const selectedSupplier = suppliers.find(s => String(s.supplierId) === String(formData.supplierId));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/purchase-orders')}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tạo đơn nhập hàng</h1>
          <p className="text-muted-foreground mt-1">Tạo phiếu yêu cầu nhập hàng mới</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 size={20} />
                Chọn nhà cung cấp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Chọn nhà cung cấp *</Label>
                <Select
                  value={formData.supplierId}
                  onValueChange={handleSupplierChange}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn một nhà cung cấp" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.supplierId} value={String(supplier.supplierId)}>
                        <div className="flex flex-col">
                          <span>{supplier.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {supplier.contactPerson} - {supplier.phone}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedSupplier && (
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <p className="font-medium">{selectedSupplier.name}</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Liên hệ: {selectedSupplier.contactPerson || '-'}</p>
                    <p>SĐT: {selectedSupplier.phone || '-'}</p>
                    <p>Email: {selectedSupplier.email || '-'}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expectedDeliveryDate">Ngày nhận hàng dự kiến</Label>
                  <Input
                    id="expectedDeliveryDate"
                    type="date"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Nhập ghi chú thêm cho đơn hàng này..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package size={20} />
                  Danh sách sản phẩm
                </CardTitle>
                <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button disabled={!formData.supplierId}>
                      <Plus size={16} className="mr-2" />
                      Thêm sản phẩm
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96 p-0" align="end">
                    <Command>
                      <CommandInput
                        placeholder="Tìm kiếm sản phẩm..."
                        value={productSearch}
                        onValueChange={setProductSearch}
                      />
                      <CommandList>
                        <CommandEmpty>Không tìm thấy sản phẩm nào.</CommandEmpty>
                        <CommandGroup>
                          {filteredProducts.slice(0, 10).map((product) => (
                            <CommandItem
                              key={product.productId}
                              value={product.name}
                              onSelect={() => handleAddProduct(product)}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center justify-between w-full">
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {product.barcode} • {formatCurrency(product.costPrice)}
                                  </p>
                                </div>
                                <Badge variant="outline">
                                  Stock: {product.stockLevel}
                                </Badge>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent>
              {orderItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Chưa có sản phẩm nào được thêm</p>
                  <p className="text-sm">Vui lòng chọn nhà cung cấp và thêm sản phẩm vào đơn hàng</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="w-24">Giá nhập</TableHead>
                      <TableHead className="w-28">Số lượng</TableHead>
                      <TableHead className="w-32 text-right">Tổng tiền</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">{item.barcode}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatCurrency(item.costPrice)}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.totalPrice)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleRemoveProduct(item.productId)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign size={20} />
                Tổng hợp đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Số loại hàng</span>
                  <span>{orderItems.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tổng số lượng</span>
                  <span>{orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Tổng tiền dự kiến</span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(calculateTotalAmount())}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleSubmit('DRAFT')}
                  disabled={submitting || orderItems.length === 0}
                >
                  <Save size={16} className="mr-2" />
                  Lưu bản nháp
                </Button>
                <Button
                  className="w-full"
                  onClick={() => handleSubmit('SENT')}
                  disabled={submitting || orderItems.length === 0}
                >
                  <Send size={16} className="mr-2" />
                  Tạo & Gửi đơn hàng
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Đơn hàng bản nháp có thể chỉnh sửa trước khi gửi cho nhà cung cấp
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
