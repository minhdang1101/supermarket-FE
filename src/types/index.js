/**
 * @fileoverview Type definitions using JSDoc for the application
 * These types provide IDE autocompletion and documentation
 */

// ============================================
// COMMON TYPES
// ============================================

/**
 * @typedef {Object} PaginationParams
 * @property {number} [page=0] - Page number (0-indexed)
 * @property {number} [size=10] - Items per page
 * @property {string} [sortBy] - Field to sort by
 * @property {'asc'|'desc'} [sortDir='desc'] - Sort direction
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array} content - Array of items
 * @property {number} totalElements - Total number of items
 * @property {number} totalPages - Total number of pages
 * @property {number} number - Current page number
 * @property {number} size - Page size
 * @property {boolean} first - Is first page
 * @property {boolean} last - Is last page
 */

/**
 * @typedef {Object} ApiError
 * @property {string} message - Error message
 * @property {number} status - HTTP status code
 * @property {string} [code] - Error code
 * @property {Object} [details] - Additional error details
 */

// ============================================
// SUPPLIER TYPES
// ============================================

/**
 * @typedef {'ACTIVE'|'INACTIVE'} SupplierStatus
 */

/**
 * @typedef {Object} Supplier
 * @property {number} supplierId - Unique identifier
 * @property {string} name - Supplier name
 * @property {string} [contactPerson] - Contact person name
 * @property {string} [phone] - Phone number
 * @property {string} [email] - Email address
 * @property {string} [address] - Address
 * @property {SupplierStatus} status - Supplier status
 */

/**
 * @typedef {Object} SupplierFormData
 * @property {string} name - Supplier name
 * @property {string} [contactPerson] - Contact person name
 * @property {string} [phone] - Phone number
 * @property {string} [email] - Email address
 * @property {string} [address] - Address
 */

/**
 * @typedef {Object} SupplierFilters
 * @property {string} [keyword] - Search keyword
 * @property {SupplierStatus} [status] - Filter by status
 */

// ============================================
// PRODUCT TYPES
// ============================================

/**
 * @typedef {'ACTIVE'|'INACTIVE'|'DISCONTINUED'} ProductStatus
 */

/**
 * @typedef {Object} Product
 * @property {number} productId - Unique identifier
 * @property {string} name - Product name
 * @property {string} [barcode] - Product barcode
 * @property {string} [description] - Product description
 * @property {string} [unit] - Unit of measurement
 * @property {number} costPrice - Cost price
 * @property {number} sellingPrice - Selling price
 * @property {number} stockLevel - Current stock level
 * @property {number} [minStockLevel] - Minimum stock level
 * @property {number} [maxStockLevel] - Maximum stock level
 * @property {number} [categoryId] - Category ID
 * @property {string} [categoryName] - Category name
 * @property {number} [supplierId] - Supplier ID
 * @property {string} [supplierName] - Supplier name
 * @property {ProductStatus} status - Product status
 */

// ============================================
// PURCHASE ORDER TYPES
// ============================================

/**
 * @typedef {'DRAFT'|'SENT'|'COMPLETED'|'CANCELLED'} OrderStatus
 */

/**
 * @typedef {Object} PurchaseOrderItem
 * @property {number} productId - Product ID
 * @property {number} quantity - Quantity ordered
 */

/**
 * @typedef {Object} PurchaseOrderDetail
 * @property {number} podId - Purchase order detail ID
 * @property {number} productId - Product ID
 * @property {string} productName - Product name
 * @property {string} [barcode] - Product barcode
 * @property {number} quantity - Quantity ordered
 * @property {number} unitPrice - Unit price
 * @property {number} totalPrice - Total price
 */

/**
 * @typedef {Object} PurchaseOrder
 * @property {number} poId - Purchase order ID
 * @property {string} orderDate - Order date
 * @property {OrderStatus} status - Order status
 * @property {number} totalAmount - Total amount
 * @property {string} [note] - Order notes
 * @property {string} [expectedDeliveryDate] - Expected delivery date
 * @property {number} supplierId - Supplier ID
 * @property {string} supplierName - Supplier name
 * @property {number} [createdByUserId] - User ID who created
 * @property {string} [createdByName] - User name who created
 * @property {PurchaseOrderDetail[]} [details] - Order details
 */

/**
 * @typedef {Object} CreatePurchaseOrderData
 * @property {number} supplierId - Supplier ID
 * @property {string} [note] - Order notes
 * @property {string} [expectedDeliveryDate] - Expected delivery date
 * @property {PurchaseOrderItem[]} items - Order items
 */

// ============================================
// GOODS RECEIPT TYPES
// ============================================

/**
 * @typedef {Object} GoodsReceiptItem
 * @property {number} productId - Product ID
 * @property {number} receivedQuantity - Quantity received
 * @property {string} [expiryDate] - Expiry date
 * @property {string} [batchNumber] - Batch number
 */

/**
 * @typedef {Object} GoodsReceiptDetail
 * @property {number} grdId - Goods receipt detail ID
 * @property {number} productId - Product ID
 * @property {string} productName - Product name
 * @property {string} [barcode] - Product barcode
 * @property {number} orderedQuantity - Quantity ordered
 * @property {number} receivedQuantity - Quantity received
 * @property {string} [expiryDate] - Expiry date
 * @property {string} [batchNumber] - Batch number
 */

/**
 * @typedef {Object} GoodsReceipt
 * @property {number} receiptId - Receipt ID
 * @property {number} poId - Purchase order ID
 * @property {string} receivedDate - Received date
 * @property {string} status - Receipt status
 * @property {string} [note] - Receipt notes
 * @property {number} [receivedByUserId] - User ID who received
 * @property {string} [receivedByName] - User name who received
 * @property {GoodsReceiptDetail[]} [details] - Receipt details
 */

/**
 * @typedef {Object} CreateGoodsReceiptData
 * @property {number} poId - Purchase order ID
 * @property {string} [note] - Receipt notes
 * @property {GoodsReceiptItem[]} items - Receipt items
 */

// ============================================
// STOCK ADJUSTMENT TYPES
// ============================================

/**
 * @typedef {'DAMAGED'|'LOST'|'EXPIRED'|'THEFT'|'CONSUMPTION'|'OTHER'} AdjustmentReason
 */

/**
 * @typedef {Object} StockAdjustment
 * @property {number} adjustmentId - Adjustment ID
 * @property {number} productId - Product ID
 * @property {string} productName - Product name
 * @property {string} [barcode] - Product barcode
 * @property {number} quantity - Quantity adjusted
 * @property {AdjustmentReason} reason - Adjustment reason
 * @property {string} [note] - Adjustment notes
 * @property {string} adjustedAt - Adjustment timestamp
 * @property {number} [adjustedByUserId] - User ID who adjusted
 * @property {string} [adjustedByName] - User name who adjusted
 * @property {number} stockAfterAdjustment - Stock after adjustment
 */

/**
 * @typedef {Object} CreateStockAdjustmentData
 * @property {number} productId - Product ID
 * @property {number} quantity - Quantity to adjust
 * @property {AdjustmentReason} reason - Adjustment reason
 * @property {string} [note] - Adjustment notes
 */

// ============================================
// HOOK RETURN TYPES
// ============================================

/**
 * @typedef {Object} UseQueryResult
 * @property {*} data - Query data
 * @property {boolean} isLoading - Loading state
 * @property {boolean} isError - Error state
 * @property {Error|null} error - Error object
 * @property {Function} refetch - Refetch function
 */

/**
 * @typedef {Object} UseMutationResult
 * @property {Function} mutate - Mutation function
 * @property {boolean} isLoading - Loading state
 * @property {boolean} isError - Error state
 * @property {boolean} isSuccess - Success state
 * @property {Error|null} error - Error object
 * @property {Function} reset - Reset mutation state
 */

export {};
