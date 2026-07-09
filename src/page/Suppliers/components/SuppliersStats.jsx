import { Card } from '@/components/ui/card';
import { Building2, UserCheck, UserX } from 'lucide-react';

/**
 * Suppliers statistics cards
 */
export function SuppliersStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        icon={Building2}
        iconColor="text-blue-600"
        iconBg="bg-blue-100"
        label="Tổng Nhà cung cấp"
        value={stats.total}
      />
      <StatCard
        icon={UserCheck}
        iconColor="text-green-600"
        iconBg="bg-green-100"
        label="Đang hoạt động"
        value={stats.active}
        valueColor="text-green-600"
      />
      <StatCard
        icon={UserX}
        iconColor="text-red-600"
        iconBg="bg-red-100"
        label="Ngừng hoạt động"
        value={stats.inactive}
        valueColor="text-red-600"
      />
    </div>
  );
}

function StatCard({ icon: Icon, iconColor, iconBg, label, value, valueColor = 'text-foreground' }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        </div>
      </div>
    </Card>
  );
}
