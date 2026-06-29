import { Button } from '@/components/ui/button';
import { Plus, Download, Printer } from 'lucide-react';

export function ActionButtons({
  onAdd,
  onExport,
  onPrint,
  addLabel = 'Add New',
  showAdd = true,
  showExport = true,
  showPrint = true,
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {showAdd && (
        <Button onClick={onAdd} className="gap-2">
          <Plus size={16} />
          {addLabel}
        </Button>
      )}
      {showExport && (
        <Button variant="outline" onClick={onExport} className="gap-2">
          <Download size={16} />
          Export
        </Button>
      )}
      {showPrint && (
        <Button variant="outline" onClick={onPrint} className="gap-2">
          <Printer size={16} />
          Print
        </Button>
      )}
    </div>
  );
}
