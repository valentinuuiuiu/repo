// Platform type definitions
export interface PlatformPricing {
  basic: string;
  advanced: string;
  enterprise: string;
}

export interface Platform {
  id: number;
  name: string;
  logo: string;
  description: string;
  features: string[];
  pricing: PlatformPricing;
  integrationSupport: boolean;
  marketplaces: string[];
}