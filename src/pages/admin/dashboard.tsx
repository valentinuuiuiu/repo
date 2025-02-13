import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import styles from "./dashboard.module.css";

const ADMIN_EMAIL = "ionutbaltag3@gmail.com";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeStores: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const checkAdmin = async () => {
      const user = await authService.getCurrentUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        navigate("/login");
      }
    };
    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersResponse, storesResponse, revenueResponse] = await Promise.all([
          fetch('/api/admin/stats/users'),
          fetch('/api/admin/stats/stores'),
          fetch('/api/admin/stats/revenue')
        ]);

        const [usersData, storesData, revenueData] = await Promise.all([
          usersResponse.json(),
          storesResponse.json(),
          revenueResponse.json()
        ]);

        setStats({
          totalUsers: usersData.count,
          activeStores: storesData.count,
          totalRevenue: revenueData.amount
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="stores">Stores</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Active Stores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.activeStores}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>{/* Add user management table here */}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stores">
          <Card>
            <CardHeader>
              <CardTitle>Store Management</CardTitle>
            </CardHeader>
            <CardContent>{/* Add store management table here */}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
            </CardHeader>
            <CardContent>{/* Add settings form here */}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
