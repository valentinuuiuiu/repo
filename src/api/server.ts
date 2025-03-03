import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';
import { PrismaClient, AgentType, AgentStatus } from '@prisma/client';

const app = express();
const PORT = process.env.API_PORT || 3006; // Changed from 3005 to 3006
const prisma = new PrismaClient();

// Configure CORS with specific options
const corsOptions = {
  origin: ['http://localhost:5174', 'http://localhost:3006', '*'], // Updated to allow any origin for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Disable caching for all routes
app.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Debug middleware - log requests for troubleshooting
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Function to ensure agents are available on startup
async function ensureAgentsAvailable() {
  try {
    console.log('Checking for agent availability on startup...');
    
    // Check for CUSTOMER_SERVICE agent
    const customerServiceAgent = await prisma.agent.findFirst({
      where: {
        type: AgentType.CUSTOMER_SERVICE
      }
    });

    if (customerServiceAgent) {
      // Reset agent to AVAILABLE status
      await prisma.agent.update({
        where: { id: customerServiceAgent.id },
        data: { status: AgentStatus.AVAILABLE }
      });
      console.log(`Reset agent ${customerServiceAgent.name} to AVAILABLE status`);
    } else {
      console.log('No CUSTOMER_SERVICE agent found. Run scripts/ensure-agent-available.ts to create one.');
    }

    // Check for other agents that might be stuck in BUSY status
    const busyAgents = await prisma.agent.findMany({
      where: {
        status: AgentStatus.BUSY
      }
    });

    if (busyAgents.length > 0) {
      console.log(`Found ${busyAgents.length} agents stuck in BUSY status. Resetting...`);
      
      for (const agent of busyAgents) {
        await prisma.agent.update({
          where: { id: agent.id },
          data: { status: AgentStatus.AVAILABLE }
        });
        console.log(`Reset agent ${agent.name} to AVAILABLE status`);
      }
    }
  } catch (error) {
    console.error('Error ensuring agent availability:', error);
  }
}

// Start server and ensure agents are available
app.listen(PORT, async () => {
  console.log(`API Server running on port ${PORT}`);
  await ensureAgentsAvailable();
});