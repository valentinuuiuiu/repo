import axios from "axios";

type TemuCredentials = {
  apiKey: string;
  partnerId: string;
};

export class TemuSupplier {
  private credentials: TemuCredentials;
  private apiUrl: string;

  constructor(credentials: TemuCredentials) {
    this.credentials = credentials;
    this.apiUrl = "https://api.temu.com/v1";
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.credentials.apiKey}`,
      "Partner-ID": this.credentials.partnerId,
      "Content-Type": "application/json",
    };
  }

  async searchProducts(query: string, options: any = {}) {
    try {
      const response = await axios.get(`${this.apiUrl}/products/search`, {
        params: {
          q: query,
          ...options,
        },
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error("Failed to search Temu products:", error);
      throw error;
    }
  }

  async getProductDetails(productId: string) {
    try {
      const response = await axios.get(`${this.apiUrl}/products/${productId}`, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error("Failed to get Temu product details:", error);
      throw error;
    }
  }

  async placeOrder(orderData: any) {
    try {
      const response = await axios.post(`${this.apiUrl}/orders`, orderData, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error("Failed to place Temu order:", error);
      throw error;
    }
  }

  async getShippingRates(productIds: string[], quantity: number, address: any) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/shipping/rates`,
        {
          product_ids: productIds,
          quantity,
          shipping_address: address,
        },
        {
          headers: this.getHeaders(),
        },
      );

      return response.data;
    } catch (error) {
      console.error("Failed to get Temu shipping rates:", error);
      throw error;
    }
  }

  async trackOrder(orderId: string) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/orders/${orderId}/tracking`,
        {
          headers: this.getHeaders(),
        },
      );

      return response.data;
    } catch (error) {
      console.error("Failed to track Temu order:", error);
      throw error;
    }
  }
}
