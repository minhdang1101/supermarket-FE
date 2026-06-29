import { useNavigate } from 'react-router-dom';
import { useSuppliersList, useSupplierCrud } from '@/hooks';
import { SUPPLIER_STATUS_OPTIONS } from '@/constants';

import { SuppliersHeader } from './components/SuppliersHeader';
import { SuppliersStats } from './components/SuppliersStats';
import { SuppliersFilters } from './components/SuppliersFilters';
import { SuppliersTable } from './components/SuppliersTable';
import { SupplierFormDialog } from './components/SupplierFormDialog';
import { SupplierStatusDialog } from './components/SupplierStatusDialog';

/**
 * Suppliers List Page
 * Thin page component that composes feature components
 */
export default function SuppliersPage() {
  const navigate = useNavigate();
  
  // Data fetching and filtering
  const {
    suppliers,
    loading,
    filters,
    pagination,
    stats,
    updateFilters,
    resetFilters,
    refetch,
  } = useSuppliersList();

  // CRUD operations
  const {
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
  } = useSupplierCrud();

  // Handlers
  const handleSearch = (value) => updateFilters({ keyword: value });
  const handleStatusFilter = (value) => updateFilters({ status: value });
  const handleViewDetails = (supplier) => navigate(`/suppliers/${supplier.supplierId}`);
  
  const handleSave = () => saveSupplier(refetch);
  const handleToggleStatus = (supplier) => toggleStatus(supplier, refetch);

  return (
    <div className="p-6 space-y-6">
      <SuppliersHeader onAdd={openCreateDialog} />

      <SuppliersStats stats={stats} />

      <SuppliersFilters
        onSearch={handleSearch}
        onFilterChange={handleStatusFilter}
        onReset={resetFilters}
        statusOptions={SUPPLIER_STATUS_OPTIONS}
      />

      <SuppliersTable
        suppliers={suppliers}
        loading={loading}
        onView={handleViewDetails}
        onEdit={openEditDialog}
        onToggleStatus={handleToggleStatus}
      />

      <SupplierFormDialog
        open={isDialogOpen}
        onOpenChange={closeDialog}
        isEditMode={isEditMode}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSave}
        submitting={submitting}
      />
    </div>
  );
}
