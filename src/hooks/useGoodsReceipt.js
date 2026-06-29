import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { purchaseOrderService } from '@/services/purchaseOrderService';
import { goodsReceiptService } from '@/services/goodsReceiptService';
import { getErrorMessage } from '@/services/api';
import { ORDER_STATUS } from '@/constants';

/**
 * Custom hook for managing goods receiving process
 * @param {string|number} poId - Purchase order ID
 * @param {Function} onSuccess - Callback on successful receipt
 * @returns {Object} Goods receipt state and actions
 */
export function useGoodsReceipt(poId, onSuccess) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState('');
  const [receiptItems, setReceiptItems] = useState([]);
  const [error, setError] = useState(null);

  // Fetch order details
  useEffect(() => {
    if (!poId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await purchaseOrderService.getById(poId);
        const orderData = response.data;

        if (orderData.status !== ORDER_STATUS.SENT && orderData.status !== ORDER_STATUS.COMPLETED) {
          setError(new Error('This order is not ready for receiving'));
          return;
        }

        setOrder(orderData);
        setReceiptItems(
          orderData.details.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            barcode: item.barcode,
            orderedQuantity: item.quantity,
            receivedQuantity: item.quantity,
            expiryDate: '',
            batchNumber: '',
          }))
        );
      } catch (err) {
        setError(err);
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [poId]);

  const updateReceivedQuantity = useCallback((productId, quantity) => {
    const qty = Math.max(0, parseInt(quantity) || 0);
    setReceiptItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, receivedQuantity: qty } : item
      )
    );
  }, []);

  const updateExpiryDate = useCallback((productId, date) => {
    setReceiptItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, expiryDate: date } : item
      )
    );
  }, []);

  const updateBatchNumber = useCallback((productId, batchNumber) => {
    setReceiptItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, batchNumber } : item
      )
    );
  }, []);

  const totalOrdered = receiptItems.reduce((sum, item) => sum + item.orderedQuantity, 0);
  const totalReceived = receiptItems.reduce((sum, item) => sum + item.receivedQuantity, 0);
  const hasDiscrepancies = receiptItems.some(
    (item) => item.receivedQuantity !== item.orderedQuantity
  );

  const getQuantityStatus = useCallback((ordered, received) => {
    if (received === ordered) return { status: 'complete', label: 'Full' };
    if (received < ordered) return { status: 'partial', label: 'Partial' };
    return { status: 'over', label: 'Over' };
  }, []);

  const validate = useCallback(() => {
    const itemsToReceive = receiptItems.filter((item) => item.receivedQuantity > 0);

    if (itemsToReceive.length === 0) {
      toast.error('At least one item must have quantity received');
      return false;
    }

    return true;
  }, [receiptItems]);

  const submitReceipt = useCallback(async () => {
    if (!validate()) return false;

    try {
      setSubmitting(true);
      const payload = {
        poId: parseInt(poId),
        note: note || '',
        items: receiptItems
          .filter((item) => item.receivedQuantity > 0)
          .map((item) => ({
            productId: item.productId,
            receivedQuantity: item.receivedQuantity,
            expiryDate: item.expiryDate || null,
            batchNumber: item.batchNumber || null,
          })),
      };

      await goodsReceiptService.create(payload);
      toast.success('Goods received successfully! Inventory updated.');
      onSuccess?.();
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [poId, note, receiptItems, validate, onSuccess]);

  return {
    order,
    loading,
    submitting,
    error,
    note,
    setNote,
    receiptItems,
    totalOrdered,
    totalReceived,
    hasDiscrepancies,
    updateReceivedQuantity,
    updateExpiryDate,
    updateBatchNumber,
    getQuantityStatus,
    submitReceipt,
  };
}
