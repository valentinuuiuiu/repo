import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Simple chart implementation without external dependencies
const SimpleBarChart = ({ data }: { data: any[] }) => (
  <div className="relative h-[300px] w-full">
    {data.map((item, index) => (
      <div
        key={index}
        className="absolute bottom-0 bg-blue-500 w-8 transition-all duration-500"
        style={{
          height: `${(item.total_sales / Math.max(...data.map((d) => d.total_sales))) * 100}%`,
          left: `${(index / data.length) * 100}%`,
        }}
      />
    ))}
  </div>
);

export default function Analytics() {
  const { data, isLoading } = useQuery(["analytics"], () =>
    analyticsService.getDashboardStats("store_id", {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
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
          <SimpleBarChart data={data?.salesByDay || []} />
        </CardContent>
      </Card>
    </div>
  );
}
