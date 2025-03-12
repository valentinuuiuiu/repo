import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Save } from "lucide-react";
import { useAuth } from "@/lib/auth/supabase-auth";

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [isLoading, setIsLoading] = useState(false);

  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    name: user?.user_metadata?.name || "",
    email: user?.email || "",
    company: user?.user_metadata?.company || "",
  });

  // Store settings
  const [storeSettings, setStoreSettings] = useState({
    storeName: "My Dropshipping Store",
    storeUrl: "https://mystore.com",
    currency: "USD",
    timezone: "America/New_York",
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    inventoryAlerts: true,
    marketingEmails: false,
    supplierUpdates: true,
  });

  // Integration settings
  const [integrationSettings, setIntegrationSettings] = useState({
    shopifyConnected: false,
    shopifyStore: "",
    shopifyApiKey: "",
    wooCommerceConnected: false,
    wooCommerceStore: "",
    wooCommerceApiKey: "",
  });

  const handleSaveAccount = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Account updated",
        description: "Your account settings have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description:
          error.message || "An error occurred while saving your settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStore = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Store settings updated",
        description: "Your store settings have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description:
          error.message || "An error occurred while saving your settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Notification preferences updated",
        description:
          "Your notification preferences have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description:
          error.message || "An error occurred while saving your settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectShopify = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIntegrationSettings({
        ...integrationSettings,
        shopifyConnected: true,
      });

      toast({
        title: "Shopify connected",
        description: "Your Shopify store has been connected successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error connecting Shopify",
        description:
          error.message || "An error occurred while connecting to Shopify",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectWooCommerce = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIntegrationSettings({
        ...integrationSettings,
        wooCommerceConnected: true,
      });

      toast({
        title: "WooCommerce connected",
        description: "Your WooCommerce store has been connected successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error connecting WooCommerce",
        description:
          error.message || "An error occurred while connecting to WooCommerce",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Tabs
        defaultValue="account"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={accountSettings.name}
                      onChange={(e) =>
                        setAccountSettings({
                          ...accountSettings,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={accountSettings.email}
                      onChange={(e) =>
                        setAccountSettings({
                          ...accountSettings,
                          email: e.target.value,
                        })
                      }
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={accountSettings.company}
                      onChange={(e) =>
                        setAccountSettings({
                          ...accountSettings,
                          company: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Change your password or reset it if you've forgotten it.
                  </p>
                  <Button variant="outline">Change Password</Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account.
                  </p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveAccount} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
              <CardDescription>
                Configure your store details and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input
                      id="storeName"
                      value={storeSettings.storeName}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          storeName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeUrl">Store URL</Label>
                    <Input
                      id="storeUrl"
                      value={storeSettings.storeUrl}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          storeUrl: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={storeSettings.currency}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          currency: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={storeSettings.timezone}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          timezone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Default Markup Rules</h3>
                  <p className="text-sm text-muted-foreground">
                    Set default markup rules for imported products.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="markupPercentage">
                        Markup Percentage
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id="markupPercentage"
                          type="number"
                          min="0"
                          defaultValue="40"
                        />
                        <span className="ml-2">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roundingRule">Price Rounding</Label>
                      <select
                        id="roundingRule"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="0.99"
                      >
                        <option value="none">No rounding</option>
                        <option value="0.99">Round to .99</option>
                        <option value="0.95">Round to .95</option>
                        <option value="whole">Round to whole number</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveStore} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="orderUpdates">Order Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about order status changes
                    </p>
                  </div>
                  <Switch
                    id="orderUpdates"
                    checked={notificationSettings.orderUpdates}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        orderUpdates: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="inventoryAlerts">Inventory Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when products are low in stock
                    </p>
                  </div>
                  <Switch
                    id="inventoryAlerts"
                    checked={notificationSettings.inventoryAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        inventoryAlerts: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails and platform updates
                    </p>
                  </div>
                  <Switch
                    id="marketingEmails"
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        marketingEmails: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="supplierUpdates">Supplier Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about supplier changes and updates
                    </p>
                  </div>
                  <Switch
                    id="supplierUpdates"
                    checked={notificationSettings.supplierUpdates}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        supplierUpdates: checked,
                      })
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveNotifications}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Platform Integrations</CardTitle>
              <CardDescription>
                Connect your store to e-commerce platforms and services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 flex items-center justify-center bg-blue-100 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-blue-600"
                        >
                          <path d="M7 10v12" />
                          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Shopify</h3>
                        <p className="text-sm text-muted-foreground">
                          Connect your Shopify store to sync products and
                          orders.
                        </p>
                      </div>
                    </div>
                    <div>
                      {integrationSettings.shopifyConnected ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Connected
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={handleConnectShopify}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            "Connect"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  {integrationSettings.shopifyConnected && (
                    <div className="mt-4 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="shopifyStore">
                            Shopify Store URL
                          </Label>
                          <Input
                            id="shopifyStore"
                            value={
                              integrationSettings.shopifyStore ||
                              "mystore.myshopify.com"
                            }
                            onChange={(e) =>
                              setIntegrationSettings({
                                ...integrationSettings,
                                shopifyStore: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shopifyApiKey">API Key</Label>
                          <Input
                            id="shopifyApiKey"
                            type="password"
                            value={
                              integrationSettings.shopifyApiKey ||
                              "••••••••••••••••"
                            }
                            onChange={(e) =>
                              setIntegrationSettings({
                                ...integrationSettings,
                                shopifyApiKey: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Sync Products
                        </Button>
                        <Button variant="outline" size="sm">
                          Sync Orders
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 flex items-center justify-center bg-purple-100 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-purple-600"
                        >
                          <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                          <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                          <path d="M12 3v6" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">WooCommerce</h3>
                        <p className="text-sm text-muted-foreground">
                          Connect your WooCommerce store to sync products and
                          orders.
                        </p>
                      </div>
                    </div>
                    <div>
                      {integrationSettings.wooCommerceConnected ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Connected
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={handleConnectWooCommerce}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            "Connect"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  {integrationSettings.wooCommerceConnected && (
                    <div className="mt-4 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="wooCommerceStore">
                            WooCommerce Store URL
                          </Label>
                          <Input
                            id="wooCommerceStore"
                            value={
                              integrationSettings.wooCommerceStore ||
                              "mystore.com"
                            }
                            onChange={(e) =>
                              setIntegrationSettings({
                                ...integrationSettings,
                                wooCommerceStore: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wooCommerceApiKey">API Key</Label>
                          <Input
                            id="wooCommerceApiKey"
                            type="password"
                            value={
                              integrationSettings.wooCommerceApiKey ||
                              "••••••••••••••••"
                            }
                            onChange={(e) =>
                              setIntegrationSettings({
                                ...integrationSettings,
                                wooCommerceApiKey: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Sync Products
                        </Button>
                        <Button variant="outline" size="sm">
                          Sync Orders
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 flex items-center justify-center bg-blue-100 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-blue-600"
                        >
                          <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" />
                          <path d="m7 16.5-4.74-2.85" />
                          <path d="m7 16.5 5-3" />
                          <path d="M7 16.5v5.17" />
                          <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" />
                          <path d="m17 16.5-5-3" />
                          <path d="m17 16.5 4.74-2.85" />
                          <path d="M17 16.5v5.17" />
                          <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" />
                          <path d="M12 8 7.26 5.15" />
                          <path d="m12 8 4.74-2.85" />
                          <path d="M12 13.5V8" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Stripe</h3>
                        <p className="text-sm text-muted-foreground">
                          Connect your Stripe account to process payments.
                        </p>
                      </div>
                    </div>
                    <div>
                      <Button variant="outline">Connect</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>
                Manage your subscription plan and billing information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">Current Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        Professional Plan - $79.99/month
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Renews on November 15, 2023
                      </p>
                    </div>
                    <Button variant="outline" asChild>
                      <a href="/checkout">Upgrade Plan</a>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Payment Method</h3>
                  <div className="flex items-center justify-between border p-4 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-16 bg-gray-100 rounded flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-gray-600"
                        >
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <line x1="2" x2="22" y1="10" y2="10" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Visa ending in 4242</p>
                        <p className="text-sm text-muted-foreground">
                          Expires 12/25
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">
                    Add Payment Method
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Billing History</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Invoice
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            Oct 15, 2023
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            Professional Plan
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            $79.99
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-800 hover:bg-green-100"
                            >
                              Paid
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Button variant="ghost" size="sm">
                              Download
                            </Button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            Sep 15, 2023
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            Professional Plan
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            $79.99
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-800 hover:bg-green-100"
                            >
                              Paid
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Button variant="ghost" size="sm">
                              Download
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
