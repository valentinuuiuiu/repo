import styles from "./pricing.module.css";
import PageLayout from "@/components/layout/PageLayout";

const PricingPage = () => {
  return (
    <PageLayout>
      <div className={styles.container}>
        <h1 className={styles.heading}>Pricing</h1>
        <div>
          <p>This is the pricing page content.</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default PricingPage;
