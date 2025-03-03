import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/lib/auth";
import { adminService } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart } from "../../components/ui/bar-chart";
import { Loader2 } from "lucide-react";
import type { RevenueStats, StoreStats, UserStats } from "@/lib/api/admin";

// Use environment variables for admin credentials
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<{
    revenue: RevenueStats;
    stores: StoreStats;
    users: UserStats;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await authService.getCurrentUser();
        
        // If no user is logged in, attempt to log in with admin credentials
        if (!user) {
          try {
            await authService.signIn(ADMIN_EMAIL, ADMIN_PASSWORD);
          } catch (loginError) {
            console.error("Admin login failed:", loginError);
            navigate("/login");
            return;
          }
        }
        
        // Verify the logged-in user is the admin
        if (user?.email !== ADMIN_EMAIL) {
          navigate("/login");
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        navigate("/login");
      }
    };
    
    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const [revenue, stores, users] = await Promise.all([
          adminService.getRevenueStats(),
          adminService.getStoreStats(),
          adminService.getUserStats()
        ]);
        
        setStats({ revenue, stores, users });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="stores">Stores</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Users</span>
                    <span className="font-bold">{stats.users.totalUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Users</span>
                    <span className="font-bold">{stats.users.activeUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversion Rate</span>
                    <span className="font-bold">{stats.users.conversionRate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Store Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Stores</span>
                    <span className="font-bold">{stats.stores.totalStores}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Stores</span>
                    <span className="font-bold">{stats.stores.activeStores}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Empty Stores</span>
                    <span className="font-bold">{stats.stores.emptyStores}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span className="font-bold">${stats.revenue.totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Tax</span>
                    <span className="font-bold">${stats.revenue.totalTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Shipping</span>
                    <span className="font-bold">${stats.revenue.totalShipping.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={stats.users.usersByRole.map(role => ({
                    name: role.role,
                    value: role._count
                  }))}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stores">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stores by Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={stats.stores.storesByPlatform.map(platform => ({
                    name: platform.platform,
                    value: platform._count
                  }))}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={stats.revenue.departmentBreakdown.map(dept => ({
                    name: dept.supplierId,
                    value: dept._sum.total
                  }))}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
