import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/common/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Download, Clock, Package, TrendingUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { inventoryService } from '@/services/inventoryService';
import { categoryService } from '@/services/categoryService';

const mapStockStatus = (stockStatus) => {
  switch (stockStatus) {
    case 'NORMAL':
    case 'OVER_STOCK':
      return 'in-stock';
    case 'LOW_STOCK':
      return 'low-stock';
    case 'OUT_OF_STOCK':
      return 'critical';
    default:
      return 'in-stock';
  }
};

const getDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  return {
    from: start.toISOString().slice(0, 16),
    to: end.toISOString().slice(0, 16),
  };
};

export default function InventoryReportPage() {
  const [inventory, setInventory] = useState([]);
  const [expiredGoods, setExpiredGoods] = useState([]);
  const [stockMovement, setStockMovement] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movementLoading, setMovementLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState(getDateRange());
  const [movementCategoryId, setMovementCategoryId] = useState('all');

  useEffect(() => {
    loadInventory();
    loadExpiredGoods();
    loadCategories();
  }, []);

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      loadStockMovement();
    }
  }, [dateRange.from, dateRange.to, movementCategoryId]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getAllStock();
      const data = Array.isArray(res.data) ? res.data : res.data?.content || [];
      const mapped = data.map((item) => ({
        id: item.productId,
        productId: item.productId,
        name: item.productName,
        sku: item.barcode || '-',
        category: item.categoryName || '-',
        quantity: item.currentStock ?? 0,
        unit: '-',
        reorderLevel: item.minStockLevel ?? 0,
        maxStockLevel: item.maxStockLevel,
        lastRestocked: '-',
        status: mapStockStatus(item.stockStatus),
        totalImported: item.totalImported,
        totalExported: item.totalExported,
        totalAdjusted: item.totalAdjusted,
      }));
      setInventory(mapped);
    } catch (error) {
      console.error('Error loading inventory:', error);
      setInventory([]);
      if (error.response?.status !== 401) {
        alert('Lỗi tải kiểm kê kho: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadExpiredGoods = async () => {
    try {
      const res = await inventoryService.getExpiredGoods();
      const data = Array.isArray(res.data) ? res.data : res.data?.content || [];
      setExpiredGoods(data);
    } catch (error) {
      console.error('Error loading expired goods:', error);
      setExpiredGoods([]);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await categoryService.getAll();
      const data = Array.isArray(res.data) ? res.data : res.data?.content || [];
      setCategories(data);
    } catch (e) {
      console.error('Error loading categories:', e);
    }
  };

  const loadStockMovement = async () => {
    setMovementLoading(true);
    try {
      let from = dateRange.from || '';
      let to = dateRange.to || '';
      if (from.length === 16) from += ':00';
      if (to.length === 16) to += ':00';
      const res = await inventoryService.getStockMovement(
        from,
        to,
        movementCategoryId && movementCategoryId !== 'all' ? parseInt(movementCategoryId) : undefined
      );
      const data = Array.isArray(res.data) ? res.data : res.data?.content || [];
      setStockMovement(data);
    } catch (error) {
      console.error('Error loading stock movement:', error);
      setStockMovement([]);
    } finally {
      setMovementLoading(false);
    }
  };

  const exportToCsv = () => {
    const headers = ['ID', 'Sản phẩm', 'Mã vạch', 'Danh mục', 'Tồn kho', 'Mức tối thiểu', 'Đã nhập', 'Đã xuất', 'Điều chỉnh', 'Trạng thái'];
    const rows = filteredInventory.map((i) => [
      i.productId,
      i.name,
      i.sku,
      i.category,
      i.quantity,
      i.reorderLevel,
      i.totalImported ?? '',
      i.totalExported ?? '',
      i.totalAdjusted ?? '',
      getStatusLabel(i.status),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredInventory = selectedStatus && selectedStatus !== 'all'
    ? inventory.filter((item) => item.status === selectedStatus)
    : inventory;

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-800';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'in-stock':
        return 'Còn hàng';
      case 'low-stock':
        return 'Sắp hết';
      case 'critical':
        return 'Hết hàng';
      case 'expired':
        return 'Hết hạn';
      default:
        return status;
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Sản phẩm',
      width: 'w-32',
      render: (value, item) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">Mã: {item.sku}</p>
        </div>
      ),
    },
    { key: 'category', label: 'Danh mục', width: 'w-24' },
    {
      key: 'quantity',
      label: 'Tồn kho',
      width: 'w-20',
      render: (value) => <p className="font-medium">{value}</p>,
    },
    {
      key: 'reorderLevel',
      label: 'Mức tối thiểu',
      width: 'w-24',
      render: (value) => <span>{value ?? '-'}</span>,
    },
    {
      key: 'totalImported',
      label: 'Đã nhập',
      width: 'w-20',
    },
    {
      key: 'totalExported',
      label: 'Đã xuất',
      width: 'w-20',
    },
    {
      key: 'status',
      label: 'Trạng thái',
      width: 'w-24',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {getStatusLabel(value)}
        </span>
      ),
    },
  ];

  const inStockCount = inventory.filter((i) => i.status === 'in-stock').length;
  const lowStockCount = inventory.filter((i) => i.status === 'low-stock').length;
  const criticalCount = inventory.filter((i) => i.status === 'critical').length;
  const expiredCount = expiredGoods.length;

  const reorderItems = inventory.filter(
    (item) => (item.reorderLevel != null && item.quantity <= item.reorderLevel) || item.quantity <= 0
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Kiểm kê kho</h1>
        <p className="text-muted-foreground mt-2">
          Tồn kho, cảnh báo sắp hết, và hàng hết hạn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-foreground mt-1">{inventory.length}</p>
            </div>
            <Package className="text-primary h-8 w-8 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Còn hàng</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{inStockCount}</p>
            </div>
            <Package className="text-green-600 h-8 w-8 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sắp hết</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{lowStockCount}</p>
            </div>
            <AlertTriangle className="text-yellow-600 h-8 w-8 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Hết hàng / Hết hạn</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {criticalCount + expiredCount}
              </p>
            </div>
            <AlertTriangle className="text-red-600 h-8 w-8 opacity-20" />
          </div>
        </Card>
      </div>

      {(criticalCount > 0 || expiredCount > 0) && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Cần xử lý ngay</h3>
              <p className="text-sm text-red-800">
                {criticalCount} sản phẩm hết hàng và {expiredCount} mặt hàng hết hạn cần chú ý.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="in-stock">Còn hàng</SelectItem>
            <SelectItem value="low-stock">Sắp hết</SelectItem>
            <SelectItem value="critical">Hết hàng</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportToCsv} className="gap-2">
          <Download size={16} />
          Xuất CSV
        </Button>
      </div>

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock">Tồn kho</TabsTrigger>
          <TabsTrigger value="movement">Biến động kho</TabsTrigger>
        </TabsList>
        <TabsContent value="stock" className="space-y-6">
      <DataTable
        columns={columns}
        data={filteredInventory}
        keyField="productId"
        loading={loading}
        emptyMessage="Không có dữ liệu kiểm kê"
        pageSize={15}
      />

      {expiredGoods.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={20} className="text-red-600" />
            <h3 className="font-semibold text-foreground">Hàng hết hạn</h3>
          </div>
          <div className="space-y-2">
            {expiredGoods.map((item) => (
              <div
                key={`${item.productId}-${item.batchNumber}`}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
              >
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    Lô: {item.batchNumber || '-'} · Hết hạn: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('vi-VN') : '-'} · SL: {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} className="text-primary" />
          <h3 className="font-semibold text-foreground">Đề xuất đặt hàng</h3>
        </div>
        <div className="space-y-3">
          {reorderItems.length === 0 ? (
            <p className="text-muted-foreground">Không có sản phẩm cần đặt hàng</p>
          ) : (
            reorderItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
              >
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Hiện tại: {item.quantity} | Mức tối thiểu: {item.reorderLevel ?? '-'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
        </TabsContent>

        <TabsContent value="movement" className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <Label>Từ ngày</Label>
                <Input
                  type="datetime-local"
                  value={dateRange.from}
                  onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
                  className="w-48 mt-1"
                />
              </div>
              <div>
                <Label>Đến ngày</Label>
                <Input
                  type="datetime-local"
                  value={dateRange.to}
                  onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
                  className="w-48 mt-1"
                />
              </div>
              <div>
                <Label>Danh mục</Label>
                <Select value={movementCategoryId} onValueChange={setMovementCategoryId}>
                  <SelectTrigger className="w-40 mt-1">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.categoryId} value={String(c.categoryId)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
          <DataTable
            columns={[
              { key: 'productName', label: 'Sản phẩm', width: 'w-40' },
              { key: 'categoryName', label: 'Danh mục', width: 'w-28' },
              { key: 'stockIn', label: 'Nhập', width: 'w-20' },
              { key: 'stockOut', label: 'Xuất', width: 'w-20' },
              { key: 'adjustments', label: 'Điều chỉnh', width: 'w-24' },
              {
                key: 'netChange',
                label: 'Biến động',
                width: 'w-24',
                render: (v) => (
                  <span className={v > 0 ? 'text-green-600' : v < 0 ? 'text-red-600' : ''}>
                    {v > 0 ? '+' : ''}{v}
                  </span>
                ),
              },
            ]}
            data={stockMovement}
            keyField="productId"
            loading={movementLoading}
            emptyMessage="Không có biến động trong khoảng thời gian chọn"
            pageSize={15}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
