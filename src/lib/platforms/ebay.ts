import axios from "axios";

type EbayCredentials = {
  clientId: string;
  clientSecret: string;
  refreshToken?: string;
};

export class EbayIntegration {
  private credentials: EbayCredentials;
  private accessToken?: string;
  private apiUrl: string;

  constructor(credentials: EbayCredentials) {
    this.credentials = credentials;
    this.apiUrl = "https://api.ebay.com/sell/inventory/v1";
  }

  private async authenticate() {
    try {
      const response = await axios.post(
        "https://api.ebay.com/identity/v1/oauth2/token",
        {
          grant_type: "client_credentials",
          scope: "https://api.ebay.com/oauth/api_scope",
        },
        {
          auth: {
            username: this.credentials.clientId,
            password: this.credentials.clientSecret,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      this.accessToken = response.data.access_token;
    } catch (error) {
      console.error("eBay authentication failed:", error);
      throw error;
    }
  }

  async createProduct(product: any) {
    if (!this.accessToken) await this.authenticate();

    try {
      const response = await axios.post(
        `${this.apiUrl}/inventory_item`,
        {
          product: {
            title: product.title,
            description: product.description,
            aspects: {},
            imageUrls: product.images,
          },
          availability: {
            shipToLocationAvailability: {
              quantity: product.inventory,
            },
          },
          condition: "NEW",
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Failed to create eBay product:", error);
      throw error;
    }
  }

  async updateProduct(sku: string, updates: any) {
    if (!this.accessToken) await this.authenticate();

    try {
      const response = await axios.put(
        `${this.apiUrl}/inventory_item/${sku}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Failed to update eBay product:", error);
      throw error;
    }
  }

  async getOrders() {
    if (!this.accessToken) {

    try {
      const response = await axios.get(`${this.apiUrl}/order`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Failed to fetch eBay orders:", error);
      throw error;
    }
  }
}
