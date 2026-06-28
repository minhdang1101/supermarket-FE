import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/data-table';
import { FilterBar } from '@/components/common/filter-bar';
import { Plus, Loader2, Users, UserCheck, UserX, CheckCircle2, XCircle, CalendarDays, UserPlus, KeyRound } from 'lucide-react';
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
import staffApi from '@/services/staffApi';
import shiftApi from '@/services/shiftApi';
import { format } from 'date-fns';

const ROLES = {
  MANAGER: 'Quản Lý',
  CASHIER: 'Thu Ngân',
  ADMIN: 'Admin',
};

const SHIFT_TYPES = {
  Morning: 'Buổi Sáng',
  Afternoon: 'Buổi Chiều',
  Night: 'Ban Đêm',
};

const initialForm = {
  name: '',
  username: '',
  email: '',
  password: '',
  role: 'CASHIER',
  status: 'Active',
  phone: '',
};

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add mode
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  // Xem lịch làm việc state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [staffShifts, setStaffShifts] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(false);

  // ──────────────────────────────────────────────
  // Fetch
  // ──────────────────────────────────────────────
  const fetchStaff = async () => {
    setLoading(true);
    try {
      let res;
      if (searchTerm) {
        res = await staffApi.searchStaff(searchTerm);
      } else {
        res = await staffApi.getAllStaff();
      }
      setStaff(res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách nhân viên:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStaff();
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ──────────────────────────────────────────────
  // Filter
  // ──────────────────────────────────────────────
  const filteredStaff = staff.filter(s => {
    if (!statusFilter) return true;
    return s.status === statusFilter;
  });

  // ──────────────────────────────────────────────
  // Modal helpers
  // ──────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setFormData(initialForm);
    setIsDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditTarget(item);
    setFormData({
      name: item.name || '',
      username: item.username || '',
      email: item.email || '',
      password: '',
      role: item.role || 'CASHIER',
      status: item.status || 'Active',
      phone: item.phone || '',
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditTarget(null);
    setFormData(initialForm);
  };

  // ──────────────────────────────────────────────
  // Save (create / update)
  // ──────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Vui lòng nhập họ tên nhân viên.');
      return;
    }
    if (!editTarget) {
      if (!formData.username?.trim()) {
        alert('Vui lòng nhập tên đăng nhập cho tài khoản nhân viên.');
        return;
      }
      if (!formData.email?.trim()) {
        alert('Vui lòng nhập email cho tài khoản nhân viên.');
        return;
      }
    }
    setSaving(true);
    try {
      if (editTarget) {
        const { username, email, password, ...updateData } = formData;
        await staffApi.updateStaff(editTarget.id, updateData);
        alert('Cập nhật nhân viên thành công.');
      } else {
        const res = await staffApi.createStaff(formData);
        const created = res?.data;
        closeDialog();
        await fetchStaff();
        if (created?.username || created?.email) {
          alert(`Tạo tài khoản thành công!\n\nTên đăng nhập: ${created.username || '-'}\nEmail: ${created.email || '-'}\nMật khẩu: ${formData.password ? '(đã thiết lập)' : '123456 (mặc định)'}`);
        }
      }
      if (editTarget) {
        closeDialog();
        await fetchStaff();
      }
    } catch (err) {
      console.error('Lỗi lưu nhân viên:', err);
      const msg =
        err?.response?.data?.message || err?.message || 'Lỗi không xác định';
      alert(`Lưu thất bại: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // ──────────────────────────────────────────────
  // Delete
  // ──────────────────────────────────────────────
  const handleDelete = async (item) => {
    if (!window.confirm(`Xóa nhân viên "${item.name}"? Hành động này không thể hoàn tác.`))
      return;
    try {
      await staffApi.deleteStaff(item.id);
      await fetchStaff();
    } catch (err) {
      console.error('Lỗi xóa nhân viên:', err);
      alert('Xóa thất bại.');
    }
  };

  // ──────────────────────────────────────────────
  // View Schedule
  // ──────────────────────────────────────────────
  const handleViewSchedule = async (item) => {
    setViewingStaff(item);
    setIsScheduleOpen(true);
    setLoadingShifts(true);
    try {
      const res = await shiftApi.getShiftsByStaff(item.id);
      // Sort shifts by date descending
      const sorted = (res.data || []).sort((a, b) => new Date(b.shiftDate) - new Date(a.shiftDate));
      setStaffShifts(sorted);
    } catch (err) {
      console.error('Lỗi tải lịch làm việc:', err);
      alert('Không thể tải lịch làm việc.');
      setStaffShifts([]);
    } finally {
      setLoadingShifts(false);
    }
  };

  const fmt = (t) => (t ? String(t).slice(0, 5) : '--:--');

  // ──────────────────────────────────────────────
  // Table columns
  // ──────────────────────────────────────────────
  const columns = [
    {
      key: 'id',
      label: 'Mã NV',
      width: 'w-24',
      render: (value) => <span className="font-mono text-xs text-muted-foreground">{value}</span>,
    },
    {
      key: 'name',
      label: 'Họ Tên',
      width: 'w-36',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
            {(value || '?')[0].toUpperCase()}
          </div>
          <span className="font-semibold text-primary hover:underline transition-all">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Chức Vụ',
      width: 'w-28',
      render: (value) => ROLES[value] || value,
    },
    {
      key: 'shift',
      label: 'Ca Làm',
      width: 'w-24',
      render: (value) => SHIFT_TYPES[value] || value,
    },
    { key: 'phone', label: 'Số Điện Thoại', width: 'w-28' },
    {
      key: 'status',
      label: 'Trạng Thái',
      width: 'w-24',
      render: (value) => (
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${value === 'Active'
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-red-100 text-red-700 border border-red-200'
            }`}
        >
          {value === 'Active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {value === 'Active' ? 'Hoạt Động' : 'Ngưng'}
        </div>
      ),
    },
  ];

  const actions = [
    { label: 'Xem Lịch', onClick: handleViewSchedule },
    { label: 'Sửa', onClick: openEdit },
    { label: 'Xóa', onClick: handleDelete, variant: 'destructive' },
  ];

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản Lý Nhân Viên</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý các thành viên trong nhóm và lịch làm việc
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tổng Nhân Viên</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {loading ? <Loader2 className="animate-spin h-6 w-6 my-1" /> : staff.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-5 border-l-4 border-l-green-500 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Đang Hoạt Động</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {loading ? '...' : staff.filter((s) => s.status === 'Active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-red-500 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Ngưng Hoạt Động</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {loading ? '...' : staff.filter((s) => s.status !== 'Active').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <FilterBar
            onSearch={(v) => setSearchTerm(v)}
            onFilterChange={(key, value) => {
              if (key === 'status') setStatusFilter(value);
            }}
            filters={[
              {
                key: 'status',
                label: 'Trạng thái',
                options: [
                  { label: 'Đang hoạt động', value: 'Active' },
                  { label: 'Ngưng hoạt động', value: 'Inactive' },
                ],
              },
            ]}
            onReset={() => {
              setSearchTerm('');
              setStatusFilter('');
            }}
          />
        </div>

        {/* Add Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setIsDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openAdd}>
              <Plus size={16} />
              Thêm Nhân Viên
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editTarget ? 'Chỉnh Sửa Nhân Viên' : 'Thêm Nhân Viên Mới'}</DialogTitle>
              <DialogDescription>
                {editTarget ? 'Cập nhật thông tin nhân viên' : 'Nhập thông tin nhân viên bên dưới'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <Label htmlFor="staff-name">Họ Tên</Label>
                <Input
                  id="staff-name"
                  placeholder="Họ và tên"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Thông tin tài khoản đăng nhập - chỉ hiện khi Thêm mới */}
              {!editTarget && (
                <>
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <UserPlus size={18} className="text-primary" />
                    <span className="text-sm font-semibold text-foreground">Thông tin tài khoản đăng nhập</span>
                  </div>
                  <div>
                    <Label htmlFor="staff-username">Tên đăng nhập *</Label>
                    <Input
                      id="staff-username"
                      placeholder="nguyenvana"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="staff-email">Email *</Label>
                    <Input
                      id="staff-email"
                      type="email"
                      placeholder="nhanvien@smms.local"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="staff-password">Mật khẩu</Label>
                    <Input
                      id="staff-password"
                      type="password"
                      placeholder="Để trống = 123456"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Để trống thì mặc định là 123456</p>
                  </div>
                </>
              )}

              {/* Hiển thị thông tin đăng nhập khi sửa (chỉ đọc) */}
              {editTarget && (editTarget.username || editTarget.email) && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Thông tin đăng nhập hiện tại</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {editTarget.username && (
                      <span><KeyRound size={14} className="inline mr-1" />{editTarget.username}</span>
                    )}
                    {editTarget.email && (
                      <span>{editTarget.email}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Phone */}
              <div>
                <Label htmlFor="staff-phone">Số Điện Thoại</Label>
                <Input
                  id="staff-phone"
                  placeholder="0901234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Chức Vụ</Label>
                <Select
                  value={formData.role}
                  onValueChange={(val) => setFormData({ ...formData, role: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chức vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Status */}
              <div>
                <Label>Trạng Thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Hoạt Động</SelectItem>
                    <SelectItem value="Inactive">Ngưng Hoạt Động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full" disabled={saving}>
                {saving && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                {editTarget ? 'Lưu Thay Đổi' : 'Thêm Nhân Viên'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedule Dialog */}
        <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Lịch Làm Việc</DialogTitle>
              <DialogDescription>
                Chi tiết ca làm việc của <strong className="text-foreground">{viewingStaff?.name}</strong> ({viewingStaff?.id})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {loadingShifts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : staffShifts.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-xl bg-muted/20">
                  <CalendarDays className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">Nhân viên này chưa có lịch làm việc nào.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {staffShifts.map((shift) => (
                    <div key={shift.shiftId} className="flex items-center justify-between p-4 border border-border rounded-xl bg-card shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl flex items-center justify-center font-bold text-xs ${
                           shift.shiftType === 'MORNING' ? 'bg-orange-100 text-orange-600' :
                           shift.shiftType === 'AFTERNOON' ? 'bg-blue-100 text-blue-600' :
                           'bg-indigo-100 text-indigo-600'
                        }`}>
                          {shift.shiftType === 'MORNING' ? 'SÁNG' :
                           shift.shiftType === 'AFTERNOON' ? 'CHIỀU' : 'TỐI'}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            Ngày {format(new Date(shift.shiftDate), 'dd/MM/yyyy')}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground mt-0.5">
                            Ca {fmt(shift.startTime)} – {fmt(shift.endTime)}
                          </p>
                        </div>
                      </div>
                      {shift.note && (
                        <div className="max-w-[150px] text-right">
                          <span className="text-xs text-muted-foreground italic truncate block bg-muted/50 px-2 py-1 rounded">
                            {shift.note}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredStaff}
          actions={actions}
          keyField="id"
          onRowClick={handleViewSchedule}
          emptyMessage="Không tìm thấy nhân viên nào"
        />
      )}
    </div>
  );
}
