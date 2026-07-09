import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/data-table';
import { FilterBar } from '@/components/common/filter-bar';
import { Plus } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { categoryService } from '@/services/categoryService';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterData(searchKeyword);
  }, [categories, searchKeyword]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getAll();
      const data = Array.isArray(response.data) ? response.data : response.data?.content || [];
      const mapped = data.map((c) => ({
        id: c.categoryId,
        categoryId: c.categoryId,
        name: c.name,
        description: c.description || '-',
        status: c.status !== false ? 'active' : 'inactive',
        productCount: c.productCount ?? 0,
      }));
      setCategories(mapped);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
      if (error.response?.status === 401) {
        // Token invalid - api interceptor handles redirect
      } else {
        alert('Lỗi tải danh sách danh mục: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const filterData = (keyword) => {
    if (!keyword?.trim()) {
      setFilteredCategories(categories);
      return;
    }
    const lower = keyword.toLowerCase();
    setFilteredCategories(
      categories.filter(
        (c) =>
          c.name?.toLowerCase().includes(lower) ||
          c.description?.toLowerCase().includes(lower)
      )
    );
  };

  const handleSearch = (value) => {
    setSearchKeyword(value);
  };

  const handleReset = () => {
    setSearchKeyword('');
    loadCategories();
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', status: true });
    setEditingCategory(null);
  };

  const handleCreate = async () => {
    if (!formData.name?.trim()) {
      alert('Vui lòng nhập tên danh mục');
      return;
    }
    try {
      await categoryService.create({
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        status: formData.status,
      });
      setIsDialogOpen(false);
      resetForm();
      loadCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Lỗi tạo danh mục: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory || !formData.name?.trim()) return;
    try {
      await categoryService.update(editingCategory.categoryId, {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        status: formData.status,
      });
      setIsDialogOpen(false);
      resetForm();
      loadCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Lỗi cập nhật danh mục: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (item) => {
    setEditingCategory(item);
    setFormData({
      name: item.name || '',
      description: item.description === '-' ? '' : (item.description || ''),
      status: item.status === 'active',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${item.name}"?`)) return;
    try {
      await categoryService.delete(item.categoryId || item.id);
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Lỗi xóa danh mục: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = () => {
    if (editingCategory) handleUpdate();
    else handleCreate();
  };

  const columns = [
    { key: 'categoryId', label: 'ID', width: 'w-16' },
    { key: 'name', label: 'Tên danh mục', width: 'w-48' },
    { key: 'description', label: 'Mô tả', width: 'w-64', render: (v) => (v === '-' ? '-' : v) },
    {
      key: 'status',
      label: 'Trạng thái',
      width: 'w-24',
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {value === 'active' ? 'Hoạt động' : 'Ẩn'}
        </span>
      ),
    },
    {
      key: 'productCount',
      label: 'Số sản phẩm',
      width: 'w-24',
    },
  ];

  const actions = [
    { label: 'Sửa', onClick: handleEdit },
    { label: 'Xóa', onClick: handleDelete, variant: 'destructive' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản lý Danh mục</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý danh mục sản phẩm của cửa hàng
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Tổng danh mục</p>
          <p className="text-2xl font-bold text-foreground mt-1">{categories.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Đang hoạt động</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {categories.filter((c) => c.status === 'active').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Đã ẩn</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {categories.filter((c) => c.status === 'inactive').length}
          </p>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <FilterBar
            onSearch={handleSearch}
            onReset={handleReset}
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Thêm danh mục
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Chỉnh sửa thông tin danh mục' : 'Nhập thông tin danh mục mới'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Tên danh mục *</Label>
                <Input
                  id="name"
                  placeholder="VD: Cà phê, Trà sữa..."
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả danh mục (tùy chọn)"
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="status"
                  checked={formData.status}
                  onChange={(e) => setFormData((p) => ({ ...p, status: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="status">Trạng thái hoạt động</Label>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingCategory ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={filteredCategories}
        actions={actions}
        keyField="categoryId"
        loading={loading}
        emptyMessage="Chưa có danh mục nào"
      />
    </div>
  );
}
