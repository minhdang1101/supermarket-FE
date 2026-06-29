/**
 * Formatting utilities for the application
 */

/**
 * Format number as Vietnamese currency
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);
};

/**
 * Format date for display
 * @param {string|Date} dateString - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date with time
 * @param {string|Date} dateString - Date to format
 * @returns {string} - Formatted datetime string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date for long display
 * @param {string|Date} dateString - Date to format
 * @returns {string} - Formatted long date string
 */
export const formatLongDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format number with thousand separators
 * @param {number} number - Number to format
 * @returns {string} - Formatted number string
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat('vi-VN').format(number || 0);
};

/**
 * Format percentage
 * @param {number} value - Value to format (0-100)
 * @param {number} decimals - Decimal places
 * @returns {string} - Formatted percentage string
 */
export const formatPercent = (value, decimals = 1) => {
  return `${(value || 0).toFixed(decimals)}%`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Check if date is overdue
 * @param {string|Date} dateString - Date to check
 * @returns {boolean} - True if overdue
 */
export const isOverdue = (dateString) => {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
};
