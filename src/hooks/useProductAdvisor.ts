import { useAIAgent } from './useAIAgent';
import { Product } from '../types/product'; // Assume you have a product type

export const useProductAdvisor = () => {
  const { 
    getAgentResponse, 
    interactions, 
    isLoading, 
    error 
  } = useAIAgent('product-advisor');

  const getProductRecommendations = async (
    userProfile: any, 
    currentProducts: Product[]
  ) => {
    const context = {
      userProfile,
      currentProducts: currentProducts.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category
      }))
    };

    return getAgentResponse(
      'Generate personalized product recommendations based on user profile and current products', 
      context
    );
  };

  const generateProductDescription = async (product: Product) => {
    return getAgentResponse(
      `Create an engaging product description that highlights key features and benefits`, 
      { product }
    );
  };

  return {
    getProductRecommendations,
    generateProductDescription,
    interactions,
    isLoading,
    error
  };
};