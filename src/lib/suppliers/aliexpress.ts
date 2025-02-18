import axios from "axios";

type AliExpressCredentials = {
  apiKey: string;
  trackingId: string;
};

export class AliExpressSupplier {
  private credentials: AliExpressCredentials;
  private apiUrl: string;

  constructor(credentials: AliExpressCredentials) {
    this.credentials = credentials;
    this.apiUrl = "https://api.aliexpress.com/v2";
  }

  private getHeaders() {
    return {
      "x-api-key": this.credentials.apiKey,
      "Content-Type": "application/json",
    };
  }

  async searchProducts(query: string, options: any = {}) {
    try {
      const response = await axios.get(`${this.apiUrl}/products/search`, {
        params: {
          q: query,
          tracking_id: this.credentials.trackingId,
          ...options,
        },
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error("Failed to search AliExpress products:", error);
      throw error;
    }
  }

  async getProductDetails(productId: string) {
    try {
      const response = await axios.get(`${this.apiUrl}/products/${productId}`, {
        params: {
          tracking_id: this.credentials.trackingId,
        },
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error("Failed to get AliExpress product details:", error);
      throw error;
    }
  }

  async placeOrder(orderData: any) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/orders`,
        {
          ...orderData,
          tracking_id: this.credentials.trackingId,
        },
        {
          headers: this.getHeaders(),
        },
      );

      return response.data;
    } catch (error) {
      console.error("Failed to place AliExpress order:", error);
      throw error;
    }
  }

  async getShippingInfo(productId: string, quantity: number, country: string) {
    try {
      const response = await axios.get(`${this.apiUrl}/shipping/info`, {
        params: {
          product_id: productId,
          quantity,
          country,
          tracking_id: this.credentials.trackingId,
        },
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error("Failed to get AliExpress shipping info:", error);
      throw error;
    }
  }
}
