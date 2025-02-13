import React from 'react';
import styles from './contact-us.module.css';
import PageLayout from "@/components/layout/PageLayout";

const ContactUsPage: React.FC = () => {
  return (
    <PageLayout>
      <div className={styles.container}>
        <h1 className={styles.heading}>Contact Us</h1>
        <p>Placeholder content for Contact Us page.</p>
      </div>
    </PageLayout>
  );
};

export default ContactUsPage;
