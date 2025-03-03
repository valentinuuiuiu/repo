import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DropshippingPipeline, schemas } from '@/lib/ai/dropshipping-pipeline';

export const DropshippingPipelineManager: React.FC = () => {
  const [pipeline] = useState(() => new DropshippingPipeline());
  const [pendingApprovals, setPendingApprovals] = useState(pipeline.getPendingApprovals());

  const handleApproval = useCallback(async (approvalId: string, decision: 'approved' | 'rejected') => {
    try {
      await pipeline.handleHumanApproval(approvalId, decision, 'admin');
      // Refresh pending approvals
      setPendingApprovals(pipeline.getPendingApprovals());
    } catch (error) {
      console.error('Approval handling failed:', error);
      // TODO: Add error toast or notification
    }
  }, [pipeline]);

  // Demo methods to trigger workflows
  const triggerProductSourcing = useCallback(() => {
    const demoProduct = {
      id: `product-${Date.now()}`,
      name: 'Smart Home Camera',
      supplier: 'tech-supplier',
      price: 79.99,
      inventory: 0,
      status: 'pending'
    };

    pipeline.sourcingWorkflow(demoProduct);
    setPendingApprovals(pipeline.getPendingApprovals());
  }, [pipeline]);

  const triggerOrderProcessing = useCallback(() => {
    const demoOrder = {
      id: `order-${Date.now()}`,
      customerId: 'customer123',
      products: [
        {
          id: 'product1',
          name: 'Wireless Earbuds',
          supplier: 'problematic-supplier',
          price: 49.99,
          inventory: 0,
          status: 'pending'
        }
      ],
      totalPrice: 49.99,
      status: 'pending'
    };

    pipeline.orderProcessingWorkflow(demoOrder);
    setPendingApprovals(pipeline.getPendingApprovals());
  }, [pipeline]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dropshipping Pipeline Manager</h1>

      <Tabs defaultValue="approvals" className="mb-6">
        <TabsList>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="workflows">Workflow Triggers</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <p className="text-gray-500">No pending approvals</p>
              ) : (
                pendingApprovals.map((approval) => (
                  <Card key={approval.id} className="mb-4">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>{approval.requiredAction}</CardTitle>
                        <Badge 
                          variant={
                            approval.status === 'pending' 
                              ? 'outline' 
                              : approval.status === 'approved' 
                                ? 'default' 
                                : 'destructive'
                          }
                        >
                          {approval.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-100 p-3 rounded text-sm mb-4 overflow-x-auto">
                        {JSON.stringify(approval.data, null, 2)}
                      </pre>
                      <div className="flex space-x-4">
                        <Button 
                          variant="default" 
                          onClick={() => handleApproval(approval.id, 'approved')}
                          disabled={approval.status !== 'pending'}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => handleApproval(approval.id, 'rejected')}
                          disabled={approval.status !== 'pending'}
                        >
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Triggers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Sourcing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Trigger a product sourcing workflow with a demo product.</p>
                    <Button onClick={triggerProductSourcing}>
                      Start Product Sourcing
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Order Processing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Trigger an order processing workflow with a demo order.</p>
                    <Button onClick={triggerOrderProcessing}>
                      Start Order Processing
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};