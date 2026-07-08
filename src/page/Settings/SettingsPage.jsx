import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import settingsApi from '@/services/settingsApi';

const DEFAULT_FORM = {
  storeName: 'Café Vietnam',
  storeAddress: '123 Nguyễn Huệ, District 1, HCMC',
  storePhone: '0901234567',
  storeEmail: 'store@cafevietnam.vn',
  taxRate: '10',
  currency: 'VND',
  lowStockThreshold: '10',
  operatingHours: '06:00 - 22:00',
};

export default function SettingsPage() {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsApi.getSettings();
        const d = res.data || {};
        setFormData({
          storeName: d.storeName ?? DEFAULT_FORM.storeName,
          storeAddress: d.storeAddress ?? DEFAULT_FORM.storeAddress,
          storePhone: d.storePhone ?? DEFAULT_FORM.storePhone,
          storeEmail: d.storeEmail ?? DEFAULT_FORM.storeEmail,
          taxRate: String(d.taxRate ?? d.vatRate ?? 10),
          currency: d.currency ?? DEFAULT_FORM.currency,
          lowStockThreshold: String(d.lowStockThreshold ?? 10),
          operatingHours: d.operatingHours ?? DEFAULT_FORM.operatingHours,
        });
      } catch (err) {
        console.error('Failed to load settings:', err);
        toast.error('Không thể tải cài đặt. Đang sử dụng cài đặt mặc định.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await settingsApi.updateSettings({
        storeName: formData.storeName,
        storeAddress: formData.storeAddress,
        storePhone: formData.storePhone,
        storeEmail: formData.storeEmail,
        taxRate: Number(formData.taxRate) || 0,
        vatRate: Number(formData.taxRate) || 0,
        currency: formData.currency,
        lowStockThreshold: Number(formData.lowStockThreshold) || 0,
        operatingHours: formData.operatingHours,
      });
      setSaved(true);
      toast.success('Đã lưu cài đặt thành công');
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Lưu cài đặt thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({ ...DEFAULT_FORM });
    toast.info('Đã đặt lại về giá trị mặc định');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Settings size={32} />
          Cài đặt hệ thống
        </h1>
        <p className="text-muted-foreground mt-2">
          Cấu hình thông tin cửa hàng và các tùy chọn hệ thống
        </p>
      </div>

      {/* Success Message */}
      {saved && (
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-sm text-green-800 font-medium">
            Cài đặt đã được lưu thành công!
          </p>
        </Card>
      )}

      {/* Store Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Thông tin cửa hàng</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="storeName" className="font-medium">
                Tên cửa hàng
              </Label>
              <Input
                id="storeName"
                value={formData.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="storePhone" className="font-medium">
                Số điện thoại
              </Label>
              <Input
                id="storePhone"
                value={formData.storePhone}
                onChange={(e) => handleChange('storePhone', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="storeAddress" className="font-medium">
              Địa chỉ cửa hàng
            </Label>
            <Input
              id="storeAddress"
              value={formData.storeAddress}
              onChange={(e) => handleChange('storeAddress', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="storeEmail" className="font-medium">
              Địa chỉ Email
            </Label>
            <Input
              id="storeEmail"
              type="email"
              value={formData.storeEmail}
              onChange={(e) => handleChange('storeEmail', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="operatingHours" className="font-medium">
              Giờ hoạt động
            </Label>
            <Input
              id="operatingHours"
              value={formData.operatingHours}
              onChange={(e) => handleChange('operatingHours', e.target.value)}
              className="mt-1"
              placeholder="HH:MM - HH:MM"
            />
          </div>
        </div>
      </Card>

      <Separator />

      {/* Financial Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Cài đặt tài chính</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taxRate" className="font-medium">
                Thuế suất VAT (%)
              </Label>
              <Input
                id="taxRate"
                type="number"
                value={formData.taxRate}
                onChange={(e) => handleChange('taxRate', e.target.value)}
                className="mt-1"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div>
              <Label htmlFor="currency" className="font-medium">
                Tiền tệ
              </Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="mt-1"
                disabled
              />
            </div>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Ghi chú:</strong> Các tính toán thuế sẽ tự động được áp dụng khi thanh toán dựa trên mức thuế đã cấu hình ở trên.
            </p>
          </div>
        </div>
      </Card>

      <Separator />

      {/* Inventory Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Cài đặt kho hàng</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="lowStockThreshold" className="font-medium">
              Ngưỡng tồn thấp (đơn vị)
            </Label>
            <Input
              id="lowStockThreshold"
              type="number"
              value={formData.lowStockThreshold}
              onChange={(e) => handleChange('lowStockThreshold', e.target.value)}
              className="mt-1"
              min="1"
              step="1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Các mặt hàng dưới số lượng này sẽ được đánh dấu là sắp hết hàng
            </p>
          </div>
        </div>
      </Card>

      <Separator />

      {/* System Information */}
      <Card className="p-6 bg-muted/30">
        <h2 className="text-xl font-semibold text-foreground mb-4">Thông tin hệ thống</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ứng dụng</span>
            <span className="font-medium">Kirin POS System</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phiên bản</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cập nhật lần cuối</span>
            <span className="font-medium">2024-02-24</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Trạng thái máy chủ</span>
            <span className="font-medium text-green-600">Đang hoạt động</span>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw size={16} />
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
