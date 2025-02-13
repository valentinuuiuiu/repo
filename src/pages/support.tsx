import styles from "./support.module.css";
import { useTranslation } from 'react-i18next';

const SupportPage = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>{t('Support')}</h1>
      {/* Add support content here */}
    </div>
  );
};

export default SupportPage;
