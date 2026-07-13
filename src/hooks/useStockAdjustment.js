import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { stockAdjustmentService } from '@/services/stockAdjustmentService';
import { getErrorMessage } from '@/services/api';
import { ADJUSTMENT_REASON_CONFIG } from '@/constants';

/**
 * Custom hook for managing stock adjustments
 * @returns {Object} Stock adjustment state and actions
 */
export function useStockAdjustments() {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterReason, setFilterReason] = useState('');

  const fetchAdjustments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await stockAdjustmentService.getHistory(null, 0, 50);
      setAdjustments(response.data?.content || []);
    } catch (error) {
      console.error('Error fetching adjustments:', error);
      setAdjustments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdjustments();
  }, [fetchAdjustments]);

  const filteredAdjustments = filterReason
    ? adjustments.filter((a) => a.reason === filterReason)
    : adjustments;

  const stats = {
    total: adjustments.reduce((sum, a) => sum + a.quantity, 0),
    byReason: Object.keys(ADJUSTMENT_REASON_CONFIG).reduce((acc, reason) => {
      acc[reason] = adjustments.filter((a) => a.reason === reason).length;
      return acc;
    }, {}),
  };

  return {
    adjustments: filteredAdjustments,
    allAdjustments: adjustments,
    loading,
    filterReason,
    setFilterReason,
    stats,
    refetch: fetchAdjustments,
  };
}

/**
 * Custom hook for creating stock adjustment
 * @returns {Object} Create adjustment state and actions
 */
export function useCreateStockAdjustment() {
  const [formData, setFormData] = useState({
    product: null,
    quantity: 1,
    reason: '',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = useCallback(() => {
    setFormData({
      product: null,
      quantity: 1,
      reason: '',
      note: '',
    });
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const selectProduct = useCallback((product) => {
    setFormData((prev) => ({
      ...prev,
      product,
      quantity: 1,
    }));
  }, []);

  const updateQuantity = useCallback((value) => {
    const qty = Math.max(1, parseInt(value) || 1);
    setFormData((prev) => ({
      ...prev,
      quantity: Math.min(qty, prev.product?.stockLevel || qty),
    }));
  }, []);

  const updateReason = useCallback((reason) => {
    setFormData((prev) => ({ ...prev, reason }));
  }, []);

  const updateNote = useCallback((note) => {
    setFormData((prev) => ({ ...prev, note }));
  }, []);

  const validate = useCallback(() => {
    if (!formData.product) {
      toast.error('Please select a product');
      return false;
    }
    if (!formData.reason) {
      toast.error('Please select a reason');
      return false;
    }
    if (formData.quantity < 1) {
      toast.error('Quantity must be at least 1');
      return false;
    }
    if (formData.quantity > formData.product.stockLevel) {
      toast.error('Quantity cannot exceed current stock');
      return false;
    }
    return true;
  }, [formData]);

  const submitAdjustment = useCallback(
    async (onSuccess) => {
      if (!validate()) return false;

      try {
        setSubmitting(true);
        await stockAdjustmentService.create(
          formData.product.productId,
          formData.quantity,
          formData.reason,
          formData.note
        );

        toast.success('Stock adjustment recorded successfully');
        closeDialog();
        onSuccess?.();
        return true;
      } catch (error) {
        toast.error(getErrorMessage(error));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [formData, validate, closeDialog]
  );

  const stockAfter = formData.product
    ? formData.product.stockLevel - formData.quantity
    : 0;

  return {
    formData,
    submitting,
    isDialogOpen,
    stockAfter,
    openDialog,
    closeDialog,
    selectProduct,
    updateQuantity,
    updateReason,
    updateNote,
    submitAdjustment,
  };
}
