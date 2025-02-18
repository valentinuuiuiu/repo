import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Platform = {
  id: string;
  name: string;
  connected: boolean;
  icon: string;
};

type Supplier = {
  id: string;
  name: string;
  connected: boolean;
  icon: string;
};

export default function Integrations() {
  const [platforms] = useState<Platform[]>([
    { id: "shopify", name: "Shopify", connected: false, icon: "🛍️" },
    { id: "woocommerce", name: "WooCommerce", connected: false, icon: "🛒" },
    { id: "ebay", name: "eBay", connected: false, icon: "📦" },
    { id: "etsy", name: "Etsy", connected: false, icon: "🎨" },
    { id: "amazon", name: "Amazon", connected: false, icon: "📚" },
  ]);

  const [suppliers] = useState<Supplier[]>([
    { id: "alibaba", name: "Alibaba", connected: false, icon: "🌏" },
    { id: "aliexpress", name: "AliExpress", connected: false, icon: "🌐" },
    { id: "temu", name: "Temu", connected: false, icon: "🛍️" },
  ]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Integrations</h1>

      <Tabs defaultValue="platforms">
        <TabsList>
          <TabsTrigger value="platforms">Sales Platforms</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <Card key={platform.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>{platform.icon}</span>
                    {platform.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!platform.connected ? (
                      <Button className="w-full">
                        Connect {platform.name}
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <Input type="password" value="****" readOnly />
                        </div>
                        <Button variant="destructive" className="w-full">
                          Disconnect
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suppliers">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <Card key={supplier.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>{supplier.icon}</span>
                    {supplier.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!supplier.connected ? (
                      <Button className="w-full">
                        Connect {supplier.name}
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <Input type="password" value="****" readOnly />
                        </div>
                        <Button variant="destructive" className="w-full">
                          Disconnect
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
