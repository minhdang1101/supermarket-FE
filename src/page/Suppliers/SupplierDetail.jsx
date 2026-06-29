import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  User,
  Package,
  Calendar,
  DollarSign,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Plus,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supplierService } from '@/services/supplierService';
import { purchaseOrderService } from '@/services/purchaseOrderService';

export default function SupplierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await supplierService.getById(id);
        setSupplier(response.data);
        setFormData({
          name: response.data.name || '',
          contactPerson: response.data.contactPerson || '',
          phone: response.data.phone || '',
          email: response.data.email || '',
          address: response.data.address || '',
        });
      } catch (error) {
        console.error('Error fetching supplier:', error);
        toast.error('Failed to load supplier details');
        navigate('/suppliers');
      } finally {
        setLoading(false);
      }

      try {
        setOrdersLoading(true);
        const ordersResponse = await purchaseOrderService.getBySupplier(id, 0, 50);
        setPurchaseOrders(ordersResponse.data.content || []);
      } catch (error) {
        console.error('Error fetching purchase orders:', error);
      } finally {
        setOrdersLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const refreshSupplier = async () => {
    try {
      const response = await supplierService.getById(id);
      setSupplier(response.data);
      setFormData({
        name: response.data.name || '',
        contactPerson: response.data.contactPerson || '',
        phone: response.data.phone || '',
        email: response.data.email || '',
        address: response.data.address || '',
      });
    } catch (error) {
      console.error('Error refreshing supplier:', error);
      toast.error('Failed to refresh supplier details');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSupplier = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Supplier name is required');
      return;
    }

    try {
      setSubmitting(true);
      await supplierService.update(id, formData);
      toast.success('Supplier updated successfully');
      setIsEditDialogOpen(false);
      refreshSupplier();
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast.error(error.response?.data?.message || 'Failed to update supplier');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await supplierService.toggleStatus(id);
      toast.success(
        `Supplier ${supplier.status === true ? 'deactivated' : 'activated'} successfully`
      );
      refreshSupplier();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update supplier status');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { variant: 'secondary', icon: FileText },
      SENT: { variant: 'default', icon: Clock },
      COMPLETED: { variant: 'success', icon: CheckCircle },
      CANCELLED: { variant: 'destructive', icon: XCircle },
    };
    const config = statusConfig[status] || statusConfig.DRAFT;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon size={12} />
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const orderColumns = [
    {
      key: 'poId',
      label: 'PO #',
      width: 'w-20',
      render: (value) => <span className="font-mono text-sm">#{value}</span>,
    },
    {
      key: 'orderDate',
      label: 'Order Date',
      width: 'w-28',
      render: (value) => formatDate(value),
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-28',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      width: 'w-32',
      render: (value) => <span className="font-medium">{formatCurrency(value)}</span>,
    },
    {
      key: 'expectedDeliveryDate',
      label: 'Expected Delivery',
      width: 'w-28',
      render: (value) => formatDate(value),
    },
    {
      key: 'createdByName',
      label: 'Created By',
      width: 'w-28',
    },
  ];

  const orderActions = [
    {
      label: 'View Details',
      onClick: (item) => navigate(`/purchase-orders/${item.poId}`),
    },
  ];

  const orderStats = {
    total: purchaseOrders.length,
    draft: purchaseOrders.filter((o) => o.status === 'DRAFT').length,
    sent: purchaseOrders.filter((o) => o.status === 'SENT').length,
    completed: purchaseOrders.filter((o) => o.status === 'COMPLETED').length,
    totalValue: purchaseOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-1" />
          <Skeleton className="h-64 col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/suppliers')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{supplier?.name}</h1>
            <p className="text-muted-foreground mt-1">Supplier Details & Import History</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
          <Button
            variant={supplier?.status === true ? 'destructive' : 'default'}
            onClick={handleToggleStatus}
          >
            {supplier?.status === true ? (
              <>
                <XCircle size={16} className="mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle size={16} className="mr-2" />
                Activate
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 size={20} />
              Supplier Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={supplier?.status === true ? 'default' : 'secondary'}>
                {supplier?.status === true ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User size={16} className="text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Contact Person</p>
                  <p className="font-medium">{supplier?.contactPerson || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={16} className="text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{supplier?.phone || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={16} className="text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{supplier?.email || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="font-medium">{supplier?.address || '-'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package size={20} />
              Purchase Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{orderStats.total}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                <p className="text-2xl font-bold text-gray-600">{orderStats.draft}</p>
                <p className="text-xs text-muted-foreground">Draft</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-2xl font-bold text-blue-600">{orderStats.sent}</p>
                <p className="text-xs text-muted-foreground">Sent</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-2xl font-bold text-green-600">{orderStats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary/10">
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(orderStats.totalValue)}
                </p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Import Order History</CardTitle>
            <Button onClick={() => navigate('/purchase-orders/new', { state: { supplierId: id } })}>
              <Plus size={16} className="mr-2" />
              Create New Order
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={orderColumns}
            data={purchaseOrders}
            actions={orderActions}
            keyField="poId"
            loading={ordersLoading}
            emptyMessage="No purchase orders found for this supplier"
          />
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>Update supplier information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSupplier}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Supplier Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter supplier name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  placeholder="Enter contact person name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    placeholder="supplier@email.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter supplier address"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
