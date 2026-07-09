import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { categoryService } from '@/services/categoryService';
import { supplierService } from '@/services/supplierService';
import { productService } from '@/services/productService';
import { getErrorMessage } from '@/services/api';

const toNumberOrNull = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export default function CreateProductPage() {
  const navigate = useNavigate();

  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [form, setForm] = useState({
    name: '',
    barcode: '',
    description: '',
    unit: '',
    costPrice: '',
    sellingPrice: '',
    categoryId: '',
    supplierId: '__none__',
    minStockLevel: '',
    maxStockLevel: '',
    status: 'true',
    stockLevel: 0,
  });

  useEffect(() => {
    const loadMeta = async () => {
      setLoadingMeta(true);
      try {
        const [catRes, supRes] = await Promise.all([
          categoryService.getAll(),
          supplierService.search(null, true, 0, 500),
        ]);

        const catData = Array.isArray(catRes.data) ? catRes.data : catRes.data?.content || [];
        const supData = Array.isArray(supRes.data) ? supRes.data : supRes.data?.content || [];

        setCategories(catData);
        setSuppliers(supData);
      } catch (e) {
        toast.error(getErrorMessage(e) || 'Không tải được danh mục/nhà cung cấp');
      } finally {
        setLoadingMeta(false);
      }
    };
    loadMeta();
  }, []);

  const isValid = useMemo(() => {
    if (!form.name.trim()) return false;
    if (!form.barcode.trim()) return false;
    if (!form.costPrice) return false;
    if (!form.sellingPrice) return false;
    if (!form.categoryId) return false;
    return true;
  }, [form]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    const payload = {
      name: form.name.trim(),
      barcode: form.barcode.trim(),
      description: form.description?.trim() || null,
      unit: form.unit?.trim() || null,
      costPrice: form.costPrice,
      sellingPrice: form.sellingPrice,
      categoryId: Number(form.categoryId),
      supplierId: form.supplierId === '__none__' ? null : Number(form.supplierId),
      stockLevel: 0,
      minStockLevel: toNumberOrNull(form.minStockLevel),
      maxStockLevel: toNumberOrNull(form.maxStockLevel),
      status: form.status === 'true',
    };

    try {
      setSubmitting(true);
      const res = await productService.create(payload);
      toast.success('Tạo sản phẩm thành công');
      const id = res.data?.productId;
      if (id) navigate(`/products/${id}`);
      else navigate('/products');
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Tạo sản phẩm thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/products')} className="gap-2">
          <ArrowLeft size={16} />
          Quay lại
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground">Thêm Sản phẩm</h1>
        <p className="text-muted-foreground mt-2">Sản phẩm mới sẽ có tồn kho mặc định là 0</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên sản phẩm *</Label>
              <Input id="name" name="name" value={form.name} onChange={onChange} placeholder="Ví dụ: Coca 330ml" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Mã vạch *</Label>
              <Input id="barcode" name="barcode" value={form.barcode} onChange={onChange} placeholder="Nhập mã vạch" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Đơn vị</Label>
              <Input id="unit" name="unit" value={form.unit} onChange={onChange} placeholder="lon / chai / gói..." />
            </div>

            <div className="space-y-2">
              <Label>Danh mục *</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm((p) => ({ ...p, categoryId: v }))}
                disabled={loadingMeta}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loadingMeta ? 'Đang tải...' : 'Chọn danh mục'} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.categoryId} value={String(c.categoryId)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nhà cung cấp</Label>
              <Select
                value={form.supplierId}
                onValueChange={(v) => setForm((p) => ({ ...p, supplierId: v }))}
                disabled={loadingMeta}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loadingMeta ? 'Đang tải...' : 'Chọn (không bắt buộc)'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Không chọn</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s.supplierId} value={String(s.supplierId)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPrice">Giá nhập *</Label>
              <Input
                id="costPrice"
                name="costPrice"
                type="number"
                step="0.0001"
                min="0"
                value={form.costPrice}
                onChange={onChange}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Giá bán *</Label>
              <Input
                id="sellingPrice"
                name="sellingPrice"
                type="number"
                step="0.0001"
                min="0"
                value={form.sellingPrice}
                onChange={onChange}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStockLevel">Tồn tối thiểu</Label>
              <Input
                id="minStockLevel"
                name="minStockLevel"
                type="number"
                min="0"
                value={form.minStockLevel}
                onChange={onChange}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStockLevel">Tồn tối đa</Label>
              <Input
                id="maxStockLevel"
                name="maxStockLevel"
                type="number"
                min="0"
                value={form.maxStockLevel}
                onChange={onChange}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Hoạt động</SelectItem>
                  <SelectItem value="false">Ẩn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tồn kho mặc định</Label>
              <Input value="0" disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Thông tin thêm về sản phẩm (không bắt buộc)"
              rows={4}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/products')}>
              Hủy
            </Button>
            <Button type="submit" disabled={!isValid || submitting || loadingMeta}>
              {submitting ? 'Đang tạo...' : 'Tạo sản phẩm'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

