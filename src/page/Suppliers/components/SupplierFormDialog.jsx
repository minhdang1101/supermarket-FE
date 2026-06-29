import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/**
 * Supplier create/edit form dialog
 */
export function SupplierFormDialog({
  open,
  onOpenChange,
  isEditMode,
  formData,
  onInputChange,
  onSubmit,
  submitting,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Chỉnh sửa Nhà cung cấp' : 'Thêm Nhà cung cấp mới'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Cập nhật thông tin chi tiết của nhà cung cấp' : 'Điền đầy đủ thông tin nhà cung cấp bên dưới'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Tên Nhà cung cấp *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                placeholder="Nhập tên nhà cung cấp"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="contactPerson">Người liên hệ</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={onInputChange}
                placeholder="Nhập tên người liên hệ"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={onInputChange}
                  placeholder="0901234567"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={onInputChange}
                  placeholder="supplier@email.com"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Địa chỉ</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={onInputChange}
                placeholder="Nhập địa chỉ nhà cung cấp"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
