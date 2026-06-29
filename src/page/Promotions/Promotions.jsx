import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, Column, Action } from '@/components/common/data-table';
import { Plus, Trash2, Edit2, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { promotionService } from '@/services/promotionService';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountType: '',
    discountValue: '',
    applyTarget: '',
    categoryId: '',
    productIds: [],
    buyQuantity: '',
    getQuantity: '',
    getProductId: '',
    minOrderAmount: '',
    validFrom: '',
    validTo: '',
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      console.log('🔵 Loading promotions from API...');
      const response = await promotionService.search();
      const data = response.data;
      const promotionsList = data.content || data || [];
      console.log('✅ Promotions loaded:', promotionsList);
      
      const mappedPromotions = promotionsList.map((p) => ({
        id: p.promotionId,
        promotionId: p.promotionId,
        name: p.name,
        code: p.promoCode,
        type: p.discountType,
        discountValue: p.discountType === 'PERCENTAGE' 
          ? `${p.discountValue}%` 
          : p.discountType === 'FIXED_AMOUNT'
          ? `₫${p.discountValue}`
          : p.discountType === 'BUY_X_GET_Y'
          ? `Buy ${p.buyQuantity} Get ${p.getQuantity}`
          : p.discountValue,
        applicableTo: p.applyTarget === 'CATEGORY' 
          ? p.categoryName || 'Danh mục'
          : p.productNames?.join(', ') || 'Sản phẩm',
        startDate: p.validFrom,
        endDate: p.validTo,
        status: p.currentlyActive ? 'active' : new Date(p.validTo) < new Date() ? 'expired' : 'upcoming',
        description: p.description,
        discountType: p.discountType,
        applyTarget: p.applyTarget,
      }));
      setPromotions(mappedPromotions);
    } catch (error) {
      console.error('❌ Error loading promotions:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Bạn có chắc muốn xóa promotion "${item.name}"?`)) {
      return;
    }
    try {
      console.log('🔵 Deleting promotion:', item.promotionId || item.id);
      await promotionService.delete(item.promotionId || item.id);
      console.log('✅ Promotion deleted');
      loadPromotions();
    } catch (error) {
      console.error('❌ Error deleting promotion:', error);
      alert('Lỗi khi xóa promotion: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCreate = async () => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description || '',
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        applyTarget: formData.applyTarget,
        validFrom: formData.validFrom,
        validTo: formData.validTo,
      };

      if (formData.applyTarget === 'CATEGORY' && formData.categoryId) {
        payload.categoryId = parseInt(formData.categoryId);
      } else if (formData.applyTarget === 'PRODUCT' && formData.productIds) {
        payload.productIds = Array.isArray(formData.productIds) 
          ? formData.productIds.map(id => parseInt(id))
          : [parseInt(formData.productIds)];
      }

      if (formData.discountType === 'BUY_X_GET_Y') {
        payload.buyQuantity = parseInt(formData.buyQuantity);
        payload.getQuantity = parseInt(formData.getQuantity);
        payload.getProductId = parseInt(formData.getProductId);
      }

      if (formData.minOrderAmount) {
        payload.minOrderAmount = parseFloat(formData.minOrderAmount);
      }

      console.log('🔵 Creating promotion:', payload);
      await promotionService.create(payload);
      console.log('✅ Promotion created');
      setIsDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        discountType: '',
        discountValue: '',
        applyTarget: '',
        categoryId: '',
        productIds: [],
        buyQuantity: '',
        getQuantity: '',
        getProductId: '',
        minOrderAmount: '',
        validFrom: '',
        validTo: '',
      });
      loadPromotions();
    } catch (error) {
      console.error('❌ Error creating promotion:', error);
      alert('Lỗi khi tạo promotion: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Đang chạy';
      case 'upcoming':
        return 'Sắp tới';
      case 'expired':
        return 'Hết hạn';
      default:
        return status;
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Tên khuyến mãi',
      width: 'w-40',
      render: (value, item) => (
        <div>
          <p className="font-medium">{value}</p>
          {item.code && (
            <p className="text-xs text-muted-foreground">Code: {item.code}</p>
          )}
        </div>
      ),
    },
    { key: 'type', label: 'Loại', width: 'w-24' },
    {
      key: 'discountValue',
      label: 'Giảm giá',
      width: 'w-24',
      render: (value) => <span className="font-semibold text-primary">{value}</span>,
    },
    { key: 'applicableTo', label: 'Áp dụng cho', width: 'w-32' },
    {
      key: 'startDate',
      label: 'Thời hạn',
      width: 'w-32',
      render: (value, item) => (
        <div className="flex items-center gap-1 text-sm">
          <Calendar size={14} />
          <span>
            {value ? new Date(value).toLocaleDateString('vi-VN') : '-'} -{' '}
            {item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      width: 'w-20',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {getStatusLabel(value)}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: 'Xóa',
      onClick: handleDelete,
      variant: 'destructive',
    },
  ];

  const activePromos = promotions.filter((p) => p.status === 'active').length;
  const upcomingPromos = promotions.filter((p) => p.status === 'upcoming').length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản lý Khuyến mãi</h1>
        <p className="text-muted-foreground mt-2">
          Tạo và quản lý các chiến dịch khuyến mãi và quy tắc giảm giá
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Tổng khuyến mãi</p>
          <p className="text-2xl font-bold text-foreground mt-1">{promotions.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Đang chạy</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activePromos}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Sắp tới</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{upcomingPromos}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Hết hạn</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">
            {promotions.filter((p) => p.status === 'expired').length}
          </p>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus size={16} />
            Tạo khuyến mãi
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo Khuyến Mãi Mới</DialogTitle>
            <DialogDescription>
              Thiết lập chiến dịch khuyến mãi hoặc quy tắc giảm giá mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="promoName">Tên khuyến mãi *</Label>
              <Input
                id="promoName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Giảm giá mùa hè 50%"
              />
            </div>
            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chương trình"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discountType">Loại giảm giá *</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value) => setFormData({ ...formData, discountType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Giảm theo phần trăm (%)</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Số tiền cố định</SelectItem>
                    <SelectItem value="BUY_X_GET_Y">Mua X tặng Y</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discountValue">Giá trị giảm *</Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  placeholder="E.g., 50"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="applyTarget">Đối tượng áp dụng *</Label>
              <Select
                value={formData.applyTarget}
                onValueChange={(value) => setFormData({ ...formData, applyTarget: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đối tượng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CATEGORY">Danh mục</SelectItem>
                  <SelectItem value="PRODUCT">Sản phẩm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.discountType === 'BUY_X_GET_Y' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="buyQuantity">Số lượng mua *</Label>
                  <Input
                    id="buyQuantity"
                    type="number"
                    value={formData.buyQuantity}
                    onChange={(e) => setFormData({ ...formData, buyQuantity: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="getQuantity">Số lượng tặng *</Label>
                  <Input
                    id="getQuantity"
                    type="number"
                    value={formData.getQuantity}
                    onChange={(e) => setFormData({ ...formData, getQuantity: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="getProductId">ID sản phẩm tặng *</Label>
                  <Input
                    id="getProductId"
                    type="number"
                    value={formData.getProductId}
                    onChange={(e) => setFormData({ ...formData, getProductId: e.target.value })}
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validFrom">Ngày bắt đầu *</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="validTo">Ngày kết thúc *</Label>
                <Input
                  id="validTo"
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="minOrderAmount">Giá trị đơn tối thiểu</Label>
              <Input
                id="minOrderAmount"
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                placeholder="Tùy chọn"
              />
            </div>
            <Button onClick={handleCreate} className="w-full">
              Tạo Khuyến Mãi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DataTable
        columns={columns}
        data={promotions}
        actions={actions}
        keyField="id"
        loading={loading}
        emptyMessage="Không tìm thấy khuyến mãi nào. Hãy tạo khuyến mãi đầu tiên!"
        pageSize={15}
      />
    </div>
  );
}
