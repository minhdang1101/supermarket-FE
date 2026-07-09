import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { supplierService } from '@/services/supplierService';
import { getErrorMessage } from '@/services/api';
import { DEFAULT_PAGE_SIZE } from '@/constants';

/**
 * @typedef {import('@/types').Supplier} Supplier
 * @typedef {import('@/types').SupplierFormData} SupplierFormData
 * @typedef {import('@/types').SupplierFilters} SupplierFilters
 */

const initialFormData = {
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
};

/**
 * Custom hook for managing suppliers list with pagination and filtering
 * @returns {Object} Suppliers list state and actions
 */
export function useSuppliersList() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: '', status: '' });
  const [pagination, setPagination] = useState({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
  });

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await supplierService.search(
        filters.keyword,
        filters.status,
        pagination.page,
        pagination.size
      );
      const data = response.data;
      setSuppliers(data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
      }));
    } catch (error) {
      toast.error(getErrorMessage(error));
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [filters.keyword, filters.status, pagination.page, pagination.size]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ keyword: '', status: '' });
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, []);

  const goToPage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const stats = {
    total: pagination.totalElements,
    active: suppliers.filter((s) => s.status === true).length,
    inactive: suppliers.filter((s) => s.status !== true).length,
  };

  return {
    suppliers,
    loading,
    filters,
    pagination,
    stats,
    updateFilters,
    resetFilters,
    goToPage,
    refetch: fetchSuppliers,
  };
}

/**
 * Custom hook for managing single supplier CRUD operations
 * @returns {Object} Supplier CRUD state and actions
 */
export function useSupplierCrud() {
  const [formData, setFormData] = useState(initialFormData);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const openCreateDialog = useCallback(() => {
    setIsEditMode(false);
    setSelectedSupplier(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((supplier) => {
    setIsEditMode(true);
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name || '',
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
    });
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setFormData(initialFormData);
    setSelectedSupplier(null);
    setIsEditMode(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  /**
   * Save supplier (create or update)
   * @param {Function} onSuccess - Callback on success
   * @returns {Promise<boolean>} - Success status
   */
  const saveSupplier = useCallback(
    async (onSuccess) => {
      if (!formData.name.trim()) {
        toast.error('Supplier name is required');
        return false;
      }

      try {
        setSubmitting(true);
        if (isEditMode && selectedSupplier) {
          await supplierService.update(selectedSupplier.supplierId, formData);
          toast.success('Supplier updated successfully');
        } else {
          await supplierService.create(formData);
          toast.success('Supplier created successfully');
        }
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
    [formData, isEditMode, selectedSupplier, closeDialog]
  );

  /**
   * Toggle supplier status (active/inactive)
   * @param {Supplier} supplier - Supplier to toggle
   * @param {Function} onSuccess - Callback on success
   */
  const toggleStatus = useCallback(async (supplier, onSuccess) => {
    try {
      await supplierService.toggleStatus(supplier.supplierId);
      toast.success(
        `Supplier ${supplier.status === true ? 'deactivated' : 'activated'} successfully`
      );
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, []);

  return {
    formData,
    selectedSupplier,
    isDialogOpen,
    isEditMode,
    submitting,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleInputChange,
    saveSupplier,
    toggleStatus,
    setFormData,
  };
}

/**
 * Custom hook for fetching single supplier details
 * @param {string|number} id - Supplier ID
 * @returns {Object} Supplier detail state and actions
 */
export function useSupplierDetail(id) {
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSupplier = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await supplierService.getById(id);
      setSupplier(response.data);
    } catch (err) {
      setError(err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSupplier();
  }, [fetchSupplier]);

  const updateSupplier = useCallback(
    async (data) => {
      try {
        await supplierService.update(id, data);
        toast.success('Supplier updated successfully');
        await fetchSupplier();
        return true;
      } catch (error) {
        toast.error(getErrorMessage(error));
        return false;
      }
    },
    [id, fetchSupplier]
  );

  const toggleStatus = useCallback(async () => {
    try {
      await supplierService.toggleStatus(id);
      toast.success(
        `Supplier ${supplier?.status === true ? 'deactivated' : 'activated'} successfully`
      );
      await fetchSupplier();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, [id, supplier?.status, fetchSupplier]);

  return {
    supplier,
    loading,
    error,
    refetch: fetchSupplier,
    updateSupplier,
    toggleStatus,
  };
}

/**
 * Hook to get active suppliers for dropdowns
 * @returns {Object} Active suppliers state
 */
export function useActiveSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await supplierService.search('', 'ACTIVE', 0, 100);
        setSuppliers(response.data.content || []);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  return { suppliers, loading };
}
