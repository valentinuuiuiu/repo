import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import styles from "./analytics.module.css";
import { useTranslation } from 'react-i18next';
import React, { useEffect } from "react";
import i18n from '../../lib/i18n';

export default function Analytics() {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.totalOrders')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1250</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.totalRevenue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$125,000.00</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.totalProfit')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$45,000.00</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.averageOrderValue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$100.00</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('analytics.salesOverTime')}</CardTitle>
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
