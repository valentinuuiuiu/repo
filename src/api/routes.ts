import express, { Router, Request, Response } from 'express';
import { PrismaClient, AgentType, AgentStatus } from '@prisma/client';
import OpenAI from 'openai';
import type { RequestHandler } from 'express';
import { agentApi } from './agent';

const router: Router = express.Router();
const prisma = new PrismaClient();

// Initialize OpenAI with the correct API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

// Middleware to disable caching
const nocache: RequestHandler = (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};

// Department Routes
router.get('/departments', nocache, async (_req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            products: true,
            suppliers: true,
            agents: true
          }
        },
        agents: true,
        suppliers: true,
        products: true
      }
    });

    // Transform the response to match the expected format
    const transformedDepartments = departments.map(dept => ({
      ...dept,
      stats: {
        products: dept._count.products,
        suppliers: dept._count.suppliers,
        agents: dept._count.agents
      }
    }));

    res.json(transformedDepartments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Agent Routes
router.get('/agents', nocache, (async (_req: Request, res: Response) => {
  try {
    // Call the agent API to get all agents
    const result = await agentApi.getAllAgents();
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    // Return the agents array directly for compatibility with frontend
    res.json(result.agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
}) as unknown as RequestHandler);

// Agent detail endpoint
router.get('/agents/:id', nocache, (async (req: Request, res: Response) => {
    try {
      const agent = await prisma.agent.findUnique({
        where: { id: req.params.id },
        include: {
          department: true,
          metrics: true,
          taskHistory: {
            orderBy: { timestamp: 'desc' },
            take: 10
          },
          specializations: true,
          achievements: true,
          collaborations: true
        }
      });

      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      return res.json(agent);
    } catch (error) {
      console.error('Error fetching agent:', error);
      return res.status(500).json({ error: 'Failed to fetch agent details' });
    }
  }) as unknown as RequestHandler);

// Connect to agent
router.post('/agent/connect', nocache, (async (req: Request, res: Response) => {
  try {
    const { agentType, departmentId } = req.body;
    
    if (!agentType || !Object.values(AgentType).includes(agentType)) {
      return res.status(400).json({ 
        error: `Invalid agent type. Must be one of: ${Object.values(AgentType).join(', ')}` 
      });
    }

    console.log(`Connecting to agent of type: ${agentType}`);
    
    // Check if agent exists first
    const existingAgent = await prisma.agent.findFirst({
      where: { type: agentType as AgentType }
    });

    if (!existingAgent) {
      // Create agent if it doesn't exist
      const newAgent = await prisma.agent.create({
        data: {
          type: agentType as AgentType,
          status: AgentStatus.AVAILABLE,
          name: `${agentType} Agent`,
          capabilities: [],
          departmentId: departmentId
        }
      });
      console.log(`Created new agent: ${newAgent.id}`);
    }

    // Now try to connect
    const result = await agentApi.connect({ 
      agentType: agentType as AgentType,
      departmentId 
    });
    
    if (!result.success) {
      console.log(`Connection failed: ${result.error}`);
      return res.status(500).json({ error: result.error });
    }
    
    // Update agent status to BUSY once connected
    await prisma.agent.update({
      where: { id: result.agent.id },
      data: { status: AgentStatus.BUSY }
    });
    
    console.log(`Successfully connected to agent: ${result.agent.name}`);
    return res.json(result.agent);
  } catch (error) {
    console.error('Error connecting to agent:', error);
    return res.status(500).json({ error: 'Failed to connect to agent' });
  }
}) as unknown as RequestHandler);

// Disconnect agent
router.post('/agent/disconnect', nocache, (async (req: Request, res: Response) => {
  try {
    const { agentType } = req.body;
    
    if (!agentType) {
      return res.status(400).json({ error: 'Agent type is required' });
    }
    
    console.log(`Disconnecting agent of type: ${agentType}`);
    
    // Find the agent by type
    const agent = await prisma.agent.findFirst({
      where: { type: agentType as AgentType }
    });
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Attempt to disconnect
    const result = await agentApi.disconnect(agent.id);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    // Update agent status to AVAILABLE after disconnect
    await prisma.agent.update({
      where: { id: agent.id },
      data: { status: AgentStatus.AVAILABLE }
    });
    
    return res.json({ success: true, message: 'Agent disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting agent:', error);
    return res.status(500).json({ error: 'Failed to disconnect agent' });
  }
}) as unknown as RequestHandler);

// Keep the original endpoint for direct ID access as well
router.post('/agent/disconnect/:id', nocache, (async (req: Request, res: Response) => {
  try {
    const result = await agentApi.disconnect(req.params.id);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting agent:', error);
    return res.status(500).json({ error: 'Failed to disconnect agent' });
  }
}) as unknown as RequestHandler);

// Add message endpoint with proper OpenAI configuration
router.post('/agent/message', (async (req: Request, res: Response) => {
  try {
    const { agentType, message, context } = req.body;
    
    if (!agentType || !message) {
      return res.status(400).json({ error: 'Agent type and message are required' });
    }
    
    console.log(`Processing message for agent type: ${agentType}`);
    
    // Find the agent
    const agent = await prisma.agent.findFirst({
      where: { 
        type: agentType as AgentType,
        status: AgentStatus.BUSY // Only respond if agent is connected
      },
      include: {
        department: true,
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });
    
    if (!agent) {
      return res.status(404).json({ 
        error: 'No connected agent found for this type. Please connect to an agent first.' 
      });
    }

    try {
      const startTime = Date.now();
      
      // Configure OpenAI with the agent's role and capabilities
      const systemPrompt = `You are ${agent.name}, an AI agent specializing in ${agent.type}. 
Your capabilities include: ${agent.capabilities.join(', ')}. 
You work in the ${agent.department.name} department.
Respond in a professional and helpful manner, focusing on your area of expertise.`;

      console.log(`Sending message to OpenAI with model: gpt-4`);
      
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const processingTime = Date.now() - startTime;
      const response = completion.choices[0]?.message?.content || 'No response generated';
      
      console.log(`Received response from OpenAI in ${processingTime}ms`);
      
      // Update agent metrics
      const metrics = agent.metrics[0];
      if (metrics) {
        await prisma.agentMetrics.update({
          where: { id: metrics.id },
          data: {
            totalInteractions: metrics.totalInteractions + 1,
            successfulInteractions: metrics.successfulInteractions + 1,
            averageResponseTime: (metrics.averageResponseTime * metrics.totalInteractions + processingTime) / (metrics.totalInteractions + 1),
            lastActive: new Date()
          }
        });
      }

      // Return the response
      return res.json({
        id: `msg-${Date.now()}`,
        agentId: agent.id,
        agentType: agent.type,
        timestamp: new Date(),
        input: message,
        output: response,
        confidence: completion.choices[0]?.finish_reason === 'stop' ? 1.0 : 0.8,
        metadata: {
          ...context,
          processingTime,
          model: "gpt-4"
        }
      });

    } catch (aiError) {
      console.error('Error calling OpenAI:', aiError);
      
      // Update metrics to reflect the error
      const metrics = agent.metrics[0];
      if (metrics) {
        await prisma.agentMetrics.update({
          where: { id: metrics.id },
          data: {
            totalInteractions: metrics.totalInteractions + 1,
            errorRate: (metrics.errorRate * metrics.totalInteractions + 1) / (metrics.totalInteractions + 1),
            lastActive: new Date()
          }
        });
      }

      throw new Error('Failed to generate response');
    }
    
  } catch (error) {
    console.error('Error processing agent message:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to process message' 
    });
  }
}) as unknown as RequestHandler);

// Product Routes
router.get('/products', nocache, (async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          skip,
          take: limit,
          include: {
            supplier: true,
            department: true,
            variants: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.product.count()
      ]);

      return res.json({
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
  }) as unknown as RequestHandler);

// Supplier Routes
router.get('/suppliers', nocache, (async (_req: Request, res: Response) => {
    try {
      const suppliers = await prisma.supplier.findMany({
        include: {
          products: true,
          department: true
        }
      });
      return res.json(suppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
  }) as unknown as RequestHandler);

// Customer Routes
router.get('/customers', nocache, (async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          skip,
          take: limit,
          include: {
            orders: true,
            customerInteractions: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.customer.count()
      ]);

      return res.json({
        customers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
      return res.status(500).json({ error: 'Failed to fetch customers' });
    }
  }) as unknown as RequestHandler);

// Order Routes
router.get('/orders', nocache, (async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          skip,
          take: limit,
          include: {
            customer: true,
            items: {
              include: {
                product: true
              }
            },
            supplier: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.order.count()
      ]);

      return res.json({
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }) as unknown as RequestHandler);

// Analytics Routes
router.get('/analytics/overview', nocache, (async (_req: Request, res: Response) => {
    try {
      const [totalProducts, totalOrders, totalCustomers, totalRevenue] = await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.customer.count(),
        prisma.order.aggregate({
          _sum: {
            total: true
          }
        })
      ]);

      return res.json({
        metrics: {
          totalProducts,
          totalOrders,
          totalCustomers,
          totalRevenue: totalRevenue._sum?.total || 0
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }) as unknown as RequestHandler);

export default router;