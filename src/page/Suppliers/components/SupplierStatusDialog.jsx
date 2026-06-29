import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SUPPLIER_STATUS } from '@/constants';

/**
 * Supplier status toggle confirmation dialog
 */
export function SupplierStatusDialog({ open, onOpenChange, supplier, onConfirm }) {
  const isActive = supplier?.status === SUPPLIER_STATUS.ACTIVE;
  const action = isActive ? 'deactivate' : 'activate';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? 'Ngừng hoạt động Nhà cung cấp' : 'Kích hoạt Nhà cung cấp'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn {isActive ? 'ngừng hoạt động' : 'kích hoạt'} "{supplier?.name}" không?
            {isActive && (
              <span className="block mt-2 text-destructive">
                Hành động này sẽ ngăn chặn việc tạo đơn nhập hàng mới với nhà cung cấp này.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {isActive ? 'Ngừng hoạt động' : 'Kích hoạt'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
