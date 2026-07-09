import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { productService } from '@/services/productService';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8080';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getById(id);
      setProduct(response.data);
    } catch (err) {
      console.error('Error loading product:', err);
      setProduct(null);
      setError(err.response?.status === 404 ? 'Không tìm thấy sản phẩm' : err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (v) =>
    v != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v) : '-';

  const formatDate = (v) => (v ? new Date(v).toLocaleString('vi-VN') : '-');

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return path.startsWith('/') ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-r-transparent" />
          <span className="ml-3">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate('/products')} className="mb-4 gap-2">
          <ArrowLeft size={16} />
          Quay lại
        </Button>
        <Card className="p-8 text-center">
          <p className="text-destructive">{error || 'Không tìm thấy sản phẩm'}</p>
        </Card>
      </div>
    );
  }

  const images = product.images || [];
  const mainImage = images[0];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/products')} className="gap-2">
          <ArrowLeft size={16} />
          Quay lại danh sách
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 lg:col-span-1">
          <div className="aspect-square rounded-lg bg-muted overflow-hidden">
            {mainImage ? (
              <img
                src={getImageUrl(mainImage)}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => (e.target.style.display = 'none')}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Chưa có hình
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {images.slice(0, 5).map((img, i) => (
                <button
                  key={i}
                  className="flex-shrink-0 w-14 h-14 rounded border overflow-hidden"
                  onClick={() => {}}
                >
                  <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  product.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {product.status ? 'Hoạt động' : 'Ẩn'}
              </span>
              <span className="text-sm text-muted-foreground">ID: {product.productId}</span>
            </div>

            {product.description && (
              <p className="mt-4 text-muted-foreground">{product.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-sm text-muted-foreground">Mã vạch</p>
                <p className="font-medium">{product.barcode || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đơn vị</p>
                <p className="font-medium">{product.unit || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Danh mục</p>
                <p className="font-medium">{product.categoryName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nhà cung cấp</p>
                <p className="font-medium">{product.supplierName || '-'}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-foreground mb-4">Giá & Tồn kho</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Giá nhập</p>
                <p className="font-medium text-foreground">{formatPrice(product.costPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Giá bán</p>
                <p className="font-semibold text-primary">{formatPrice(product.sellingPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tồn kho</p>
                <p className="font-medium">{product.stockLevel ?? 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tồn tối thiểu</p>
                <p className="font-medium">{product.minStockLevel ?? '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tồn tối đa</p>
                <p className="font-medium">{product.maxStockLevel ?? '-'}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-foreground mb-4">Thời gian</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Ngày tạo</p>
                <p className="font-medium">{formatDate(product.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cập nhật</p>
                <p className="font-medium">{formatDate(product.updatedAt)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
