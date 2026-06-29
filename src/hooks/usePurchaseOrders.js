import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { purchaseOrderService } from '@/services/purchaseOrderService';
import { getErrorMessage } from '@/services/api';
import { DEFAULT_PAGE_SIZE, ORDER_STATUS } from '@/constants';

/**
 * Custom hook for managing purchase orders list
 * @returns {Object} Purchase orders list state and actions
 */
export function usePurchaseOrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ supplierId: '', status: '' });
  const [pagination, setPagination] = useState({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
  });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderService.search(
        filters.supplierId || null,
        filters.status || null,
        pagination.page,
        pagination.size
      );
      const data = response.data;
      setOrders(data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
      }));
    } catch (error) {
      toast.error(getErrorMessage(error));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filters.supplierId, filters.status, pagination.page, pagination.size]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateFilters = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ supplierId: '', status: '' });
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, []);

  const goToPage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const updateOrderStatus = useCallback(
    async (orderId, newStatus) => {
      try {
        await purchaseOrderService.updateStatus(orderId, newStatus);
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
        return true;
      } catch (error) {
        toast.error(getErrorMessage(error));
        return false;
      }
    },
    [fetchOrders]
  );

  const stats = {
    total: pagination.totalElements,
    draft: orders.filter((o) => o.status === ORDER_STATUS.DRAFT).length,
    sent: orders.filter((o) => o.status === ORDER_STATUS.SENT).length,
    completed: orders.filter((o) => o.status === ORDER_STATUS.COMPLETED).length,
  };

  return {
    orders,
    loading,
    filters,
    pagination,
    stats,
    updateFilters,
    resetFilters,
    goToPage,
    updateOrderStatus,
    refetch: fetchOrders,
  };
}

/**
 * Custom hook for fetching single purchase order details
 * @param {string|number} id - Purchase order ID
 * @returns {Object} Order detail state
 */
export function usePurchaseOrderDetail(id) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await purchaseOrderService.getById(id);
      setOrder(response.data);
    } catch (err) {
      setError(err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus = useCallback(
    async (newStatus) => {
      try {
        await purchaseOrderService.updateStatus(id, newStatus);
        toast.success(`Order status updated to ${newStatus}`);
        await fetchOrder();
        return true;
      } catch (error) {
        toast.error(getErrorMessage(error));
        return false;
      }
    },
    [id, fetchOrder]
  );

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
    updateStatus,
  };
}

/**
 * Custom hook for creating purchase orders
 * @returns {Object} Create order state and actions
 */
export function useCreatePurchaseOrder() {
  const [formData, setFormData] = useState({
    supplierId: '',
    expectedDeliveryDate: '',
    note: '',
  });
  const [orderItems, setOrderItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const updateFormData = useCallback((updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const addProduct = useCallback((product) => {
    if (orderItems.find((item) => item.productId === product.productId)) {
      toast.error('Product already added');
      return false;
    }

    setOrderItems((prev) => [
      ...prev,
      {
        productId: product.productId,
        productName: product.name,
        barcode: product.barcode,
        costPrice: product.costPrice || 0,
        quantity: 1,
        totalPrice: product.costPrice || 0,
      },
    ]);
    return true;
  }, [orderItems]);

  const updateQuantity = useCallback((productId, quantity) => {
    const qty = Math.max(1, parseInt(quantity) || 1);
    setOrderItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: qty, totalPrice: qty * item.costPrice }
          : item
      )
    );
  }, []);

  const removeProduct = useCallback((productId) => {
    setOrderItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const clearItems = useCallback(() => {
    setOrderItems([]);
  }, []);

  const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  const validate = useCallback(() => {
    if (!formData.supplierId) {
      toast.error('Please select a supplier');
      return false;
    }
    if (orderItems.length === 0) {
      toast.error('Please add at least one product');
      return false;
    }
    return true;
  }, [formData.supplierId, orderItems.length]);

  const createOrder = useCallback(
    async (status = 'DRAFT') => {
      if (!validate()) return null;

      try {
        setSubmitting(true);
        const payload = {
          supplierId: parseInt(formData.supplierId),
          expectedDeliveryDate: formData.expectedDeliveryDate || null,
          note: formData.note || '',
          items: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        };

        const response = await purchaseOrderService.create(payload);
        const poId = response.data.poId;

        if (status === 'SENT') {
          await purchaseOrderService.updateStatus(poId, 'SENT');
          toast.success('Purchase order created and sent to supplier');
        } else {
          toast.success('Purchase order created as draft');
        }

        return poId;
      } catch (error) {
        toast.error(getErrorMessage(error));
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [formData, orderItems, validate]
  );

  const reset = useCallback(() => {
    setFormData({
      supplierId: '',
      expectedDeliveryDate: '',
      note: '',
    });
    setOrderItems([]);
  }, []);

  return {
    formData,
    orderItems,
    submitting,
    totalAmount,
    totalQuantity,
    updateFormData,
    addProduct,
    updateQuantity,
    removeProduct,
    clearItems,
    createOrder,
    reset,
  };
}

/**
 * Hook to get orders by supplier
 * @param {string|number} supplierId - Supplier ID
 * @returns {Object} Orders by supplier state
 */
export function useOrdersBySupplier(supplierId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supplierId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await purchaseOrderService.getBySupplier(supplierId, 0, 50);
        setOrders(response.data.content || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [supplierId]);

  const stats = {
    total: orders.length,
    draft: orders.filter((o) => o.status === ORDER_STATUS.DRAFT).length,
    sent: orders.filter((o) => o.status === ORDER_STATUS.SENT).length,
    completed: orders.filter((o) => o.status === ORDER_STATUS.COMPLETED).length,
    totalValue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
  };

  return { orders, loading, stats };
}

/**
 * Hook to get pending orders for goods receiving
 * @returns {Object} Pending orders state
 */
export function usePendingOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supplierId, setSupplierId] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    totalElements: 0,
  });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderService.search(
        supplierId || null,
        ORDER_STATUS.SENT,
        pagination.page,
        pagination.size
      );
      const data = response.data;
      setOrders(data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalElements: data.totalElements || 0,
      }));
    } catch (error) {
      toast.error(getErrorMessage(error));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [supplierId, pagination.page, pagination.size]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filterBySupplier = useCallback((id) => {
    setSupplierId(id);
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, []);

  const overdueCount = orders.filter(
    (o) => o.expectedDeliveryDate && new Date(o.expectedDeliveryDate) < new Date()
  ).length;

  return {
    orders,
    loading,
    pagination,
    supplierId,
    overdueCount,
    filterBySupplier,
    refetch: fetchOrders,
  };
}
