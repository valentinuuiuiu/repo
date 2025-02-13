import styles from "./features.module.css";
import PageLayout from "@/components/layout/PageLayout";
import { useTranslation } from 'react-i18next';

const FeaturesPage = () => {
  const { t } = useTranslation();

  const features = [
    {
      image: '/vite.svg',
      title: 't(Feature 1 Title)',
      description: 't(Feature 1 Description)'
    },
    {
      image: '/vite.svg',
      title: 't(Feature 2 Title)',
      description: 't(Feature 2 Description)'
    },
    // ... more features
  ];

  return (
    <PageLayout>
      <div className={styles.featuresContainer}>
        <h1 className={styles.featuresHeading}>{t('Features')}</h1>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <img src={feature.image} alt={feature.title} className={styles.featureImage} />
              <h3 className={styles.featureTitle}>{t(feature.title)}</h3>
              <p className={styles.featureDescription}>{t(feature.description)}</p>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default FeaturesPage;
