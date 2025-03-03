import { Supplier } from '@/types/supplier';

// Base URL for API calls
const API_BASE_URL = '/api/suppliers';

/**
 * Fetch all suppliers with optional filtering
 */
export async function getSuppliers(filters?: {
  category?: string;
  country?: string;
  verified?: boolean;
  search?: string;
}): Promise<Supplier[]> {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.country) queryParams.append('country', filters.country);
    if (filters?.verified !== undefined) queryParams.append('verified', String(filters.verified));
    if (filters?.search) queryParams.append('search', filters.search);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching suppliers: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
    throw error;
  }
}

/**
 * Fetch a single supplier by ID
 */
export async function getSupplier(id: number): Promise<Supplier> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Error fetching supplier: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch supplier with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Connect with a supplier
 */
export async function connectWithSupplier(supplierId: number): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/${supplierId}/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error connecting with supplier: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to connect with supplier ID ${supplierId}:`, error);
    throw error;
  }
}

/**
 * Get supplier products
 */
export async function getSupplierProducts(supplierId: number): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/${supplierId}/products`);
    if (!response.ok) {
      throw new Error(`Error fetching supplier products: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch products for supplier ID ${supplierId}:`, error);
    throw error;
  }
}

/**
 * Request supplier samples
 */
export async function requestSamples(supplierId: number, productIds: number[], shippingDetails: any): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/${supplierId}/request-samples`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productIds,
        shippingDetails,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error requesting samples: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to request samples from supplier ID ${supplierId}:`, error);
    throw error;
  }
}

/**
 * Get supplier reviews
 */
export async function getSupplierReviews(supplierId: number): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/${supplierId}/reviews`);
    if (!response.ok) {
      throw new Error(`Error fetching supplier reviews: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch reviews for supplier ID ${supplierId}:`, error);
    throw error;
  }
}

/**
 * Submit a review for a supplier
 */
export async function submitSupplierReview(supplierId: number, review: { rating: number; comment: string }): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/${supplierId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(review),
    });

    if (!response.ok) {
      throw new Error(`Error submitting review: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to submit review for supplier ID ${supplierId}:`, error);
    throw error;
  }
}