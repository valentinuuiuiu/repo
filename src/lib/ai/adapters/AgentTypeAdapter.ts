import { AgentType as PrismaAgentType } from '@prisma/client';
import { AgentType as LocalAgentType } from '../../../types/agent';

/**
 * This adapter maps between the application's local AgentType enum and Prisma's AgentType enum
 * to ensure compatibility between different parts of the system.
 */

export function localToPrismaAgentType(localType: LocalAgentType): PrismaAgentType {
  // Map local agent types to Prisma agent types
  const mapping: Record<LocalAgentType, PrismaAgentType> = {
    [LocalAgentType.PRODUCT_LEADER]: PrismaAgentType.PRODUCT_OPTIMIZATION,
    [LocalAgentType.CUSTOMER_SUPPORT_LEADER]: PrismaAgentType.CUSTOMER_SERVICE,
    [LocalAgentType.MARKET_RESEARCH_LEADER]: PrismaAgentType.MARKET_RESEARCH,
    [LocalAgentType.OPERATIONS_LEADER]: PrismaAgentType.INVENTORY_MANAGEMENT,
    [LocalAgentType.SALES_LEADER]: PrismaAgentType.MARKETING_OPTIMIZATION,
  };
  
  return mapping[localType] || PrismaAgentType.PRODUCT_OPTIMIZATION; // Default to PRODUCT_OPTIMIZATION if no match
}

export function prismaToLocalAgentType(prismaType: PrismaAgentType): LocalAgentType {
  // Map Prisma agent types to local agent types
  const mapping: Record<PrismaAgentType, LocalAgentType> = {
    [PrismaAgentType.PRODUCT_OPTIMIZATION]: LocalAgentType.PRODUCT_LEADER,
    [PrismaAgentType.CUSTOMER_SERVICE]: LocalAgentType.CUSTOMER_SUPPORT_LEADER,
    [PrismaAgentType.MARKET_RESEARCH]: LocalAgentType.MARKET_RESEARCH_LEADER,
    [PrismaAgentType.INVENTORY_MANAGEMENT]: LocalAgentType.OPERATIONS_LEADER,
    [PrismaAgentType.MARKETING_OPTIMIZATION]: LocalAgentType.SALES_LEADER,
    [PrismaAgentType.CHECKOUT_OPTIMIZATION]: LocalAgentType.PRODUCT_LEADER,
    [PrismaAgentType.FINANCIAL_ANALYSIS]: LocalAgentType.OPERATIONS_LEADER,
    [PrismaAgentType.TECHNICAL_SUPPORT]: LocalAgentType.CUSTOMER_SUPPORT_LEADER
  };
  
  return mapping[prismaType] || LocalAgentType.PRODUCT_LEADER; // Default to PRODUCT_LEADER if no match
}

export function getCorrectDepartmentType(agentType: LocalAgentType): string {
  // Map agent types to department types
  const mapping = {
    [LocalAgentType.PRODUCT_LEADER]: 'PRODUCT_MANAGEMENT',
    [LocalAgentType.CUSTOMER_SUPPORT_LEADER]: 'CUSTOMER_EXPERIENCE',
    [LocalAgentType.MARKET_RESEARCH_LEADER]: 'MARKET_INTELLIGENCE',
    [LocalAgentType.OPERATIONS_LEADER]: 'OPERATIONS',
    [LocalAgentType.SALES_LEADER]: 'SALES_MARKETING'
  };
  
  return mapping[agentType] || 'PRODUCT_MANAGEMENT'; // Default to PRODUCT_MANAGEMENT if no match
}