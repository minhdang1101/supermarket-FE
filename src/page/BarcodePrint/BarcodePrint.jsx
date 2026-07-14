import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterBar } from '@/components/common/filter-bar';
import { Printer, Plus, Trash2 } from 'lucide-react';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { barcodeService } from '@/services/barcodeService';

export default function BarcodePrintPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [printItems, setPrintItems] = useState([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [keyword, categoryId]);

  const loadCategories = async () => {
    try {
      const res = await categoryService.getAll();
      const data = Array.isArray(res.data) ? res.data : res.data?.content || [];
      setCategories(data);
    } catch (e) {
      console.error('Error loading categories:', e);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = { page: 0, size: 100, sortBy: 'name', sortDir: 'asc' };
      if (keyword?.trim()) params.keyword = keyword.trim();
      if (categoryId && categoryId !== 'all') params.categoryId = parseInt(categoryId);

      const response = await productService.search(params);
      const content = response.data.content || [];
      setProducts(content);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => setKeyword(value);
  const handleFilterChange = (key, value) => {
    if (key === 'categoryId') setCategoryId(value);
  };
  const handleReset = () => {
    setKeyword('');
    setCategoryId('all');
  };

  const addToPrintList = (product, qty = 1) => {
    const q = Math.max(1, parseInt(qty) || 1);
    if (!product.barcode?.trim()) {
      alert(`Sản phẩm "${product.name}" chưa có mã vạch. Không thể in nhãn.`);
      return;
    }
    setPrintItems((prev) => {
      const existing = prev.find((p) => p.productId === product.productId);
      if (existing) {
        return prev.map((p) =>
          p.productId === product.productId ? { ...p, quantity: p.quantity + q } : p
        );
      }
      return [...prev, { productId: product.productId, name: product.name, barcode: product.barcode, quantity: q }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    const q = Math.max(1, parseInt(quantity) || 1);
    setPrintItems((prev) =>
      prev.map((p) => (p.productId === productId ? { ...p, quantity: q } : p))
    );
  };

  const removeFromPrintList = (productId) => {
    setPrintItems((prev) => prev.filter((p) => p.productId !== productId));
  };

  const handlePrintPdf = async () => {
    if (printItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để in nhãn.');
      return;
    }
    setGenerating(true);
    try {
      const items = printItems.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
      }));
      const response = await barcodeService.generateLabelsPdf(items);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (win) {
        win.onload = () => win.print();
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = 'barcode-labels.pdf';
        a.click();
      }
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Lỗi tạo file PDF: ' + (error.response?.data?.message || error.message));
    } finally {
      setGenerating(false);
    }
  };

  const formatPrice = (v) =>
    v != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v) : '-';

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">In nhãn mã vạch</h1>
        <p className="text-muted-foreground mt-2">
          Chọn sản phẩm và in nhãn mã vạch (PDF)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Danh sách sản phẩm */}
        <Card className="p-6">
          <h2 className="font-semibold text-foreground mb-4">Chọn sản phẩm</h2>
          <FilterBar
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            filters={[
              {
                key: 'categoryId',
                label: 'Danh mục',
                defaultValue: 'all',
                options: [
                  { label: 'Tất cả', value: 'all' },
                  ...categories.map((c) => ({ label: c.name, value: String(c.categoryId) })),
                ],
              },
            ]}
            onReset={handleReset}
          />

          <div className="mt-4 max-h-96 overflow-y-auto border rounded-md">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Đang tải...</div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Không có sản phẩm</div>
            ) : (
              <div className="divide-y">
                {products.map((p) => (
                  <div
                    key={p.productId}
                    className="flex items-center justify-between gap-4 p-3 hover:bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.barcode || 'Chưa có mã vạch'} · {formatPrice(p.sellingPrice)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addToPrintList(p)}
                      disabled={!p.barcode?.trim()}
                    >
                      <Plus size={16} className="mr-1" />
                      Thêm
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Danh sách in */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Danh sách in ({printItems.length})</h2>
            <Button
              onClick={handlePrintPdf}
              disabled={printItems.length === 0 || generating}
              className="gap-2"
            >
              <Printer size={16} />
              {generating ? 'Đang tạo...' : 'In PDF'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            Sản phẩm không có mã vạch sẽ bị bỏ qua khi tạo PDF.
          </p>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {printItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Chưa chọn sản phẩm</p>
            ) : (
              printItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between gap-4 p-3 border rounded-md"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.barcode}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      className="w-20"
                      onChange={(e) => updateQuantity(item.productId, e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromPrintList(item.productId)}
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
