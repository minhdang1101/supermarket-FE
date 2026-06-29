/**
 * Application-wide constants and enums
 */

// ============================================
// SUPPLIER
// ============================================
export const SUPPLIER_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
};

export const SUPPLIER_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

// ============================================
// PURCHASE ORDER
// ============================================
export const ORDER_STATUS = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: ORDER_STATUS.DRAFT, label: 'Draft' },
  { value: ORDER_STATUS.SENT, label: 'Sent' },
  { value: ORDER_STATUS.COMPLETED, label: 'Completed' },
  { value: ORDER_STATUS.CANCELLED, label: 'Cancelled' },
];

export const ORDER_STATUS_CONFIG = {
  [ORDER_STATUS.DRAFT]: {
    label: 'Draft',
    variant: 'secondary',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  [ORDER_STATUS.SENT]: {
    label: 'Sent',
    variant: 'default',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  [ORDER_STATUS.COMPLETED]: {
    label: 'Completed',
    variant: 'success',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  [ORDER_STATUS.CANCELLED]: {
    label: 'Cancelled',
    variant: 'destructive',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
};

// ============================================
// STOCK ADJUSTMENT
// ============================================
export const ADJUSTMENT_REASON = {
  DAMAGED: 'DAMAGED',
  LOST: 'LOST',
  EXPIRED: 'EXPIRED',
  THEFT: 'THEFT',
  CONSUMPTION: 'CONSUMPTION',
  OTHER: 'OTHER',
};

export const ADJUSTMENT_REASON_OPTIONS = [
  { value: ADJUSTMENT_REASON.DAMAGED, label: 'Damaged', icon: 'PackageX' },
  { value: ADJUSTMENT_REASON.LOST, label: 'Lost', icon: 'Ban' },
  { value: ADJUSTMENT_REASON.EXPIRED, label: 'Expired', icon: 'Clock' },
  { value: ADJUSTMENT_REASON.THEFT, label: 'Theft', icon: 'AlertTriangle' },
  { value: ADJUSTMENT_REASON.CONSUMPTION, label: 'Consumption', icon: 'Package' },
  { value: ADJUSTMENT_REASON.OTHER, label: 'Other', icon: 'ClipboardList' },
];

export const ADJUSTMENT_REASON_CONFIG = {
  [ADJUSTMENT_REASON.DAMAGED]: {
    label: 'Damaged',
    variant: 'destructive',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  [ADJUSTMENT_REASON.LOST]: {
    label: 'Lost',
    variant: 'secondary',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  [ADJUSTMENT_REASON.EXPIRED]: {
    label: 'Expired',
    variant: 'warning',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  [ADJUSTMENT_REASON.THEFT]: {
    label: 'Theft',
    variant: 'destructive',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  [ADJUSTMENT_REASON.CONSUMPTION]: {
    label: 'Consumption',
    variant: 'default',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  [ADJUSTMENT_REASON.OTHER]: {
    label: 'Other',
    variant: 'outline',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
  },
};

// ============================================
// PRODUCT
// ============================================
export const PRODUCT_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
};

// ============================================
// PAGINATION
// ============================================
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ============================================
// DATE FORMATS
// ============================================
export const DATE_FORMAT = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss",
};

// ============================================
// API
// ============================================
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },
  SUPPLIERS: '/suppliers',
  PRODUCTS: '/products',
  PURCHASE_ORDERS: '/purchase-orders',
  GOODS_RECEIPTS: '/goods-receipts',
  STOCK_ADJUSTMENTS: '/stock/adjustments',
  INVENTORY: '/inventory',
};

// ============================================
// MESSAGES
// ============================================
export const MESSAGES = {
  ERROR: {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Session expired. Please login again.',
    VALIDATION: 'Please check your input and try again.',
  },
  SUCCESS: {
    CREATE: 'Created successfully',
    UPDATE: 'Updated successfully',
    DELETE: 'Deleted successfully',
  },
};
