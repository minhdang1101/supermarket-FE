import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/data-table';
import { FilterBar } from '@/components/common/filter-bar';
import { Plus, Trash2, Edit2, Loader2, User, Users, Crown, Medal, Award } from 'lucide-react';
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
import { toast } from 'sonner';
import customerApi from '@/services/customerApi';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRank, setSelectedRank] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    points: 0,
    rank: 'Bronze'
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      let response;
      if (searchTerm) {
        response = await customerApi.searchCustomers(searchTerm);
      } else {
        response = await customerApi.getAllCustomers();
      }
      const data = Array.isArray(response.data) ? response.data : [];
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      toast.error('Không thể tải danh sách thành viên');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    if (!selectedRank || selectedRank === 'all') return true;
    return (m.rank || '').toLowerCase() === selectedRank.toLowerCase();
  });

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (key, value) => {
    if (key === 'rank') {
      setSelectedRank(value);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedRank('');
  };

  const handleSaveMember = async () => {
    if (!formData.name || !formData.phone) {
      toast.error('Vui lòng điền đầy đủ Tên và Số điện thoại');
      return;
    }

    try {
      if (editingMember) {
        await customerApi.updateCustomer(editingMember.id, formData);
        toast.success('Cập nhật thành viên thành công');
      } else {
        await customerApi.createCustomer(formData);
        toast.success('Thêm thành viên mới thành công');
      }
      setIsDialogOpen(false);
      setEditingMember(null);
      setFormData({ name: '', phone: '', email: '', points: 0, rank: 'Bronze' });
      fetchMembers();
    } catch (error) {
      console.error('Failed to save member:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu thành viên');
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thành viên ${item.name}?`)) {
      try {
        await customerApi.deleteCustomer(item.id);
        toast.success('Xóa thành viên thành công');
        fetchMembers();
      } catch (error) {
        console.error('Failed to delete member:', error);
        toast.error('Không thể xóa thành viên');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingMember(item);
    setFormData({
      name: item.name || '',
      phone: item.phone || '',
      email: item.email || '',
      points: item.points || 0,
      rank: item.rank || 'Bronze'
    });
    setIsDialogOpen(true);
  };

  const getRankColor = (rank) => {
    const lowerRank = (rank || '').toLowerCase();
    switch (lowerRank) {
      case 'gold':
      case 'vàng':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'silver':
      case 'bạc':
        return 'bg-slate-100 text-slate-800 border border-slate-200';
      case 'bronze':
      case 'đồng':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'diamond':
      case 'kim cương':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Họ Tên',
      width: 'w-48',
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-indigo-500 text-white flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
            {value ? value[0].toUpperCase() : <User size={16} />}
          </div>
          <div>
            <p className="font-semibold text-primary hover:underline transition-all cursor-pointer">
              {value || 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground font-medium">#{item.id}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', label: 'Số Điện Thoại', width: 'w-32' },
    { key: 'email', label: 'Email', width: 'w-48' },
    {
      key: 'points',
      label: 'Điểm',
      width: 'w-24',
      render: (value) => (
        <span className="font-semibold text-primary">{(value || 0).toLocaleString()}</span>
      ),
    },
    {
      key: 'rank',
      label: 'Hạng',
      width: 'w-24',
      render: (value) => (
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getRankColor(value)}`}>
          {value || 'Bronze'}
        </span>
      ),
    },
    {
      key: 'joinDate',
      label: 'Ngày gia nhập',
      width: 'w-32',
      render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A',
    },
  ];

  const actions = [
    {
      label: 'Sửa',
      onClick: handleEdit,
      icon: <Edit2 size={14} />
    },
    {
      label: 'Xóa',
      onClick: handleDelete,
      variant: 'destructive',
      icon: <Trash2 size={14} />
    },
  ];

  const stats = {
    total: members.length,
    gold: members.filter(m => (m.rank || '').toLowerCase() === 'gold').length,
    silver: members.filter(m => (m.rank || '').toLowerCase() === 'silver').length,
    bronze: members.filter(m => (m.rank || '').toLowerCase() === 'bronze' || !m.rank).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý thành viên</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý thành viên chương trình khách hàng thân thiết
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingMember(null);
            setFormData({ name: '', phone: '', email: '', points: 0, rank: 'Bronze' });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Thêm thành viên
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMember ? 'Cập nhật thành viên' : 'Thêm thành viên mới'}</DialogTitle>
              <DialogDescription>
                {editingMember ? 'Chỉnh sửa thông tin khách hàng thân thiết' : 'Đăng ký thành viên mới cho chương trình'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  placeholder="Nguyễn Văn A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="abc@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="points">Điểm</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="rank">Hạng</Label>
                  <select
                    id="rank"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  >
                    <option value="Bronze">Bronze (Đồng)</option>
                    <option value="Silver">Silver (Bạc)</option>
                    <option value="Gold">Gold (Vàng)</option>
                    <option value="Diamond">Diamond (Kim cương)</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleSaveMember} className="w-full">
                {editingMember ? 'Cập nhật' : 'Thêm thành viên'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card className="p-5 border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tổng Thành Viên</p>
              <p className="text-3xl font-bold text-foreground mt-1">{loading ? <Loader2 className="animate-spin h-6 w-6 my-1" /> : stats.total}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-yellow-400 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Hạng Vàng</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{loading ? '...' : stats.gold}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Crown className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-slate-400 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Hạng Bạc</p>
              <p className="text-3xl font-bold text-slate-600 mt-1">{loading ? '...' : stats.silver}</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-xl">
              <Medal className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Hạng Đồng</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{loading ? '...' : stats.bronze}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-1">
        <FilterBar
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          filters={[
            {
              key: 'rank',
              label: 'Hạng thành viên',
              options: [
                { label: 'Tất cả', value: 'all' },
                { label: 'Vàng (Gold)', value: 'gold' },
                { label: 'Bạc (Silver)', value: 'silver' },
                { label: 'Đồng (Bronze)', value: 'bronze' },
                { label: 'Kim cương (Diamond)', value: 'diamond' },
              ],
            },
          ]}
          onReset={handleReset}
        />
      </Card>

      {/* Table */}
      <Card className="overflow-hidden border-none shadow-md">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Đang tải dữ liệu thành viên...</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredMembers}
            actions={actions}
            keyField="id"
            emptyMessage="Không tìm thấy thành viên nào"
          />
        )}
      </Card>
    </div>
  );
}
