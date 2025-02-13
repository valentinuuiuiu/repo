import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">{t('About Dropship Platform')}</h1>
            <p className="text-xl text-gray-600 mb-8">
              {t('Empowering e-commerce entrepreneurs with powerful tools to manage and scale their dropshipping business.')}
            </p>
            <Button size="lg">{t('Get Started')}</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
