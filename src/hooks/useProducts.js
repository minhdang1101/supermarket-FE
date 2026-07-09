import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { productService } from '@/services/productService';
import { getErrorMessage } from '@/services/api';

/**
 * Hook to get active products for selection
 * @returns {Object} Products state
 */
export function useActiveProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getActiveProducts(0, 500);
        setProducts(response.data.content || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error(getErrorMessage(error));
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const searchProducts = useCallback(
    (searchTerm) => {
      if (!searchTerm) return products;
      
      const term = searchTerm.toLowerCase();
      return products.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          (product.barcode && product.barcode.toLowerCase().includes(term))
      );
    },
    [products]
  );

  return { products, loading, searchProducts };
}

/**
 * Hook to get product by ID
 * @param {string|number} id - Product ID
 * @returns {Object} Product state
 */
export function useProductDetail(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productService.getById(id);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        setError(err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
}

/**
 * Hook for product search with debounce
 * @param {Array} products - Array of products to search
 * @param {number} debounceMs - Debounce delay in milliseconds
 * @returns {Object} Search state and handlers
 */
export function useProductSearch(products, debounceMs = 300) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  const filteredProducts = debouncedTerm
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(debouncedTerm.toLowerCase()) ||
          (product.barcode && product.barcode.toLowerCase().includes(debouncedTerm.toLowerCase()))
      )
    : products;

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedTerm('');
    setIsOpen(false);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    filteredProducts,
    isOpen,
    setIsOpen,
    clearSearch,
  };
}
