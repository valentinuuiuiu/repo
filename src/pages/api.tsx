import styles from "./api.module.css";
import { useTranslation } from 'react-i18next';

const ApiPage = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>{t('API')}</h1>
      {/* Add API content here */}
    </div>
  );
};

export default ApiPage;
