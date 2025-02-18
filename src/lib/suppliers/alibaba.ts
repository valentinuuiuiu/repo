import axios from "axios";

type AlibabaCredentials = {
  apiKey: string;
  apiSecret: string;
};

export class AlibabaSupplier {
  private credentials: AlibabaCredentials;
  private apiUrl: string;

  constructor(credentials: AlibabaCredentials) {
    this.credentials = credentials;
    this.apiUrl = "https://api.alibaba.com/v2";
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.credentials.apiKey}`,
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
      console.error("Failed to search Alibaba products:", error);
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
      console.error("Failed to get Alibaba product details:", error);
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
      console.error("Failed to place Alibaba order:", error);
      throw error;
    }
  }

  async getShippingMethods(
    productId: string,
    quantity: number,
    country: string,
  ) {
    try {
      const response = await axios.get(`${this.apiUrl}/logistics/shipping`, {
        params: {
          productId,
          quantity,
          country,
        },
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error("Failed to get Alibaba shipping methods:", error);
      throw error;
    }
  }
}
