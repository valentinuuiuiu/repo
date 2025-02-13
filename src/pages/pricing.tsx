import styles from "./pricing.module.css";
import PageLayout from "@/components/layout/PageLayout";
import { useTranslation } from 'react-i18next';

const PricingPage = () => {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <div className={styles.container}>
        <h1 className={styles.heading}>{t('Pricing')}</h1>
        <div>
          <p>{t('This is the pricing page content.')}</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default PricingPage;
