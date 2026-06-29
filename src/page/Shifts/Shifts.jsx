import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, Users, Loader2, Trash2, Sun, Sunset, Moon, CalendarDays, UserRound } from 'lucide-react';
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
import shiftApi from '@/services/shiftApi';
import staffApi from '@/services/staffApi';
import { format } from 'date-fns';

/**
 * Backend ShiftType enum values: MORNING | AFTERNOON | NIGHT
 * ShiftDTO fields: shiftId, staffId, staffName, shiftDate, shiftType, startTime, endTime, note
 * ShiftCreateRequestDTO fields: staffId, shiftDate (LocalDate), shiftType (ShiftType enum),
 *                               startTime (optional), endTime (optional), note (optional)
 */
const SHIFT_TYPES = [
  { id: 'MORNING',   label: 'Ca Sáng', time: '06:00 - 14:00', start: '06:00', end: '14:00', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-100', border: 'border-orange-500' },
  { id: 'AFTERNOON', label: 'Ca Chiều', time: '14:00 - 22:00', start: '14:00', end: '22:00', icon: Sunset, color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-500' },
  { id: 'NIGHT',     label: 'Ca Tối',   time: '22:00 - 06:00', start: '22:00', end: '06:00', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-100', border: 'border-indigo-500' },
];

const today = format(new Date(), 'yyyy-MM-dd');

export default function ShiftsPage() {
  const [shiftData, setShiftData] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(today);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New shift form state
  const [newShift, setNewShift] = useState({
    staffId: '',
    shiftType: '',
    shiftDate: today,
    startTime: '',
    endTime: '',
    note: '',
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shiftsRes, staffRes] = await Promise.all([
        shiftApi.getShiftsBetweenDates(selectedDate, selectedDate),
        staffApi.getAllStaff(),
      ]);
      setShiftData(shiftsRes.data || []);
      setStaffList(staffRes.data || []);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignShift = async () => {
    if (!newShift.staffId || !newShift.shiftType || !newShift.shiftDate) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setSubmitting(true);
    try {
      // Backend expects: staffId, shiftDate (LocalDate), shiftType (ShiftType enum), startTime, endTime, note
      await shiftApi.createShift({
        staffId: newShift.staffId,
        shiftDate: newShift.shiftDate,
        shiftType: newShift.shiftType,
        startTime: newShift.startTime ? `${newShift.startTime}:00` : null,
        endTime: newShift.endTime ? `${newShift.endTime}:00` : null,
        note: newShift.note,
      });
      setIsDialogOpen(false);
      setNewShift({ staffId: '', shiftType: '', shiftDate: selectedDate, startTime: '', endTime: '', note: '' });
      fetchData();
    } catch (error) {
      console.error('Lỗi phân ca:', error);
      alert('Lỗi khi phân ca: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShift = async (shiftId) => {
    if (!window.confirm('Xóa phân công ca này?')) return;
    try {
      await shiftApi.deleteShift(shiftId);
      fetchData();
    } catch (error) {
      console.error('Lỗi xóa ca:', error);
      alert('Xóa ca thất bại: ' + (error.response?.data?.message || error.message));
    }
  };

  // Helper: format time from "HH:mm:ss" → "HH:mm"
  const fmt = (t) => (t ? String(t).slice(0, 5) : '--:--');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản lý ca làm việc</h1>
        <p className="text-muted-foreground mt-2">
          Lập lịch và quản lý ca làm việc của nhân viên
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 border-l-4 border-l-primary shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Đã lên lịch hôm nay</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {loading ? <Loader2 className="animate-spin h-6 w-6 my-1" /> : shiftData.length}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
        
        <Card className="p-5 border-l-4 border-l-orange-500 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Ca Sáng Hôm Nay</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {loading ? '...' : shiftData.filter((s) => s.shiftType === 'MORNING').length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <Sun className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-indigo-500 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tổng Nhân Viên</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                {loading ? '...' : staffList.length}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Date Selector & Add Button */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Label htmlFor="date" className="text-sm font-medium">
            Chọn ngày
          </Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-2 max-w-xs"
          />
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setNewShift({ staffId: '', shiftType: '', shiftDate: selectedDate });
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Phân ca làm việc
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Phân ca làm việc mới</DialogTitle>
              <DialogDescription>
                Tạo một phân công ca làm việc mới cho nhân viên
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Staff */}
              <div>
                <Label>Nhân viên</Label>
                <Select
                  value={newShift.staffId}
                  onValueChange={(val) => setNewShift({ ...newShift, staffId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhân viên" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name} ({staff.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Shift type */}
              <div>
                <Label>Ca làm việc</Label>
                <Select
                  value={newShift.shiftType}
                  onValueChange={(val) => {
                    const type = SHIFT_TYPES.find(t => t.id === val);
                    setNewShift({
                      ...newShift,
                      shiftType: val,
                      startTime: type?.start || '',
                      endTime: type?.end || '',
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ca làm việc" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFT_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label} ({type.time})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Giờ bắt đầu</Label>
                  <Input
                    type="time"
                    value={newShift.startTime}
                    onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Giờ kết thúc</Label>
                  <Input
                    type="time"
                    value={newShift.endTime}
                    onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <Label>Ghi chú (Tùy chọn)</Label>
                <Input
                  placeholder="Ví dụ: Làm bù, Về sớm..."
                  value={newShift.note}
                  onChange={(e) => setNewShift({ ...newShift, note: e.target.value })}
                />
              </div>

              {/* Date */}
              <div>
                <Label>Ngày làm việc</Label>
                <Input
                  type="date"
                  value={newShift.shiftDate}
                  onChange={(e) => setNewShift({ ...newShift, shiftDate: e.target.value })}
                />
              </div>

              <Button onClick={handleAssignShift} className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                Phân ca làm việc
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Shift Assignments by type */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : (
          SHIFT_TYPES.map((type) => {
            // ShiftDTO.shiftType is a Java enum → serialised as "MORNING" etc.
            const assignments = shiftData.filter((s) => s.shiftType === type.id);
            const Icon = type.icon;
            return (
              <Card key={type.id} className={`p-6 border-t-4 border-t-transparent shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`} style={{ borderTopColor: 'inherit' }}>
                <div className={`absolute top-0 left-0 w-full h-1 ${type.bg.replace('100', '500')}`} />
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${type.bg}`}>
                      <Icon className={`h-6 w-6 ${type.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{type.label}</h3>
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock size={12} /> {type.time}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${type.bg} ${type.color}`}>
                    {assignments.length} nhân viên
                  </div>
                </div>

                {assignments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-border rounded-xl bg-muted/20">
                    <p className="text-muted-foreground text-sm font-medium">Chưa có nhân viên nào</p>
                    <p className="text-xs text-muted-foreground mt-1">Bấm "Phân ca làm việc" để thêm</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assignments.map((assignment) => (
                      <div
                        key={assignment.shiftId}
                        className="group flex flex-col p-4 bg-background rounded-xl border border-border/60 hover:border-primary/40 hover:shadow-sm transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <UserRound size={16} />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-foreground">{assignment.staffName}</p>
                              <p className="text-xs text-muted-foreground font-medium">Ca {fmt(assignment.startTime)} – {fmt(assignment.endTime)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteShift(assignment.shiftId)}
                            className="p-1.5 rounded-md text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                            title="Xóa phân công"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        {assignment.note && (
                          <div className="mt-2 text-xs text-muted-foreground bg-muted/40 p-2 rounded-md italic border-l-2 border-primary/20">
                            {assignment.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Info note */}
      <Card className="p-4 bg-primary/10 border-primary/20">
        <p className="text-sm text-foreground">
          Lịch làm việc cho ngày <strong>{selectedDate}</strong>. Sử dụng bộ chọn ngày phía
          trên để xem ca làm việc cho các ngày khác.
        </p>
      </Card>
    </div>
  );
}
