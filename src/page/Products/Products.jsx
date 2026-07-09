import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/data-table';
import { FilterBar } from '@/components/common/filter-bar';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, keyword, categoryId, status]);

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
      const params = {
        page,
        size,
        sortBy: 'productId',
        sortDir: 'desc',
      };
      if (keyword?.trim()) params.keyword = keyword.trim();
      if (categoryId && categoryId !== 'all') params.categoryId = parseInt(categoryId);
      if (status && status !== 'all') params.status = status === 'true';

      const response = await productService.search(params);
      const data = response.data;
      const content = data.content || [];
      setProducts(content);
      setTotalElements(data.totalElements ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      setTotalElements(0);
      setTotalPages(0);
      if (error.response?.status !== 401) {
        alert('Lỗi tải danh sách sản phẩm: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setKeyword(value);
    setPage(0);
  };

  const handleFilterChange = (key, value) => {
    if (key === 'categoryId') setCategoryId(value);
    if (key === 'status') setStatus(value);
    setPage(0);
  };

  const handleReset = () => {
    setKeyword('');
    setCategoryId('all');
    setStatus('all');
    setPage(0);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${item.name}"?`)) return;
    try {
      await productService.delete(item.productId);
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Lỗi xóa sản phẩm: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatPrice = (v) =>
    v != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v) : '-';

  const columns = [
    { key: 'productId', label: 'ID', width: 'w-16' },
    { key: 'name', label: 'Tên sản phẩm', width: 'w-48' },
    { key: 'barcode', label: 'Mã vạch', width: 'w-28' },
    { key: 'categoryName', label: 'Danh mục', width: 'w-32', render: (v) => v || '-' },
    {
      key: 'sellingPrice',
      label: 'Giá bán',
      width: 'w-28',
      render: (v) => formatPrice(v),
    },
    {
      key: 'stockLevel',
      label: 'Tồn kho',
      width: 'w-20',
    },
    {
      key: 'status',
      label: 'Trạng thái',
      width: 'w-24',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'Hoạt động' : 'Ẩn'}
        </span>
      ),
    },
  ];

  const actions = [
    { label: 'Chi tiết', onClick: (item) => navigate(`/products/${item.productId}`) },
    { label: 'Xóa', onClick: handleDelete, variant: 'destructive' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Danh sách Sản phẩm</h1>
          <p className="text-muted-foreground mt-2">
            Xem và quản lý sản phẩm của cửa hàng
          </p>
        </div>
        <Button onClick={() => navigate('/products/new')}>Thêm sản phẩm</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Tổng sản phẩm</p>
          <p className="text-2xl font-bold text-foreground mt-1">{totalElements}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Trang hiện tại</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {page + 1} / {totalPages || 1}
          </p>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <FilterBar
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            filters={[
              {
                key: 'categoryId',
                label: 'Danh mục',
                defaultValue: 'all',
                options: [{ label: 'Tất cả', value: 'all' }, ...categories.map((c) => ({ label: c.name, value: String(c.categoryId) }))],
              },
              {
                key: 'status',
                label: 'Trạng thái',
                defaultValue: 'all',
                options: [
                  { label: 'Tất cả', value: 'all' },
                  { label: 'Hoạt động', value: 'true' },
                  { label: 'Ẩn', value: 'false' },
                ],
              },
            ]}
            onReset={handleReset}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        actions={actions}
        keyField="productId"
        loading={loading}
        pageSize={100}
        emptyMessage="Chưa có sản phẩm nào"
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị {page * size + 1} - {Math.min((page + 1) * size, totalElements)} / {totalElements}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft size={16} />
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Sau
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
