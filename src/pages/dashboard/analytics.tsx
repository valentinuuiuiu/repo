import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Analytics() {
  const { data, isLoading } = useQuery(["analytics"], () =>
    Promise.resolve({
      totalOrders: 1250,
      totalRevenue: 125000,
      totalProfit: 45000,
      averageOrderValue: 100,
      salesByDay: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        total_sales: Math.floor(Math.random() * 10000),
      })),
    }),
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${data?.totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${data?.totalProfit.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${data?.averageOrderValue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] relative">
            {data?.salesByDay.map((day, i) => (
              <div
                key={day.date}
                className="absolute bottom-0 bg-blue-500 w-6"
                style={{
                  height: `${(day.total_sales / 10000) * 100}%`,
                  left: `${(i / 30) * 100}%`,
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
