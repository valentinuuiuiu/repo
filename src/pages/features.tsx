import styles from "./features.module.css";
import PageLayout from "@/components/layout/PageLayout";

const FeaturesPage = () => {
  return (
    <PageLayout>
      <div className={styles.container}>
        <h1 className={styles.heading}>Features</h1>
        <div>
          <p>This is the features page content.</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default FeaturesPage;
