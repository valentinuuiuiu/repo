import React from 'react';
import styles from './contact-us.module.css';
import PageLayout from "@/components/layout/PageLayout";
import { useTranslation } from 'react-i18next';

const ContactUsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <div className={styles.container}>
        <h1 className={styles.heading}>{t('Contact Us')}</h1>
        <p>{t('Placeholder content for Contact Us page.')}</p>
      </div>
    </PageLayout>
  );
};

export default ContactUsPage;
