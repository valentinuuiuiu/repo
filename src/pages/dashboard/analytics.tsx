import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import styles from "./analytics.module.css";

export default function Analytics() {
  return (
    <div className={styles.container}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1250</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$125,000.00</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$45,000.00</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$100.00</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`h-[300px] relative ${styles.chartContainer}`}>
            {Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              total_sales: Math.floor(Math.random() * 10000),
            })).map((day, i) => (
              <div
                key={day.date}
                className={styles.bar}
                style={{
                  height: `${(day.total_sales / 10000) * 100}%`,
                  left: `${(i / 30) * 100}%`,
                  borderRadius: '4px'
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
