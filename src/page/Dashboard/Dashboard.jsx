import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  ShoppingCart,
  Users,
  Heart,
  Tag,
  Clock,
  TrendingUp,
  TrendingDown,
  Package,
  Barcode,
  AlertTriangle,
  Calendar,
  DollarSign,
  ShoppingBag,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/config/menuRoles';
import { dashboardService } from '@/services/dashboardService';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

/**
 * Dashboard Component - Marketing Dashboard with real-time statistics
 * 
 * Features:
 * - Summary statistics (Revenue, Orders, Low Stock, Expiring Products)
 * - Sales trend chart (Today/Week/Month)
 * - Top selling products
 * - Recent transactions
 * - Quick access menu
 * 
 * @author SMS Development Team
 * @version 2.0
 */

// Period filter options
const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'week', label: 'Tuần này' },
  { value: 'month', label: 'Tháng này' },
];

// Quick access menu configuration
const ALL_QUICK_ACCESS = [
  { title: 'Thu Ngân POS', description: 'Xử lý giao dịch bán hàng', icon: ShoppingCart, href: '/checkout', color: 'bg-blue-500', highlight: true, roles: null },
  { title: 'Quản Lý Nhân Viên', description: 'Quản lý nhân sự', icon: Users, href: '/staff', color: 'bg-cyan-500', roles: [ROLES.ADMIN, ROLES.MANAGER] },
  { title: 'Lịch Sử Bán Hàng', description: 'Xem tất cả giao dịch', icon: BarChart3, href: '/sales-history', color: 'bg-green-500', roles: null },
  { title: 'Thành Viên', description: 'Chương trình khách hàng thân thiết', icon: Heart, href: '/members', color: 'bg-pink-500', roles: [ROLES.ADMIN, ROLES.MANAGER] },
  { title: 'Khuyến Mãi', description: 'Tạo quy tắc giảm giá', icon: Tag, href: '/promotions', color: 'bg-orange-500', roles: [ROLES.ADMIN, ROLES.MANAGER] },
  { title: 'Ca Làm Việc', description: 'Lên lịch ca làm việc', icon: Clock, href: '/shifts', color: 'bg-purple-500', roles: [ROLES.ADMIN, ROLES.MANAGER] },
  { title: 'Tồn Kho', description: 'Quản lý kho hàng', icon: Package, href: '/reports/inventory', color: 'bg-amber-500', roles: [ROLES.ADMIN, ROLES.MANAGER] },
  { title: 'In Mã Vạch', description: 'In mã vạch sản phẩm', icon: Barcode, href: '/barcode-print', color: 'bg-slate-600', roles: null },
];

const getQuickAccessForRole = (role) => {
  return ALL_QUICK_ACCESS.filter((item) => {
    if (role === ROLES.ADMIN) return true;
    if (!item.roles) return true;
    return role && item.roles.includes(role);
  });
};

// Format currency
const formatCurrency = (value) => {
  if (!value && value !== 0) return '₫0';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

// Format percentage change with color
const formatChange = (value) => {
  if (!value && value !== 0) return null;
  const isPositive = value >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? 'text-emerald-600' : 'text-red-500';
  return (
    <span className={`flex items-center gap-1 text-sm font-medium ${colorClass}`}>
      <Icon size={14} />
      {isPositive ? '+' : ''}{value.toFixed(1)}%
    </span>
  );
};

// Stock status badge
const StockBadge = ({ status }) => {
  const config = {
    'IN_STOCK': { label: 'Còn hàng', class: 'bg-emerald-100 text-emerald-700' },
    'LOW_STOCK': { label: 'Sắp hết', class: 'bg-amber-100 text-amber-700' },
    'CRITICAL': { label: 'Hết hàng', class: 'bg-red-100 text-red-700' },
  };
  const { label, class: className } = config[status] || config['IN_STOCK'];
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
};

export default function Dashboard() {
  const { role } = useAuth();
  const quickAccessItems = getQuickAccessForRole(role);
  
  // State
  const [period, setPeriod] = useState('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.getSummary(period);
      setData(response.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Summary cards configuration
  const summaryCards = data ? [
    {
      title: 'Tổng Doanh Thu',
      value: formatCurrency(data.totalRevenue),
      change: data.revenueChange,
      icon: DollarSign,
      iconBg: 'bg-emerald-500',
    },
    {
      title: 'Doanh Thu/Ngày',
      value: formatCurrency(data.dailySales),
      change: data.dailySalesChange,
      icon: TrendingUp,
      iconBg: 'bg-blue-500',
    },
    {
      title: 'Đơn Hàng',
      value: data.ordersProcessed?.toLocaleString() || '0',
      change: data.ordersChange,
      icon: ShoppingBag,
      iconBg: 'bg-purple-500',
    },
    {
      title: 'Cảnh Báo Tồn Kho',
      value: `${data.lowStockCount || 0} sản phẩm`,
      subtitle: `${data.expiringProductsCount || 0} sắp hết hạn`,
      icon: AlertTriangle,
      iconBg: 'bg-amber-500',
      isAlert: (data.lowStockCount || 0) > 0,
    },
  ] : [];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Tổng quan hoạt động kinh doanh
          </p>
        </div>
        
        {/* Period Filter */}
        <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                period === option.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Đang tải dữ liệu...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle size={24} />
              <div>
                <p className="font-medium">{error}</p>
                <button 
                  onClick={loadDashboardData}
                  className="text-sm underline mt-1 hover:text-red-800"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {!loading && !error && data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card 
                  key={index} 
                  className={`overflow-hidden ${card.isAlert ? 'border-amber-300 bg-amber-50/50' : ''}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-500">{card.title}</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">{card.value}</p>
                        {card.subtitle && (
                          <p className="text-xs text-slate-500 mt-0.5">{card.subtitle}</p>
                        )}
                        {card.change !== undefined && (
                          <div className="mt-2">
                            {formatChange(card.change)}
                          </div>
                        )}
                      </div>
                      <div className={`${card.iconBg} p-3 rounded-xl`}>
                        <Icon className="text-white" size={22} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Trend Chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  Xu Hướng Doanh Số
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {data.salesTrend && data.salesTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.salesTrend}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="label" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                        />
                        <Tooltip 
                          formatter={(value) => formatCurrency(value)}
                          labelStyle={{ color: '#334155' }}
                          contentStyle={{ 
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          name="Doanh thu"
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorRevenue)" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="profit" 
                          name="Lợi nhuận"
                          stroke="#10b981" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorProfit)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <Calendar size={48} className="mr-3" />
                      <span>Chưa có dữ liệu cho kỳ này</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  Sản Phẩm Bán Chạy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.topProducts && data.topProducts.length > 0 ? (
                    data.topProducts.map((product, index) => (
                      <div 
                        key={product.productId}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-amber-400 text-white' : 
                          index === 1 ? 'bg-slate-300 text-slate-700' :
                          index === 2 ? 'bg-orange-400 text-white' :
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">
                            {product.productName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{product.unitsSold} đã bán</span>
                            <StockBadge status={product.stockStatus} />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-800">
                            {formatCurrency(product.revenue)}
                          </p>
                          {product.changePercent !== undefined && formatChange(product.changePercent)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Package size={40} className="mx-auto mb-2" />
                      <p>Chưa có dữ liệu bán hàng</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  Giao Dịch Gần Đây
                </CardTitle>
                <Link 
                  to="/sales-history" 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Xem tất cả →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b">
                      <th className="pb-3 font-medium">Hóa đơn</th>
                      <th className="pb-3 font-medium">Khách hàng</th>
                      <th className="pb-3 font-medium">SP</th>
                      <th className="pb-3 font-medium">Thu ngân</th>
                      <th className="pb-3 font-medium">Thời gian</th>
                      <th className="pb-3 font-medium text-right">Tổng tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.recentTransactions && data.recentTransactions.length > 0 ? (
                      data.recentTransactions.map((tx) => (
                        <tr key={tx.orderId} className="hover:bg-slate-50">
                          <td className="py-3">
                            <span className="font-mono text-sm text-slate-700">
                              {tx.invoiceNumber}
                            </span>
                          </td>
                          <td className="py-3 text-slate-600">{tx.customerName}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {tx.itemCount} SP
                            </span>
                          </td>
                          <td className="py-3 text-slate-600">{tx.cashierName}</td>
                          <td className="py-3 text-slate-500 text-sm">{tx.time}</td>
                          <td className="py-3 text-right font-semibold text-slate-800">
                            {formatCurrency(tx.totalAmount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Chưa có giao dịch nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access */}
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Truy Cập Nhanh</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickAccessItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} to={item.href}>
                    <Card
                      className={`p-4 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                        item.highlight ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
                      }`}
                    >
                      <div
                        className={`${item.color} text-white w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-lg`}
                      >
                        <Icon size={24} />
                      </div>
                      <h3 className="font-semibold text-slate-800">{item.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.description}
                      </p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
