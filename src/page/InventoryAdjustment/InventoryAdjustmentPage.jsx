import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Package,
  AlertTriangle,
  Trash2,
  TrendingDown,
  Search,
  ClipboardList,
  Ban,
  PackageX,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '@/services/productService';
import { stockAdjustmentService, ADJUSTMENT_REASONS } from '@/services/stockAdjustmentService';
import { inventoryService } from '@/services/inventoryService';

export default function InventoryAdjustmentPage() {
  const [products, setProducts] = useState([]);
  const [adjustmentHistory, setAdjustmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    product: null,
    quantity: 1,
    reason: '',
    note: '',
  });

  const [filterReason, setFilterReason] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchAdjustmentHistory();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getActiveProducts(0, 500);
      setProducts(response.data.content || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdjustmentHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await stockAdjustmentService.getHistory(null, 0, 50);
      setAdjustmentHistory(response.data?.content || []);
    } catch (error) {
      console.error('Error fetching adjustment history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    setFormData(prev => ({
      ...prev,
      product,
      quantity: 1,
    }));
    setProductSearchOpen(false);
    setProductSearch('');
  };

  const handleQuantityChange = (value) => {
    const qty = Math.max(1, parseInt(value) || 1);
    const maxQty = formData.product?.stockLevel || 1;
    setFormData(prev => ({
      ...prev,
      quantity: Math.min(qty, maxQty),
    }));
  };

  const handleReasonChange = (value) => {
    setFormData(prev => ({ ...prev, reason: value }));
  };

  const handleNoteChange = (e) => {
    setFormData(prev => ({ ...prev, note: e.target.value }));
  };

  const validateForm = () => {
    if (!formData.product) {
      toast.error('Vui lòng chọn một sản phẩm');
      return false;
    }
    if (!formData.reason) {
      toast.error('Vui lòng chọn lý do');
      return false;
    }
    if (formData.quantity < 1) {
      toast.error('Số lượng phải ít nhất là 1');
      return false;
    }
    if (formData.quantity > formData.product.stockLevel) {
      toast.error('Số lượng không thể vượt quá tồn kho hiện tại');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await stockAdjustmentService.create(
        formData.product.productId,
        formData.quantity,
        formData.reason,
        formData.note
      );
      
      toast.success('Đã ghi nhận điều chỉnh kho thành công');
      setIsDialogOpen(false);
      setConfirmDialog(false);
      resetForm();
      fetchProducts();
      fetchAdjustmentHistory();
    } catch (error) {
      console.error('Error creating adjustment:', error);
      toast.error(error.response?.data?.message || 'Ghi nhận điều chỉnh thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      product: null,
      quantity: 1,
      reason: '',
      note: '',
    });
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredProducts = products.filter(product => {
    const searchLower = productSearch.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchLower))
    );
  });

  const getReasonIcon = (reason) => {
    const icons = {
      DAMAGED: PackageX,
      LOST: Ban,
      EXPIRED: Clock,
      THEFT: AlertTriangle,
      CONSUMPTION: Package,
      OTHER: ClipboardList,
    };
    return icons[reason] || ClipboardList;
  };

  const getReasonBadge = (reason) => {
    const configs = {
      DAMAGED: { variant: 'destructive', label: 'Hư hỏng' },
      LOST: { variant: 'secondary', label: 'Bị mất' },
      EXPIRED: { variant: 'warning', label: 'Hết hạn', className: 'bg-orange-100 text-orange-700' },
      THEFT: { variant: 'destructive', label: 'Mất trộm' },
      CONSUMPTION: { variant: 'default', label: 'Tiêu thụ' },
      OTHER: { variant: 'outline', label: 'Khác' },
    };
    const config = configs[reason] || configs.OTHER;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const historyColumns = [
    {
      key: 'adjustmentId',
      label: 'ID',
      width: 'w-16',
      render: (value) => <span className="font-mono text-sm">#{value}</span>,
    },
    {
      key: 'productName',
      label: 'Sản phẩm',
      width: 'w-48',
      render: (value, item) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">{item.barcode}</p>
        </div>
      ),
    },
    {
      key: 'quantity',
      label: 'Số lượng',
      width: 'w-24',
      render: (value) => (
        <span className="font-semibold text-destructive">-{value}</span>
      ),
    },
    {
      key: 'reason',
      label: 'Lý do',
      width: 'w-28',
      render: (value) => getReasonBadge(value),
    },
    {
      key: 'note',
      label: 'Ghi chú',
      width: 'w-40',
      render: (value) => (
        <span className="text-sm text-muted-foreground truncate block max-w-40">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'adjustedByName',
      label: 'Người điều chỉnh',
      width: 'w-28',
    },
    {
      key: 'adjustedAt',
      label: 'Ngày',
      width: 'w-36',
      render: (value) => formatDateTime(value),
    },
    {
      key: 'stockAfterAdjustment',
      label: 'Tồn sau ĐC',
      width: 'w-24',
      render: (value) => <span className="font-medium">{value}</span>,
    },
  ];

  const reasonStats = ADJUSTMENT_REASONS.reduce((acc, reason) => {
    acc[reason.value] = adjustmentHistory.filter(h => h.reason === reason.value).length;
    return acc;
  }, {});

  const totalAdjusted = adjustmentHistory.reduce((sum, h) => sum + h.quantity, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Điều chỉnh kho</h1>
        <p className="text-muted-foreground mt-2">
          Ghi nhận và quản lý các sai lệch tồn kho
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <TrendingDown size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng điều chỉnh</p>
              <p className="text-2xl font-bold text-red-600">-{totalAdjusted}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <PackageX size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hư hỏng</p>
              <p className="text-2xl font-bold text-orange-600">{reasonStats.DAMAGED || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
              <Ban size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bị mất</p>
              <p className="text-2xl font-bold text-gray-600">{reasonStats.LOST || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hết hạn</p>
              <p className="text-2xl font-bold text-yellow-600">{reasonStats.EXPIRED || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mất trộm</p>
              <p className="text-2xl font-bold text-red-600">{reasonStats.THEFT || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex gap-3">
          <Select
            value={filterReason || '__all__'}
            onValueChange={(v) => setFilterReason(v === '__all__' ? '' : v)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tất cả lý do" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tất cả lý do</SelectItem>
              {ADJUSTMENT_REASONS.map((reason) => (
                <SelectItem key={reason.value} value={reason.value}>
                  {reason.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filterReason && (
            <Button variant="outline" onClick={() => setFilterReason('')}>
              Xóa bộ lọc
            </Button>
          )}
        </div>
        <Button onClick={handleOpenDialog}>
          <Plus size={16} className="mr-2" />
          Điều chỉnh mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử điều chỉnh</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={historyColumns}
            data={filterReason 
              ? adjustmentHistory.filter(h => h.reason === filterReason)
              : adjustmentHistory
            }
            keyField="adjustmentId"
            loading={historyLoading}
            emptyMessage="No adjustment records found"
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Điều chỉnh tồn kho mới</DialogTitle>
            <DialogDescription>
              Ghi nhận sai lệch tồn kho cho hàng hóa bị hư hỏng, thất lạc hoặc hết hạn
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Chọn sản phẩm *</Label>
              <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between mt-1"
                  >
                    {formData.product ? (
                      <span>{formData.product.name}</span>
                    ) : (
                      <span className="text-muted-foreground">Tìm kiếm sản phẩm...</span>
                    )}
                    <Search size={16} className="text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Tìm theo tên hoặc mã vạch..."
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
                            onSelect={() => handleSelectProduct(product)}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {product.barcode}
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

            {formData.product && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sản phẩm đã chọn</span>
                  <Badge variant="outline">{formData.product.barcode}</Badge>
                </div>
                <p className="font-medium">{formData.product.name}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tồn kho hiện tại</span>
                  <span className="font-semibold">{formData.product.stockLevel} đơn vị</span>
                </div>
              </div>
            )}

            <div>
              <Label>Lý do *</Label>
              <Select
                value={formData.reason}
                onValueChange={handleReasonChange}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn lý do" />
                </SelectTrigger>
                <SelectContent>
                  {ADJUSTMENT_REASONS.map((reason) => {
                    const Icon = getReasonIcon(reason.value);
                    return (
                      <SelectItem key={reason.value} value={reason.value}>
                        <div className="flex items-center gap-2">
                          <Icon size={16} />
                          {reason.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Số lượng giảm trừ *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={formData.product?.stockLevel || 1}
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="mt-1"
                disabled={!formData.product}
              />
              {formData.product && (
                <p className="text-xs text-muted-foreground mt-1">
                  Tối đa: {formData.product.stockLevel} đơn vị
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={handleNoteChange}
                placeholder="Thêm chi tiết về điều chỉnh này..."
                rows={3}
                className="mt-1"
              />
            </div>

            {formData.product && formData.quantity > 0 && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle size={18} />
                  <span className="font-medium">Xem trước ảnh hưởng kho</span>
                </div>
                <div className="mt-2 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Tồn kho hiện tại:</span>
                    <span>{formData.product.stockLevel}</span>
                  </div>
                  <div className="flex justify-between text-destructive">
                    <span>Giảm trừ:</span>
                    <span>-{formData.quantity}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-1">
                    <span>Tồn kho mới:</span>
                    <span>{formData.product.stockLevel - formData.quantity}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              onClick={() => setConfirmDialog(true)}
              disabled={!formData.product || !formData.reason || submitting}
            >
              Ghi nhận điều chỉnh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận điều chỉnh kho</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>Bạn chuẩn bị trừ tồn kho:</p>
                <div className="p-3 rounded-lg bg-muted space-y-2">
                  <div className="flex justify-between">
                    <span>Sản phẩm:</span>
                    <span className="font-medium">{formData.product?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số lượng:</span>
                    <span className="font-medium text-destructive">-{formData.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lý do:</span>
                    <span className="font-medium">
                      {ADJUSTMENT_REASONS.find(r => r.value === formData.reason)?.label}
                    </span>
                  </div>
                </div>
                <p className="text-destructive">
                  Hành động này sẽ làm giảm mức tồn kho vĩnh viễn và không thể hoàn tác.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Đang xử lý...' : 'Xác nhận'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
